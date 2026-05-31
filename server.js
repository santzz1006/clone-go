import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";
import { createSessionToken, getBearerToken, hashPassword, verifyPassword, verifySessionToken } from "./server/auth.js";
import { calculateAmountCents, normalizeCheckoutItems } from "./server/catalog.js";
import { confirmPixPayment, createUserAccount, findUserByEmail } from "./server/supabase.js";
import { createPixCashIn, getTransactionStatus, isPaidStatus } from "./server/syncpay.js";
import { createCheckoutOrder } from "./server/supabase.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "1mb" }));
app.use((request, response, next) => {
  const allowedOrigins = new Set([
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    "http://localhost:3000",
  ]);
  const origin = request.headers.origin;
  if (allowedOrigins.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }

  next();
});
app.use(express.static(__dirname));

function onlyDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

function validateCustomer(customer = {}) {
  const normalized = {
    name: String(customer.name || "").trim(),
    email: String(customer.email || "").trim().toLowerCase(),
    phone: String(customer.phone || "").trim(),
    cpf: onlyDigits(customer.cpf || customer.document || ""),
  };

  if (!normalized.name) throw new Error("Nome completo e obrigatorio.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) throw new Error("E-mail invalido.");
  if (normalized.cpf.length !== 11) throw new Error("CPF precisa ter 11 digitos.");

  return normalized;
}

function normalizeError(error) {
  return {
    error: error.message || "Erro inesperado.",
    status: error.status || 500,
    details: error.body || error.cause?.message || null,
  };
}

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/auth/register", async (request, response) => {
  try {
    const name = String(request.body.name || "").trim();
    const email = String(request.body.email || "").trim().toLowerCase();
    const password = String(request.body.password || "");

    if (!name) throw new Error("Nome e obrigatorio.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("E-mail invalido.");
    if (password.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");

    const user = await createUserAccount({
      name,
      email,
      passwordHash: hashPassword(password),
    });
    const token = createSessionToken(user);

    response.status(201).json({
      ok: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "customer",
      },
    });
  } catch (error) {
    const normalized = normalizeError(error);
    response.status(normalized.status >= 400 && normalized.status < 600 ? normalized.status : 500).json(normalized);
  }
});

app.post("/api/auth/login", async (request, response) => {
  try {
    const email = String(request.body.email || "").trim().toLowerCase();
    const password = String(request.body.password || "");
    const user = await findUserByEmail(email);

    if (!user?.password_hash || !verifyPassword(password, user.password_hash)) {
      const error = new Error("E-mail ou senha invalidos.");
      error.status = 401;
      throw error;
    }

    const token = createSessionToken(user);
    response.json({
      ok: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf_digits,
        role: user.role || "customer",
      },
    });
  } catch (error) {
    const normalized = normalizeError(error);
    response.status(normalized.status >= 400 && normalized.status < 600 ? normalized.status : 500).json(normalized);
  }
});

app.get("/api/auth/me", (request, response) => {
  const session = verifySessionToken(getBearerToken(request));
  if (!session) {
    response.status(401).json({ error: "Login necessario.", status: 401 });
    return;
  }

  response.json({ ok: true, user: session });
});

app.post("/api/checkout/pix", async (request, response) => {
  try {
    const session = verifySessionToken(getBearerToken(request));
    if (!session) {
      response.status(401).json({ error: "Entre na sua conta para finalizar a compra.", status: 401 });
      return;
    }

    const customer = validateCustomer(request.body.customer);
    if (customer.email !== String(session.email || "").toLowerCase()) {
      response.status(403).json({ error: "Use no checkout o mesmo e-mail da conta logada.", status: 403 });
      return;
    }

    const items = normalizeCheckoutItems(request.body.items);
    const amountCents = calculateAmountCents(items);

    const pix = await createPixCashIn({
      amountCents,
      customer,
      description: items.map((item) => item.name).join(", "),
      webhookUrl: `${(process.env.SITE_URL || `http://localhost:${port}`).replace(/\/+$/, "")}/api/syncpay/webhook`,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(pix.pixCode, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 280,
    });

    const orderId = await createCheckoutOrder({
      customer,
      items: items.map(({ product_id, quantity }) => ({ product_id, quantity })),
      briefing: request.body.briefing || {},
      pix: {
        identifier: pix.identifier,
        pixCode: pix.pixCode,
        qrCodeDataUrl,
      },
    });

    response.status(201).json({
      ok: true,
      orderId,
      identifier: pix.identifier,
      pixCode: pix.pixCode,
      qrCodeDataUrl,
      amountCents,
      amount: amountCents / 100,
    });
  } catch (error) {
    const normalized = normalizeError(error);
    response.status(normalized.status >= 400 && normalized.status < 600 ? normalized.status : 500).json(normalized);
  }
});

app.get("/api/payments/:identifier", async (request, response) => {
  try {
    const statusPayload = await getTransactionStatus(request.params.identifier);
    let orderId = null;

    if (isPaidStatus(statusPayload)) {
      orderId = await confirmPixPayment(request.params.identifier, statusPayload);
    }

    response.json({
      ok: true,
      paid: isPaidStatus(statusPayload),
      orderId,
      status: statusPayload,
    });
  } catch (error) {
    const normalized = normalizeError(error);
    response.status(normalized.status >= 400 && normalized.status < 600 ? normalized.status : 500).json(normalized);
  }
});

app.post("/api/syncpay/webhook", async (request, response) => {
  try {
    const payload = request.body || {};
    const identifier =
      payload.identifier ||
      payload.idTransaction ||
      payload.transaction_id ||
      payload.data?.identifier ||
      payload.data?.idTransaction;

    if (identifier && isPaidStatus(payload)) {
      await confirmPixPayment(identifier, payload);
    }

    response.json({ ok: true });
  } catch (error) {
    const normalized = normalizeError(error);
    response.status(normalized.status >= 400 && normalized.status < 600 ? normalized.status : 500).json(normalized);
  }
});

app.listen(port, () => {
  console.log(`CloneGo rodando em http://localhost:${port}`);
});

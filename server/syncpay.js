let tokenCache = {
  accessToken: null,
  expiresAt: 0,
};

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variavel ${name} nao configurada.`);
  }
  return value;
}

function syncpayUrl(path) {
  const baseUrl = requiredEnv("SYNCPAY_BASE_URL").replace(/\/+$/, "");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function syncpayFetch(path, options = {}) {
  let response;
  try {
    response = await fetch(syncpayUrl(path), {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    const detail = error.cause?.code || error.cause?.message || error.message;
    throw new Error(`Nao foi possivel conectar na Syncpay (${detail}).`);
  }
  const body = await readJsonResponse(response);

  if (!response.ok) {
    const detail = body?.message || body?.error || body?.raw || `HTTP ${response.status}`;
    const error = new Error(`Syncpay recusou a requisicao: ${detail}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

export async function getSyncpayToken() {
  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt > now + 30000) {
    return tokenCache.accessToken;
  }

  const authPath = process.env.SYNCPAY_AUTH_PATH || "/api/partner/v1/auth-token";
  const body = await syncpayFetch(authPath, {
    method: "POST",
    body: JSON.stringify({
      client_id: requiredEnv("SYNCPAY_CLIENT_ID"),
      client_secret: requiredEnv("SYNCPAY_CLIENT_SECRET"),
    }),
  });

  const accessToken = body?.access_token || body?.token || body?.data?.access_token;
  if (!accessToken) {
    throw new Error("Syncpay nao retornou access_token.");
  }

  const expiresInSeconds = Number(body?.expires_in || body?.expiresIn || 3000);
  tokenCache = {
    accessToken,
    expiresAt: now + expiresInSeconds * 1000,
  };

  return accessToken;
}

export async function createPixCashIn({ amountCents, customer, description, webhookUrl }) {
  const token = await getSyncpayToken();
  const cashinPath = process.env.SYNCPAY_CASHIN_PATH || "/api/partner/v1/cash-in";
  const amount = Number((amountCents / 100).toFixed(2));
  const body = await syncpayFetch(cashinPath, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount,
      description: description || "Pedido CloneGo",
      webhook_url: webhookUrl,
      client: {
        name: customer.name,
        cpf: customer.cpf,
        email: customer.email,
        phone: String(customer.phone || "").replace(/\D/g, ""),
      },
    }),
  });

  const pixCode = body?.pix_code || body?.paymentCode || body?.data?.pix_code || body?.data?.paymentCode;
  const identifier = body?.identifier || body?.idTransaction || body?.data?.identifier || body?.data?.idTransaction;

  if (!pixCode || !identifier) {
    throw new Error("Syncpay nao retornou pix_code/identifier.");
  }

  return {
    raw: body,
    pixCode,
    identifier,
  };
}

export async function getTransactionStatus(identifier) {
  if (!identifier) {
    throw new Error("Identifier da transacao e obrigatorio.");
  }

  const token = await getSyncpayToken();
  const transactionPath = process.env.SYNCPAY_TRANSACTION_PATH || "/api/partner/v1/transaction";
  return syncpayFetch(`${transactionPath.replace(/\/+$/, "")}/${encodeURIComponent(identifier)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function isPaidStatus(payload) {
  const status = String(
    payload?.status ||
      payload?.transaction_status ||
      payload?.payment_status ||
      payload?.data?.status ||
      payload?.data?.transaction_status ||
      "",
  ).toLowerCase();

  return ["paid", "confirmed", "success", "approved", "completed", "liquidated"].includes(status);
}

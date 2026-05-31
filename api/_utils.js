import "dotenv/config";

const allowedLocalOrigins = new Set([
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:5501",
  "http://localhost:5501",
  "http://localhost:3000",
]);

export function setCors(request, response) {
  const origin = request.headers.origin;
  if (allowedLocalOrigins.has(origin) || origin === process.env.SITE_URL) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return true;
  }

  return false;
}

export async function readBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") return JSON.parse(request.body || "{}");

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

export function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

export function sendError(response, error) {
  const status = error.status >= 400 && error.status < 600 ? error.status : 500;
  sendJson(response, status, {
    error: error.message || "Erro inesperado.",
    status,
    details: error.body || error.cause?.message || null,
  });
}

export function requireMethod(request, response, method) {
  if (request.method === method) return true;

  response.setHeader("Allow", method);
  sendJson(response, 405, {
    error: `Metodo ${request.method} nao permitido.`,
    status: 405,
  });
  return false;
}

export function onlyDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

export function validateCustomer(customer = {}) {
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

export function publicBaseUrl(request) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");

  const protocol = request.headers["x-forwarded-proto"] || "https";
  const host = request.headers["x-forwarded-host"] || request.headers.host;
  return `${protocol}://${host}`;
}

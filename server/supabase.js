function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variavel ${name} nao configurada.`);
  }
  return value;
}

function supabaseHeaders(extra = {}) {
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
    ...extra,
  };
}

function supabaseUrl(path) {
  return `${requiredEnv("SUPABASE_URL").replace(/\/+$/, "")}${path}`;
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

async function supabaseRequest(path, options = {}) {
  const response = await fetch(supabaseUrl(path), {
    ...options,
    headers: supabaseHeaders(options.headers),
  });
  const body = await readJsonResponse(response);

  if (!response.ok) {
    const detail = body?.message || body?.details || body?.hint || body?.raw || `HTTP ${response.status}`;
    const error = new Error(`Supabase recusou a requisicao: ${detail}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

export async function findUserByEmail(email) {
  const query = new URLSearchParams({
    email: `eq.${String(email).trim().toLowerCase()}`,
    select: "id,name,email,phone,cpf_digits,password_hash,role,is_guest,created_at",
    limit: "1",
  });
  const body = await supabaseRequest(`/rest/v1/users?${query.toString()}`, {
    method: "GET",
  });

  return Array.isArray(body) ? body[0] || null : null;
}

export async function createUserAccount({ name, email, passwordHash }) {
  const existing = await findUserByEmail(email);
  if (existing?.password_hash) {
    const error = new Error("Este e-mail ja tem cadastro. Entre com sua senha.");
    error.status = 409;
    throw error;
  }

  if (existing) {
    const body = await supabaseRequest(`/rest/v1/users?id=eq.${encodeURIComponent(existing.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        name,
        email,
        password_hash: passwordHash,
        is_guest: false,
      }),
    });
    return Array.isArray(body) ? body[0] : body;
  }

  const body = await supabaseRequest("/rest/v1/users", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password_hash: passwordHash,
      role: "customer",
      is_guest: false,
    }),
  });

  return Array.isArray(body) ? body[0] : body;
}

export async function createCheckoutOrder({ customer, items, briefing, pix }) {
  const body = await supabaseRequest("/rest/v1/rpc/create_checkout_order", {
    method: "POST",
    body: JSON.stringify({
      p_customer: customer,
      p_items: items,
      p_briefing: briefing || {},
      p_cart_id: null,
      p_pix_txid: pix.identifier,
      p_pix_qr_code: pix.qrCodeDataUrl || null,
      p_pix_copy_paste: pix.pixCode,
      p_pix_expires_at: pix.expiresAt || null,
    }),
  });

  return Array.isArray(body) ? body[0] : body;
}

export async function confirmPixPayment(identifier, rawPayload = {}) {
  const body = await supabaseRequest("/rest/v1/rpc/confirm_pix_payment", {
    method: "POST",
    body: JSON.stringify({
      p_pix_txid: identifier,
      p_provider_reference: identifier,
      p_raw_payload: rawPayload,
    }),
  });

  return Array.isArray(body) ? body[0] : body;
}

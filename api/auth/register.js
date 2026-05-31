import { createSessionToken, hashPassword } from "../../server/auth.js";
import { createUserAccount } from "../../server/supabase.js";
import { readBody, requireMethod, sendError, sendJson, setCors } from "../_utils.js";

export default async function handler(request, response) {
  if (setCors(request, response)) return;
  if (!requireMethod(request, response, "POST")) return;

  try {
    const body = await readBody(request);
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name) throw new Error("Nome e obrigatorio.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("E-mail invalido.");
    if (password.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");

    const user = await createUserAccount({
      name,
      email,
      passwordHash: hashPassword(password),
    });

    sendJson(response, 201, {
      ok: true,
      token: createSessionToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "customer",
      },
    });
  } catch (error) {
    sendError(response, error);
  }
}

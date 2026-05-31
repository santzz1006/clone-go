import { createSessionToken, verifyPassword } from "../../server/auth.js";
import { findUserByEmail } from "../../server/supabase.js";
import { readBody, requireMethod, sendError, sendJson, setCors } from "../_utils.js";

export default async function handler(request, response) {
  if (setCors(request, response)) return;
  if (!requireMethod(request, response, "POST")) return;

  try {
    const body = await readBody(request);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const user = await findUserByEmail(email);

    if (!user?.password_hash || !verifyPassword(password, user.password_hash)) {
      const error = new Error("E-mail ou senha invalidos.");
      error.status = 401;
      throw error;
    }

    sendJson(response, 200, {
      ok: true,
      token: createSessionToken(user),
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
    sendError(response, error);
  }
}

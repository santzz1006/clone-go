import { getBearerToken, verifySessionToken } from "../../server/auth.js";
import { requireMethod, sendJson, setCors } from "../_utils.js";

export default function handler(request, response) {
  if (setCors(request, response)) return;
  if (!requireMethod(request, response, "GET")) return;

  const session = verifySessionToken(getBearerToken(request));
  if (!session) {
    sendJson(response, 401, { error: "Login necessario.", status: 401 });
    return;
  }

  sendJson(response, 200, { ok: true, user: session });
}

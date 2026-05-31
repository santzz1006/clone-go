import { confirmPixPayment } from "../../server/supabase.js";
import { isPaidStatus } from "../../server/syncpay.js";
import { readBody, requireMethod, sendError, sendJson, setCors } from "../_utils.js";

export default async function handler(request, response) {
  if (setCors(request, response)) return;
  if (!requireMethod(request, response, "POST")) return;

  try {
    const payload = await readBody(request);
    const identifier =
      payload.identifier ||
      payload.idTransaction ||
      payload.transaction_id ||
      payload.data?.identifier ||
      payload.data?.idTransaction;

    if (identifier && isPaidStatus(payload)) {
      await confirmPixPayment(identifier, payload);
    }

    sendJson(response, 200, { ok: true });
  } catch (error) {
    sendError(response, error);
  }
}

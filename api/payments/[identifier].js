import { confirmPixPayment } from "../../server/supabase.js";
import { getTransactionStatus, isPaidStatus } from "../../server/syncpay.js";
import { requireMethod, sendError, sendJson, setCors } from "../_utils.js";

export default async function handler(request, response) {
  if (setCors(request, response)) return;
  if (!requireMethod(request, response, "GET")) return;

  try {
    const identifier = Array.isArray(request.query.identifier) ? request.query.identifier[0] : request.query.identifier;
    const statusPayload = await getTransactionStatus(identifier);
    const paid = isPaidStatus(statusPayload);
    const orderId = paid ? await confirmPixPayment(identifier, statusPayload) : null;

    sendJson(response, 200, {
      ok: true,
      paid,
      orderId,
      status: statusPayload,
    });
  } catch (error) {
    sendError(response, error);
  }
}

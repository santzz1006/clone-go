import QRCode from "qrcode";
import { getBearerToken, verifySessionToken } from "../../server/auth.js";
import { calculateAmountCents, normalizeCheckoutItems } from "../../server/catalog.js";
import { createCheckoutOrder } from "../../server/supabase.js";
import { createPixCashIn } from "../../server/syncpay.js";
import { publicBaseUrl, readBody, requireMethod, sendError, sendJson, setCors, validateCustomer } from "../_utils.js";

export default async function handler(request, response) {
  if (setCors(request, response)) return;
  if (!requireMethod(request, response, "POST")) return;

  try {
    const session = verifySessionToken(getBearerToken(request));
    if (!session) {
      sendJson(response, 401, { error: "Entre na sua conta para finalizar a compra.", status: 401 });
      return;
    }

    const body = await readBody(request);
    const customer = validateCustomer(body.customer);
    if (customer.email !== String(session.email || "").toLowerCase()) {
      sendJson(response, 403, { error: "Use no checkout o mesmo e-mail da conta logada.", status: 403 });
      return;
    }

    const items = normalizeCheckoutItems(body.items);
    const amountCents = calculateAmountCents(items);
    const pix = await createPixCashIn({
      amountCents,
      customer,
      description: items.map((item) => item.name).join(", "),
      webhookUrl: `${publicBaseUrl(request)}/api/syncpay/webhook`,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(pix.pixCode, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 280,
    });
    const orderId = await createCheckoutOrder({
      customer,
      items: items.map(({ product_id, quantity }) => ({ product_id, quantity })),
      briefing: body.briefing || {},
      pix: {
        identifier: pix.identifier,
        pixCode: pix.pixCode,
        qrCodeDataUrl,
      },
    });

    sendJson(response, 201, {
      ok: true,
      orderId,
      identifier: pix.identifier,
      pixCode: pix.pixCode,
      qrCodeDataUrl,
      amountCents,
      amount: amountCents / 100,
    });
  } catch (error) {
    sendError(response, error);
  }
}

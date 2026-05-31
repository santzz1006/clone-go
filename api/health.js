import { sendJson, setCors } from "./_utils.js";

export default function handler(request, response) {
  if (setCors(request, response)) return;
  sendJson(response, 200, { ok: true });
}

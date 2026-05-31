export const catalog = {
  basic: {
    id: "basic",
    name: "Basic Code Pack",
    price: 39.9,
  },
  plus: {
    id: "plus",
    name: "Plus Plan Structured",
    price: 69.9,
  },
  premium: {
    id: "premium",
    name: "Premium Custom Clone",
    price: 99.9,
  },
  mobile: {
    id: "mobile",
    name: "Mobile Optimization",
    price: 19.9,
  },
  checkout: {
    id: "checkout",
    name: "Checkout Setup",
    price: 29.9,
  },
  whatsapp: {
    id: "whatsapp",
    name: "2 Sites Clone Pack",
    price: 139.9,
  },
  speed: {
    id: "speed",
    name: "Speed Optimization",
    price: 35.9,
  },
  pixel: {
    id: "pixel",
    name: "Tracking Pixel Structure",
    price: 25.9,
  },
};

export function normalizeCheckoutItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("O carrinho precisa ter pelo menos um item.");
  }

  return items.map((item) => {
    const productId = String(item.product_id || item.id || "").trim();
    const product = catalog[productId];
    if (!product) {
      throw new Error(`Produto invalido: ${productId || "sem id"}.`);
    }

    const quantity = Math.max(Number.parseInt(item.quantity || item.qty || 1, 10), 1);
    return {
      product_id: product.id,
      quantity,
      name: product.name,
      unit_price: product.price,
      total: Number((product.price * quantity).toFixed(2)),
    };
  });
}

export function calculateAmountCents(items) {
  const total = items.reduce((sum, item) => sum + item.total, 0);
  return Math.round(total * 100);
}

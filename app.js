const products = {
  basic: {
    id: "basic",
    name: "Basic Code Pack",
    type: "plan",
    tag: "Plano",
    price: 39.9,
    description: "Clone bruto em HTML, CSS e JS com assets e guia basico de configuracao.",
    delivery: "3h",
    scope: "Arquivos brutos",
    details: [
      "Entrega arquivos HTML, CSS e JS em formato direto.",
      "Inclui assets principais usados na pagina clonada.",
      "Ideal para quem sabe editar codigo manualmente.",
      "Inclui guia basico de configuracao.",
    ],
  },
  plus: {
    id: "plus",
    name: "Plus Plan Structured",
    type: "plan",
    tag: "Plano",
    price: 69.9,
    description: "Codigo organizado, responsivo, refatorado e separado em pastas editaveis.",
    delivery: "3h",
    scope: "Codigo estruturado",
    details: [
      "Inclui tudo do Basic Code Pack.",
      "Entrega estrutura organizada por pastas.",
      "Codigo mais limpo para edicao e manutencao.",
      "Responsividade revisada para mobile e desktop.",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium Custom Clone",
    type: "premium",
    tag: "Premium",
    price: 99.9,
    description: "Clone e adaptacao completa com nicho, cores, gateway e entrega em ate 3 horas.",
    delivery: "3h",
    scope: "Adaptacao completa",
    details: [
      "Inclui tudo do Plus Plan.",
      "Adapta cores, textos e linguagem para o nicho.",
      "Considera notas de checkout e gateway.",
      "Entrega pasta pronta para uso com briefing aplicado.",
    ],
  },
  mobile: {
    id: "mobile",
    name: "Mobile Optimization",
    type: "service",
    tag: "Servico",
    price: 19.9,
    description: "Ajuste visual e responsivo para telas pequenas e navegacao mobile.",
    delivery: "6h",
    scope: "Responsivo",
    details: [
      "Revisa hierarquia visual no mobile.",
      "Ajusta espacamentos, botoes e quebras de layout.",
      "Melhora leitura em telas pequenas.",
      "Indicado para paginas com trafego mobile alto.",
    ],
  },
  checkout: {
    id: "checkout",
    name: "Checkout Setup",
    type: "service",
    tag: "Servico",
    price: 29.9,
    description: "Estrutura de checkout, botoes, redirecionamento e campos importantes.",
    delivery: "6h",
    scope: "Checkout",
    details: [
      "Organiza botoes e pontos de conversao.",
      "Prepara area de redirecionamento para gateway.",
      "Ajusta campos e textos de checkout.",
      "Nao processa pagamento real sem backend.",
    ],
  },
  whatsapp: {
    id: "whatsapp",
    name: "2 Sites Clone Pack",
    type: "premium",
    tag: "Premium",
    price: 139.9,
    description: "Clone e adaptacao completa de 2 sites com tudo incluso no Premium Custom Clone.",
    delivery: "3h",
    scope: "2 sites completos",
    details: [
      "Inclui tudo do Premium Custom Clone.",
      "Entrega clone e adaptacao completa de 2 sites.",
      "Adapta cores, textos, nicho, checkout e gateway.",
      "Entrega pastas prontas para uso com briefing aplicado.",
    ],
  },
  speed: {
    id: "speed",
    name: "Speed Optimization",
    type: "service",
    tag: "Servico",
    price: 35.9,
    description: "Organizacao de assets, ajustes de peso e boas praticas de carregamento.",
    delivery: "8h",
    scope: "Performance",
    details: [
      "Revisa peso de assets e organizacao.",
      "Melhora carregamento percebido.",
      "Remove excessos simples no front-end.",
      "Ajuda campanhas com trafego pago.",
    ],
  },
  pixel: {
    id: "pixel",
    name: "Tracking Pixel Structure",
    type: "service",
    tag: "Servico",
    price: 25.9,
    description: "Estrutura preparada para Meta Pixel, eventos e scripts de rastreamento.",
    delivery: "6h",
    scope: "Tracking",
    details: [
      "Prepara areas para scripts de tracking.",
      "Organiza eventos como view e checkout.",
      "Facilita integracao futura com pixels.",
      "Nao inclui chaves privadas no front-end.",
    ],
  },
};

const productIcons = {
  basic: "code",
  plus: "layout",
  premium: "zap",
  mobile: "phone",
  checkout: "credit",
  whatsapp: "stack",
  speed: "gauge",
  pixel: "target",
};

const wholeMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const centsMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const money = {
  format(value) {
    return Number.isInteger(value) ? wholeMoney.format(value) : centsMoney.format(value);
  },
};

const apiBaseUrl = ["5500", "5501", "5173"].includes(window.location.port) ? "http://localhost:3000" : "";

function apiUrl(path) {
  return `${apiBaseUrl}${path}`;
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem("clonego_session") || "null");
  } catch {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem("clonego_session", JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem("clonego_session");
}

function requireSessionForCheckout() {
  const session = getSession();
  if (session?.token && session?.user?.email) return session;

  localStorage.setItem("afterLoginRedirect", "checkout.html");
  toast("Entre na sua conta para finalizar a compra.");
  window.setTimeout(() => {
    window.location.href = "login.html?next=checkout.html";
  }, 450);
  return null;
}

function authHeaders() {
  const token = getSession()?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function nextAuthUrl(defaultUrl = "index.html") {
  const params = new URLSearchParams(window.location.search);
  return params.get("next") || localStorage.getItem("afterLoginRedirect") || defaultUrl;
}

async function readApiResponse(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      error: text.length > 180 ? `${text.slice(0, 180)}...` : text,
    };
  }
}

function rootPath(path) {
  const isNestedPage = window.location.pathname.includes("/admin/") || window.location.pathname.includes("\\admin\\");
  return `${isNestedPage ? "../" : ""}${path}`;
}

const icons = {
  stack:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Z"></path><path d="m3 12 9 5 9-5"></path><path d="m3 16 9 5 9-5"></path></svg>',
  code:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 9-4 3 4 3"></path><path d="m16 9 4 3-4 3"></path><path d="m14 4-4 16"></path></svg>',
  layout:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 9h18"></path><path d="M9 20V9"></path></svg>',
  zap:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 10-13h-7l0-7Z"></path></svg>',
  phone:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"></rect><path d="M11 18h2"></path></svg>',
  credit:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 10h18"></path><path d="M7 15h3"></path></svg>',
  message:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.8 8.8 0 0 1-3.8-.9L3 20l1.2-4.8A8.3 8.3 0 1 1 21 11.5Z"></path><path d="M8.5 10.5h7"></path><path d="M8.5 14h4.5"></path></svg>',
  gauge:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14a8 8 0 1 1 16 0"></path><path d="M12 14l4-4"></path><path d="M6.5 18h11"></path></svg>',
  target:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="4"></circle><path d="M12 2v3"></path><path d="M12 19v3"></path><path d="M2 12h3"></path><path d="M19 12h3"></path></svg>',
  home:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8"></path><path d="M5 10v10h14V10"></path><path d="M9 20v-6h6v6"></path></svg>',
  store:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16l-1-5H5l-1 5Z"></path><path d="M5 10v10h14V10"></path><path d="M9 20v-5h6v5"></path></svg>',
  backpack:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8V6a4 4 0 0 1 8 0v2"></path><path d="M6 8h12a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-9a2 2 0 0 1 2-2Z"></path><path d="M8 14h8"></path><path d="M9 18h6"></path><path d="M8 11v9"></path><path d="M16 11v9"></path></svg>',
  cart:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h15l-2 9H8L6 3H3"></path><circle cx="9" cy="20" r="1"></circle><circle cx="18" cy="20" r="1"></circle></svg>',
  sun:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m4.9 4.9 1.4 1.4"></path><path d="m17.7 17.7 1.4 1.4"></path><path d="m4.9 19.1 1.4-1.4"></path><path d="m17.7 6.3 1.4-1.4"></path></svg>',
  menu:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"></path><path d="M4 12h16"></path><path d="M4 17h16"></path></svg>',
};

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function addToCart(id) {
  const item = products[id];
  if (!item) return;

  const cart = getCart();
  const current = cart.find((cartItem) => cartItem.id === id);
  if (current) {
    current.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }

  saveCart(cart);
  toast(`${item.name} adicionado ao carrinho.`);
}

function removeFromCart(id) {
  saveCart(getCart().filter((item) => item.id !== id));
  renderCart();
  renderCheckout();
}

function cartTotal() {
  return getCart().reduce((total, item) => {
    const product = products[item.id];
    return product ? total + product.price * item.qty : total;
  }, 0);
}

function getOrders() {
  return JSON.parse(localStorage.getItem("orders") || "[]");
}

function saveOrders(orders) {
  localStorage.setItem("orders", JSON.stringify(orders));
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function createOrderFromCheckout(requestData) {
  const cart = getCart();
  const items = cart.map((item) => {
    const product = products[item.id];
    return {
      id: item.id,
      name: product?.name || "Produto",
      qty: item.qty,
      price: product?.price || 0,
    };
  });
  const now = new Date().toISOString();
  const id = `CP-${Date.now().toString().slice(-6)}`;
  const hasPremium = items.some((item) => item.id === "premium");
  const title = items.length ? items.map((item) => item.name).join(", ") : "Pedido personalizado";

  return {
    id,
    title,
    items,
    request: requestData,
    total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
    status: "In Production",
    statusLabel: "Em andamento",
    progress: hasPremium ? 68 : 52,
    createdAt: now,
    updatedAt: now,
    message: "Seu pedido esta sendo feito pela nossa equipe. Estamos analisando o briefing, organizando os arquivos e preparando a entrega na Mochila.",
    deliveryFile: null,
    history: [
      {
        status: "Pedido gerado",
        at: now,
        text: "O pedido foi criado no checkout e entrou na sua Mochila.",
      },
      {
        status: "Pagamento confirmado",
        at: now,
        text: "A confirmacao foi registrada e o formulario de briefing ficou vinculado ao pedido.",
      },
      {
        status: "Briefing recebido",
        at: now,
        text: "Recebemos o link de referencia, nicho, cores e observacoes enviadas.",
      },
      {
        status: "Em producao",
        at: now,
        text: "Nossa equipe esta fazendo o clone/adaptacao e preparando os arquivos finais.",
      },
    ],
  };
}

function createPendingPixOrder({ checkoutData, pixResult }) {
  const cart = getCart();
  const items = cart.map((item) => {
    const product = products[item.id];
    return {
      id: item.id,
      name: product?.name || "Produto",
      qty: item.qty,
      price: product?.price || 0,
    };
  });
  const now = new Date().toISOString();
  const title = items.length ? items.map((item) => item.name).join(", ") : "Pedido personalizado";

  return {
    id: pixResult.orderId || pixResult.identifier,
    publicCode: pixResult.identifier,
    title,
    items,
    request: checkoutData,
    total: pixResult.amount || items.reduce((sum, item) => sum + item.price * item.qty, 0),
    status: "waiting_payment",
    statusLabel: "Aguardando Pix",
    progress: 10,
    createdAt: now,
    updatedAt: now,
    message: "Pedido criado no banco. Aguardando confirmacao do pagamento Pix para entrar na producao.",
    deliveryFile: null,
    history: [
      {
        status: "Pedido criado",
        at: now,
        text: "Os dados do cliente, CPF, itens e briefing foram enviados para o banco.",
      },
      {
        status: "Pix gerado",
        at: now,
        text: "A cobranca Pix foi criada pela Syncpay e esta aguardando pagamento.",
      },
    ],
  };
}

function markLocalOrderAsPaid(identifier) {
  const orders = getOrders();
  const now = new Date().toISOString();
  const updatedOrders = orders.map((order) => {
    if (order.publicCode !== identifier && order.id !== identifier) return order;
    return {
      ...order,
      status: "payment_confirmed",
      statusLabel: "Pagamento confirmado",
      progress: Math.max(order.progress || 0, 35),
      updatedAt: now,
      message: "Pagamento confirmado. Seu pedido entrou na fila de producao.",
      history: [
        ...(order.history || []),
        {
          status: "Pagamento confirmado",
          at: now,
          text: "A Syncpay confirmou o pagamento Pix e o banco foi atualizado.",
        },
      ],
    };
  });
  saveOrders(updatedOrders);
}

function checkoutItemsPayload() {
  return getCart().map((item) => ({
    product_id: item.id,
    quantity: item.qty,
  }));
}

function setPaymentStatus(title, message) {
  const status = document.querySelector("#paymentStatus");
  if (!status) return;
  status.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
}

function renderPixPayment(pixResult) {
  const box = document.querySelector("#pixPaymentBox");
  if (!box) return;

  box.innerHTML = `
    <section class="pix-box" aria-live="polite">
      <div class="pix-qr-frame">
        <img src="${pixResult.qrCodeDataUrl}" alt="QR Code Pix do pedido" />
      </div>
      <div class="pix-copy">
        <span>Pix copia e cola</span>
        <textarea readonly>${pixResult.pixCode}</textarea>
      </div>
      <div class="pix-actions">
        <button class="btn btn-primary full" data-copy-pix type="button">Copiar codigo Pix</button>
        <button class="btn btn-secondary full" data-check-pix="${pixResult.identifier}" type="button">Verificar pagamento</button>
      </div>
    </section>
  `;
}

async function checkPixPayment(identifier, silent = false) {
  try {
    const response = await fetch(apiUrl(`/api/payments/${encodeURIComponent(identifier)}`));
    const result = await readApiResponse(response);
    if (!response.ok) throw new Error(result.error || "Nao foi possivel consultar o pagamento.");

    if (result.paid) {
      markLocalOrderAsPaid(identifier);
      setPaymentStatus("Pagamento confirmado", "Pedido atualizado no banco e liberado para a fila de producao.");
      toast("Pagamento Pix confirmado.");
      return true;
    }

    if (!silent) toast("Pagamento ainda pendente.");
    return false;
  } catch (error) {
    if (!silent) toast(error.message);
    return false;
  }
}

function startPixPolling(identifier) {
  window.clearInterval(window.pixPollingTimer);
  window.pixPollingTimer = window.setInterval(async () => {
    const paid = await checkPixPayment(identifier, true);
    if (paid) window.clearInterval(window.pixPollingTimer);
  }, 7000);
}

function updateCartCount() {
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    const count = getCart().reduce((total, item) => total + item.qty, 0);
    node.textContent = count;
  });
}

function toast(message) {
  const toastNode = document.querySelector("#toast");
  if (!toastNode) return;

  toastNode.textContent = message;
  toastNode.classList.add("show");
  window.clearTimeout(window.toastTimer);
  window.toastTimer = window.setTimeout(() => toastNode.classList.remove("show"), 2800);
}

function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = savedTheme || (prefersDark ? "dark" : "light");

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem("theme", nextTheme);
    });
  });
}

function renderHeader() {
  const header = document.querySelector("#siteHeader");
  if (!header) return;

  const page = document.body.dataset.page;
  const links = [
    ["home", "Inicio", rootPath("index.html"), "home"],
    ["marketplace", "Marketplace", rootPath("marketplace.html"), "store"],
    ["dashboard", "Mochila", rootPath("dashboard.html"), "backpack"],
  ];

  header.innerHTML = `
    <header class="site-header">
      <div class="container nav">
        <a class="brand logo-brand" href="${rootPath("index.html")}" aria-label="Clonador de Paginas">
          <img src="${rootPath("images/logo.clone.png")}" alt="Clonador de Paginas" />
        </a>
        <nav class="nav-links" id="navLinks" aria-label="Navegacao principal">
          ${links.map(([key, label, href, icon]) => `<a class="${page === key ? "active" : ""}" href="${href}">${icons[icon]}<span>${label}</span></a>`).join("")}
        </nav>
        <div class="nav-actions">
          <button class="icon-btn" data-theme-toggle type="button" aria-label="Alternar tema">${icons.sun}</button>
          <a class="icon-btn cart-link" href="${rootPath("cart.html")}" aria-label="Carrinho">${icons.cart}<span class="cart-count" data-cart-count>0</span></a>
          ${
            getSession()?.user
              ? `<button class="btn btn-secondary" data-logout type="button">Sair</button>`
              : `<a class="btn btn-secondary" href="${rootPath("login.html")}">Entrar</a>`
          }
          <button class="mobile-menu" id="mobileMenu" type="button" aria-label="Abrir menu">${icons.menu}</button>
        </div>
      </div>
    </header>
  `;

  const menu = header.querySelector("#mobileMenu");
  const nav = header.querySelector("#navLinks");
  menu.addEventListener("click", () => nav.classList.toggle("open"));
}

function renderFooter() {
  const footer = document.querySelector("#siteFooter");
  if (!footer) return;

  footer.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <section class="footer-brand">
          <a class="logo-brand" href="${rootPath("index.html")}" aria-label="Clonador de Paginas">
            <img src="${rootPath("images/logo.clone.png")}" alt="Clonador de Paginas" />
          </a>
          <p>
            Marketplace acessivel para paginas clonadas, templates de checkout, mini-servicos e adaptacoes de codigo para campanhas digitais.
          </p>
          <div class="footer-credit">Criado por <strong>kzincks</strong></div>
        </section>

        <nav class="footer-column" aria-label="Plataforma">
          <h2>Plataforma</h2>
          <a href="${rootPath("marketplace.html")}">Marketplace</a>
          <a href="${rootPath("cart.html")}">Carrinho</a>
          <a href="${rootPath("dashboard.html")}">Mochila do cliente</a>
          <a href="${rootPath("order.html")}">Status do pedido</a>
        </nav>

        <nav class="footer-column" aria-label="Documentacao">
          <h2>Documentacao</h2>
          <a href="${rootPath("docs/docs-premium.html")}">Como funciona o Premium</a>
          <a href="${rootPath("docs/docs-briefing.html")}">Envio de briefing</a>
          <a href="${rootPath("docs/docs-download.html")}">Download dos arquivos</a>
          <a href="${rootPath("docs/docs-timeline.html")}">Linha do tempo do pedido</a>
          <a href="${rootPath("docs/docs-admin.html")}">Painel administrativo</a>
        </nav>

        <nav class="footer-column" aria-label="Servicos">
          <h2>Servicos</h2>
          <a href="${rootPath("docs/docs-basic.html")}">Basic Code Pack</a>
          <a href="${rootPath("docs/docs-plus.html")}">Plus Plan</a>
          <a href="${rootPath("docs/docs-premium-plan.html")}">Premium Custom</a>
          <a href="${rootPath("docs/docs-mini-services.html")}">Mini-servicos</a>
          <a href="${rootPath("docs/docs-tracking-checkout.html")}">Tracking e checkout</a>
        </nav>
      </div>

      <div class="container footer-docs">
        <article>
          <h2>Fluxo operacional</h2>
          <p>O cliente escolhe um plano, adiciona mini-servicos, simula o pagamento, envia o link de referencia e acompanha o progresso ate receber o ZIP final na Mochila.</p>
        </article>
        <article>
          <h2>Entrega e prazos</h2>
          <p>Todos os planos principais foram estruturados com entrega em 3 horas. O prazo real podera ser validado pelo backend quando a integracao com banco estiver pronta.</p>
        </article>
        <article>
          <h2>Integracoes futuras</h2>
          <p>A estrutura esta preparada para autenticacao, gateway de pagamento, upload de arquivos, notificacoes por email e historico de status por pedido.</p>
        </article>
      </div>

      <div class="container footer-bottom">
        <span>Clonador de Paginas. Codigo estatico em HTML, CSS e JavaScript.</span>
        <span>Pagamentos, emails e banco de dados preparados para integracao futura.</span>
      </div>
    </footer>
  `;
}

function injectIcons() {
  document.querySelectorAll("[data-icon]").forEach((node) => {
    const name = node.dataset.icon;
    node.innerHTML = icons[name] || icons.stack;
  });
}

function renderMarketplace(filter = "all", search = "") {
  const grid = document.querySelector("#productGrid");
  if (!grid) return;

  const normalizedSearch = search.trim().toLowerCase();
  const items = Object.values(products).filter((item) => {
    const matchesFilter = filter === "all" || item.type === filter;
    const matchesSearch =
      !normalizedSearch ||
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.description.toLowerCase().includes(normalizedSearch) ||
      item.scope.toLowerCase().includes(normalizedSearch);

    return matchesFilter && matchesSearch;
  });

  const filterCount = document.querySelector("#filterCount");
  if (filterCount) {
    filterCount.textContent = `${items.length} ${items.length === 1 ? "item" : "itens"}`;
  }

  if (!items.length) {
    grid.innerHTML = `
      <article class="empty-state">
        <h2>Nenhum item encontrado</h2>
        <p>Tente buscar por outro termo ou selecione uma categoria diferente.</p>
      </article>
    `;
    return;
  }

  grid.innerHTML = items
    .map(
      (item) => `
      <article class="product-card">
        <div class="meta">
          <span class="product-icon">${icons[productIcons[item.id]] || icons.stack}</span>
          <strong>${money.format(item.price)}</strong>
        </div>
        ${
          item.id === "basic"
            ? '<img class="plan-title-image marketplace-plan-image" src="images/plano 39.png" alt="Basic Code Pack: clone bruto em HTML, CSS e JS com assets e guia basico de configuracao." />'
            : item.id === "plus"
            ? '<img class="plan-title-image marketplace-plan-image" src="images/plus.plan.png" alt="Plus Plan Structured: codigo organizado, responsivo, refatorado e separado em pastas editaveis." />'
            : item.id === "premium"
            ? '<img class="plan-title-image marketplace-plan-image" src="images/plano.99.png" alt="Premium Custom Clone: clone e adaptacao completa com nicho, cores, gateway e entrega em ate 3 horas." />'
            : item.id === "mobile"
            ? '<img class="plan-title-image marketplace-plan-image" src="images/plano.mobile.png" alt="Mobile Optimization: ajuste visual e responsivo para telas pequenas e navegacao mobile." />'
            : item.id === "checkout"
            ? '<img class="plan-title-image marketplace-plan-image" src="images/plano.checkout.png" alt="Checkout Setup: estrutura de checkout, botoes, redirecionamento e campos importantes." />'
            : item.id === "whatsapp"
            ? '<img class="plan-title-image marketplace-plan-image" src="images/2sites.png" alt="2 Sites Clone Pack: clone e adaptacao completa de 2 sites com tudo incluso no Premium Custom Clone." />'
            : item.id === "speed"
            ? '<img class="plan-title-image marketplace-plan-image" src="images/perfomace.png" alt="Speed Optimization: organizacao de assets, ajustes de peso e boas praticas de carregamento." />'
            : item.id === "pixel"
            ? '<img class="plan-title-image marketplace-plan-image" src="images/tracking.png" alt="Tracking Pixel Structure: estrutura preparada para Meta Pixel, eventos e scripts de rastreamento." />'
            : `<h2>${item.name}</h2><p>${item.description}</p>`
        }
        <div class="product-specs">
          <span><strong>${item.delivery}</strong> prazo</span>
          <span><strong>${item.scope}</strong></span>
        </div>
        <div class="product-actions">
          <button class="btn btn-primary" data-add-cart="${item.id}">Adicionar</button>
          <button class="btn btn-secondary" data-open-product="${item.id}" type="button">Detalhes</button>
        </div>
      </article>
    `,
    )
    .join("");
}

function openProductModal(id) {
  const item = products[id];
  if (!item) return;

  let modal = document.querySelector("#productModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "productModal";
    modal.className = "modal-backdrop";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <section class="product-modal" role="dialog" aria-modal="true" aria-labelledby="productModalTitle">
      <button class="modal-close" data-close-modal type="button" aria-label="Fechar detalhes">x</button>
      <div class="modal-hero">
        <span class="product-icon">${icons[productIcons[item.id]] || icons.stack}</span>
        <div>
          <p>${item.tag}</p>
          <h2 id="productModalTitle">${item.name}</h2>
        </div>
        <strong>${money.format(item.price)}</strong>
      </div>
      <p class="modal-description">${item.description}</p>
      <div class="modal-specs">
        <span><strong>${item.delivery}</strong> prazo de entrega</span>
        <span><strong>${item.scope}</strong> escopo</span>
      </div>
      <div class="modal-section">
        <h3>O que inclui</h3>
        <ul>
          ${item.details.map((detail) => `<li>${detail}</li>`).join("")}
        </ul>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary" data-add-cart="${item.id}" data-close-modal type="button">Adicionar ao carrinho</button>
        <button class="btn btn-secondary" data-close-modal type="button">Continuar navegando</button>
      </div>
    </section>
  `;

  requestAnimationFrame(() => modal.classList.add("is-open"));
}

function closeProductModal() {
  const modal = document.querySelector("#productModal");
  if (!modal) return;
  modal.classList.remove("is-open");
  window.setTimeout(() => modal.remove(), 180);
}

function renderCart() {
  const list = document.querySelector("#cartItems");
  if (!list) return;

  const cart = getCart();
  if (!cart.length) {
    list.innerHTML = '<p class="muted">Seu carrinho esta vazio. Adicione itens pelo marketplace.</p>';
  } else {
    list.innerHTML = cart
      .map((item) => {
        const product = products[item.id];
        return `
          <article class="cart-item">
            <div>
              <h3>${product.name}</h3>
              <p>${item.qty} unidade(s) - ${money.format(product.price * item.qty)}</p>
            </div>
            <button class="remove-btn" data-remove-cart="${item.id}" type="button">Remover</button>
          </article>
        `;
      })
      .join("");
  }

  const total = money.format(cartTotal());
  const subtotal = document.querySelector("#cartSubtotal");
  const totalNode = document.querySelector("#cartTotal");
  if (subtotal) subtotal.textContent = total;
  if (totalNode) totalNode.textContent = total;
}

function renderCheckout() {
  const list = document.querySelector("#checkoutItems");
  if (!list) return;

  const session = getSession();
  if (session?.user) {
    const emailInput = document.querySelector('#checkoutForm input[name="email"]');
    const nameInput = document.querySelector('#checkoutForm input[name="name"]');
    if (emailInput && !emailInput.value) emailInput.value = session.user.email || "";
    if (nameInput && !nameInput.value) nameInput.value = session.user.name || "";
  }

  const cart = getCart();
  list.innerHTML = cart.length
    ? cart
        .map((item) => {
          const product = products[item.id];
          return `
            <article class="compact-item">
              <div class="compact-item-main">
                <span class="compact-item-icon">${icons[productIcons[item.id]] || icons.stack}</span>
                <div>
                  <h3>${product.name}</h3>
                  <p>${item.qty} unidade(s)</p>
                </div>
              </div>
              <strong>${money.format(product.price * item.qty)}</strong>
            </article>
          `;
        })
        .join("")
    : `
      <article class="compact-item checkout-empty">
        <span class="compact-item-icon">${icons.cart}</span>
        <div>
          <h3>Carrinho vazio</h3>
          <p>Adicione um plano antes de confirmar o pedido.</p>
        </div>
      </article>
    `;

  const total = document.querySelector("#checkoutTotal");
  if (total) total.textContent = money.format(cartTotal());
}

function renderDashboard() {
  const orders = getOrders();
  const activeOrders = orders.filter((order) => order.status !== "Delivered");
  const deliveredOrders = orders.filter((order) => order.status === "Delivered");
  const latestOrder = orders[0];
  const stats = document.querySelector("#dashboardStats");
  if (stats) {
    stats.innerHTML = `
      <article class="panel stat-card"><span>Pedidos ativos</span><strong>${activeOrders.length}</strong></article>
      <article class="panel stat-card"><span>Entregas liberadas</span><strong>${deliveredOrders.length}</strong></article>
      <article class="panel stat-card"><span>Status atual</span><strong>${latestOrder ? latestOrder.statusLabel : "Sem pedido"}</strong></article>
    `;
  }

  const activeMessage = document.querySelector("#activeOrderMessage");
  const activePanel = document.querySelector("#activeOrderPanel");
  if (activeMessage) {
    activeMessage.textContent = latestOrder
      ? latestOrder.message
      : "Quando voce confirmar um pedido no checkout, ele aparecera aqui com o andamento completo.";
  }
  if (activePanel) {
    activePanel.innerHTML = latestOrder
      ? `
        <article class="active-order-card">
          <div class="active-order-head">
            <span class="backpack-icon">${icons.backpack}</span>
            <div>
              <h3>${latestOrder.id}</h3>
              <p>${latestOrder.title}</p>
            </div>
            <strong>${latestOrder.progress}%</strong>
          </div>
          <div class="progress-line"><span style="width: ${latestOrder.progress}%"></span></div>
          <p class="order-team-message">Pedido em andamento: nossa equipe esta produzindo sua entrega agora.</p>
        </article>
      `
      : `
        <article class="empty-state compact">
          <h3>Nenhum pedido ativo</h3>
          <p>Escolha um plano no marketplace e confirme o checkout para iniciar o acompanhamento.</p>
          <a class="btn btn-primary" href="marketplace.html">Ver marketplace</a>
        </article>
      `;
  }

  const ordersList = document.querySelector("#ordersList");
  if (ordersList) {
    ordersList.innerHTML = orders.length
      ? orders
          .map(
            (order) => `
        <article class="order-item">
          <div>
            <h3>${order.id} - ${order.title}</h3>
            <p>${order.message}</p>
            <small>Criado em ${formatDateTime(order.createdAt)}</small>
          </div>
          <span class="status-pill">${order.statusLabel}</span>
        </article>
      `,
          )
          .join("")
      : `
        <article class="empty-state compact">
          <h3>Voce ainda nao tem pedidos</h3>
          <p>Assim que um pedido for confirmado, ele aparece aqui com status e progresso.</p>
          <a class="btn btn-primary" href="marketplace.html">Escolher plano</a>
        </article>
      `;
  }

  const backpack = document.querySelector("#backpackList");
  if (backpack) {
    const files = deliveredOrders.filter((order) => order.deliveryFile);
    backpack.innerHTML = files.length
      ? files
          .map(
            (order) => `
        <article class="delivery-item">
          <div>
            <h3>${order.deliveryFile}</h3>
            <p>Pedido ${order.id}</p>
          </div>
          <button class="btn btn-primary" data-download="${order.deliveryFile}" type="button">Download</button>
        </article>
      `,
          )
          .join("")
      : `
        <article class="empty-state compact">
          <h3>Nenhum arquivo liberado ainda</h3>
          <p>Quando a equipe finalizar o pedido, o ZIP final aparecera nesta area para download.</p>
        </article>
      `;
  }

  const history = document.querySelector("#historyList");
  if (history) {
    history.innerHTML = orders.length
      ? orders
          .map((order) =>
            order.history
              .map(
                (event) => `
          <article class="history-item">
            <span></span>
            <div>
              <strong>${event.status}</strong>
              <p>${event.text}</p>
              <small>${order.id} - ${formatDateTime(event.at)}</small>
            </div>
          </article>
        `,
              )
              .join(""),
          )
          .join("")
      : `
        <article class="empty-state compact">
          <h3>Historico vazio</h3>
          <p>O historico sera montado desde a geracao do pedido ate a finalizacao da entrega.</p>
        </article>
      `;
  }
}

function initForms() {
  const login = document.querySelector("#loginForm");
  if (login) {
    login.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = login.querySelector("[type='submit']");
      const data = Object.fromEntries(new FormData(login));

      try {
        submitButton.disabled = true;
        submitButton.textContent = "Entrando...";
        const response = await fetch(apiUrl("/api/auth/login"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const result = await readApiResponse(response);
        if (!response.ok) throw new Error(result.error || "Nao foi possivel entrar.");

        saveSession({
          token: result.token,
          user: result.user,
        });
        localStorage.removeItem("afterLoginRedirect");
        toast("Login realizado.");
        window.setTimeout(() => {
          window.location.href = nextAuthUrl("marketplace.html");
        }, 350);
      } catch (error) {
        toast(error.message);
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Entrar";
      }
    });
  }

  const register = document.querySelector("#registerForm");
  if (register) {
    register.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = register.querySelector("[type='submit']");
      const data = Object.fromEntries(new FormData(register));

      try {
        submitButton.disabled = true;
        submitButton.textContent = "Criando...";
        const response = await fetch(apiUrl("/api/auth/register"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const result = await readApiResponse(response);
        if (!response.ok) throw new Error(result.error || "Nao foi possivel criar a conta.");

        saveSession({
          token: result.token,
          user: result.user,
        });
        localStorage.removeItem("afterLoginRedirect");
        toast("Conta criada.");
        window.setTimeout(() => {
          window.location.href = nextAuthUrl("marketplace.html");
        }, 350);
      } catch (error) {
        toast(error.message);
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Criar conta";
      }
    });
  }

  const checkout = document.querySelector("#checkoutForm");
  if (checkout) {
    checkout.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!getCart().length) {
        toast("Adicione um item ao carrinho antes de confirmar.");
        return;
      }
      const session = requireSessionForCheckout();
      if (!session) return;

      const submitButton = checkout.querySelector("[type='submit']");
      const data = Object.fromEntries(new FormData(checkout));
      localStorage.setItem("lastOrderRequest", JSON.stringify(data));

      try {
        submitButton.disabled = true;
        submitButton.innerHTML = `<span data-icon="credit"></span> Gerando Pix...`;
        injectIcons();
        setPaymentStatus("Gerando Pix", "Estamos criando a cobranca na Syncpay e salvando o pedido no banco.");

        const response = await fetch(apiUrl("/api/checkout/pix"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({
            customer: {
              name: data.name,
              email: data.email,
              phone: data.phone,
              cpf: data.cpf,
            },
            briefing: {
              reference_url: data.reference,
              niche: data.niche,
              colors: data.colors,
              gateway_notes: data.gateway,
            },
            items: checkoutItemsPayload(),
          }),
        });
        const pixResult = await readApiResponse(response);

        if (!response.ok) {
          throw new Error(pixResult.error || "Nao foi possivel gerar o Pix.");
        }

        const order = createPendingPixOrder({ checkoutData: data, pixResult });
        saveOrders([order, ...getOrders()]);
        saveCart([]);
        renderCheckout();
        renderPixPayment(pixResult);
        setPaymentStatus("Pix gerado", "Pague pelo QR Code ou copia e cola. A confirmacao atualiza o pedido automaticamente.");
        startPixPolling(pixResult.identifier);
        toast("Pix gerado. Pedido salvo no banco.");
      } catch (error) {
        setPaymentStatus("Erro ao gerar Pix", error.message);
        toast(error.message);
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = `<span data-icon="credit"></span> Gerar Pix`;
        injectIcons();
      }
    });
  }
}

function initEvents() {
  const transition = document.createElement("div");
  transition.className = "page-transition";
  document.body.appendChild(transition);

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (link && link.origin === window.location.origin && !link.hash && link.target !== "_blank") {
      event.preventDefault();
      transition.classList.add("is-active");
      window.setTimeout(() => {
        window.location.href = link.href;
      }, 180);
      return;
    }

    const addButton = event.target.closest("[data-add-cart]");
    if (addButton) addToCart(addButton.dataset.addCart);

    const detailsButton = event.target.closest("[data-open-product]");
    if (detailsButton) openProductModal(detailsButton.dataset.openProduct);

    if (event.target.matches("[data-close-modal]") || event.target.id === "productModal") {
      closeProductModal();
    }

    const backpackTab = event.target.closest("[data-backpack-tab]");
    if (backpackTab) {
      const tab = backpackTab.dataset.backpackTab;
      document.querySelectorAll("[data-backpack-tab]").forEach((button) => button.classList.remove("active"));
      document.querySelectorAll("[data-backpack-panel]").forEach((panel) => panel.classList.remove("active"));
      backpackTab.classList.add("active");
      document.querySelector(`[data-backpack-panel="${tab}"]`)?.classList.add("active");
    }

    const removeButton = event.target.closest("[data-remove-cart]");
    if (removeButton) removeFromCart(removeButton.dataset.removeCart);

    const downloadButton = event.target.closest("[data-download]");
    if (downloadButton) toast(`Preparando download: ${downloadButton.dataset.download}`);

    const logoutButton = event.target.closest("[data-logout]");
    if (logoutButton) {
      clearSession();
      toast("Voce saiu da conta.");
      window.setTimeout(() => {
        window.location.href = rootPath("login.html");
      }, 350);
    }

    const copyPixButton = event.target.closest("[data-copy-pix]");
    if (copyPixButton) {
      const code = document.querySelector(".pix-copy textarea")?.value || "";
      navigator.clipboard.writeText(code).then(
        () => toast("Codigo Pix copiado."),
        () => toast("Nao foi possivel copiar automaticamente."),
      );
    }

    const checkPixButton = event.target.closest("[data-check-pix]");
    if (checkPixButton) checkPixPayment(checkPixButton.dataset.checkPix);

  });

  document.querySelectorAll("[data-filter-value]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-filter-value]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const search = document.querySelector("#marketSearch")?.value || "";
      renderMarketplace(button.dataset.filterValue, search);
    });
  });

  const marketSearch = document.querySelector("#marketSearch");
  if (marketSearch) {
    marketSearch.addEventListener("input", () => {
      const active = document.querySelector("[data-filter-value].active");
      renderMarketplace(active?.dataset.filterValue || "all", marketSearch.value);
    });
  }

  const clearCart = document.querySelector("#clearCart");
  if (clearCart) {
    clearCart.addEventListener("click", () => {
      saveCart([]);
      renderCart();
      toast("Carrinho limpo.");
    });
  }

  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.querySelector(`#${button.dataset.togglePassword}`);
      if (!input) return;
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      button.textContent = visible ? "Mostrar senha" : "Ocultar senha";
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProductModal();
  });
}

function boot() {
  renderHeader();
  renderFooter();
  injectIcons();
  initTheme();
  updateCartCount();
  renderMarketplace();
  renderCart();
  renderCheckout();
  renderDashboard();
  if (typeof renderAdmin === "function") renderAdmin();
  initForms();
  initEvents();
}

document.addEventListener("DOMContentLoaded", boot);

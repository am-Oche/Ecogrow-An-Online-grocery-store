/* ==========================================================================
   CORE — store (cart, wishlist, ui, prefs, orders), router, data access,
   money/units helpers, icons. Exposed on window for other modules.
   ========================================================================== */
const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect, useSyncExternalStore } = React;
const CFG = window.ECO_CONFIG;
const DATA = window.ECO_DATA;

/* ---------------- persisted store (Zustand-style) ---------------- */
function createStore(key, initial) {
  let state = initial;
  try { const s = JSON.parse(localStorage.getItem(key)); if (s) state = { ...initial, ...s }; } catch (e) {}
  const subs = new Set();
  return {
    get: () => state,
    set: (patch) => {
      state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
      try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
      subs.forEach((f) => f());
    },
    sub: (f) => { subs.add(f); return () => subs.delete(f); },
  };
}
const shop = createStore("eco.shop.v1", {
  cart: [],            // {id, w (weight index), qty}
  wish: [],
  recent: [],
  searches: [],
  orders: [],
  lastBasket: null,
  user: null,          // {name, email}
  currency: CFG.market.defaultCurrency,
  lang: CFG.market.defaultLanguage,
  unit: CFG.market.weightUnit,
  promo: null,
  area: "",
  barClosed: false,
  addresses: [{ id: "a1", label: "Home", line: "1234 Market Street, Apt 5B", city: "Wilmington", zip: "19801" }],
});
function useShop(sel = (s) => s) {
  return useSyncExternalStore(shop.sub, () => sel(shop.get()));
}

/* transient UI store (not persisted) */
const ui = (() => {
  let state = { cartOpen: false, menuOpen: false, quick: null, toasts: [], cartPulse: 0, filterOpen: false, searchOpen: false };
  const subs = new Set();
  return { get: () => state, set: (p) => { state = { ...state, ...(typeof p === "function" ? p(state) : p) }; subs.forEach((f) => f()); }, sub: (f) => { subs.add(f); return () => subs.delete(f); } };
})();
function useUI(sel = (s) => s) { return useSyncExternalStore(ui.sub, () => sel(ui.get())); }

function toast(msg) {
  const id = Math.random().toString(36).slice(2);
  ui.set((s) => ({ toasts: [...s.toasts, { id, msg }] }));
  setTimeout(() => ui.set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2600);
}

/* ---------------- data access layer (swap for API/Shopify later) ---------------- */
const api = {
  products: () => DATA.products,
  product: (slug) => DATA.products.find((p) => p.slug === slug || p.id === slug),
  byId: (id) => DATA.products.find((p) => p.id === id),
  category: (id) => DATA.categories.find((c) => c.id === id),
  count: (catId) => DATA.products.filter((p) => p.category === catId).length,
  search: (q) => {
    q = q.trim().toLowerCase(); if (!q) return [];
    return DATA.products.filter((p) => (p.name + " " + p.category + " " + p.tags.join(" ") + " " + p.brand).toLowerCase().includes(q));
  },
  related: (p, n = 4) => DATA.products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, n),
  deals: () => DATA.products.filter((p) => p.salePrice),
};

/* ---------------- cart actions ---------------- */
const cart = {
  qty: (id) => shop.get().cart.filter((l) => l.id === id).reduce((a, l) => a + l.qty, 0),
  add: (id, qty = 1, w = 0, fromEl) => {
    const p = api.byId(id);
    if (!p || p.stock === 0) return;
    shop.set((s) => {
      const i = s.cart.findIndex((l) => l.id === id && l.w === w);
      const next = [...s.cart];
      if (i >= 0) next[i] = { ...next[i], qty: Math.min(next[i].qty + qty, p.stock) };
      else next.push({ id, w, qty: Math.min(qty, p.stock) });
      return { cart: next };
    });
    ui.set((s) => ({ cartPulse: s.cartPulse + 1 }));
    if (fromEl) flyToCart(fromEl);
  },
  setQty: (id, w, qty) => shop.set((s) => ({ cart: qty <= 0 ? s.cart.filter((l) => !(l.id === id && l.w === w)) : s.cart.map((l) => (l.id === id && l.w === w ? { ...l, qty: Math.min(qty, api.byId(id).stock) } : l)) })),
  // card-level stepper acts on the first line for this product
  step: (id, d) => {
    const s = shop.get(); const line = s.cart.find((l) => l.id === id);
    if (!line) { if (d > 0) cart.add(id, 1); return; }
    cart.setQty(id, line.w, line.qty + d);
    ui.set((st) => ({ cartPulse: st.cartPulse + 1 }));
  },
  remove: (id, w) => shop.set((s) => ({ cart: s.cart.filter((l) => !(l.id === id && l.w === w)) })),
  clear: () => shop.set({ cart: [], promo: null }),
  lines: (c) => c.map((l) => { const p = api.byId(l.id); const w = p.weights[l.w] || p.weights[0]; const unit = (p.salePrice ?? p.price) * w.mult; return { ...l, p, wLabel: w.label, unit, total: unit * l.qty }; }),
  totals: (s) => {
    const lines = cart.lines(s.cart);
    const sub = lines.reduce((a, l) => a + l.total, 0);
    const disc = s.promo && CFG.delivery.promoCodes[s.promo] ? sub * CFG.delivery.promoCodes[s.promo] : 0;
    const after = sub - disc;
    const fee = after === 0 || after >= CFG.delivery.freeThreshold ? 0 : CFG.delivery.fee;
    return { lines, sub, disc, fee, total: after + fee, count: lines.reduce((a, l) => a + l.qty, 0), toFree: Math.max(0, CFG.delivery.freeThreshold - after) };
  },
};
const wish = {
  toggle: (id) => shop.set((s) => ({ wish: s.wish.includes(id) ? s.wish.filter((x) => x !== id) : [...s.wish, id] })),
};

/* fly-to-cart micro-interaction (transform/opacity only) */
function flyToCart(fromEl) {
  try {
    const img = fromEl.closest("[data-fly]")?.querySelector("img") || fromEl;
    const target = document.querySelector(window.innerWidth < 900 ? "[data-cart-target-m]" : "[data-cart-target]");
    if (!img || !target || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = img.getBoundingClientRect(), b = target.getBoundingClientRect();
    const g = img.cloneNode(true);
    const size = Math.min(a.width, 120);
    Object.assign(g.style, { position: "fixed", left: a.left + a.width / 2 - size / 2 + "px", top: a.top + a.height / 2 - size / 2 + "px", width: size + "px", height: size + "px", objectFit: "contain", zIndex: 200, pointerEvents: "none", borderRadius: "50%", background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,.2)", transition: "transform .8s cubic-bezier(.5,-0.3,.6,1), opacity .8s", mixBlendMode: "normal" });
    document.body.appendChild(g);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    requestAnimationFrame(() => { g.style.transform = `translate(${dx}px, ${dy}px) scale(.15)`; g.style.opacity = ".6"; });
    setTimeout(() => g.remove(), 820);
  } catch (e) {}
}

/* ---------------- money & units ---------------- */
function useMoney() {
  const cur = useShop((s) => s.currency);
  return useCallback((usd) => {
    const c = CFG.currencies[cur] || CFG.currencies.USD;
    const v = usd * c.rate;
    const digits = c.rate > 50 ? 0 : 2;
    return c.symbol + v.toLocaleString(c.locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }, [cur]);
}
function useUnit() {
  const unit = useShop((s) => s.unit);
  return useCallback((label) => {
    if (unit !== "imperial") return label;
    const m = String(label).match(/^([\d.]+)\s*(g|kg|ml|L)$/); if (!m) return label;
    const n = parseFloat(m[1]);
    if (m[2] === "g") return (n / 453.6).toFixed(2).replace(/\.?0+$/, "") + " lb";
    if (m[2] === "kg") return (n * 2.2046).toFixed(1).replace(/\.0$/, "") + " lb";
    if (m[2] === "ml") return (n / 29.57).toFixed(0) + " fl oz";
    return (n * 33.81).toFixed(0) + " fl oz";
  }, [unit]);
}

/* ---------------- hash router with query (refresh/back/share safe) ---------------- */
function parseHash() {
  const h = location.hash.replace(/^#/, "") || "/";
  const [path, qs] = h.split("?");
  const query = Object.fromEntries(new URLSearchParams(qs || ""));
  return { path: path || "/", query };
}
function buildHref(path, query) {
  const qs = query ? new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== "")).toString() : "";
  return "#" + path + (qs ? "?" + qs : "");
}
function navigate(path, query, { replace = false, keepScroll = false } = {}) {
  const href = buildHref(path, query);
  if (replace) history.replaceState(null, "", href); else history.pushState(null, "", href);
  window.dispatchEvent(new Event("eco:route"));
  if (!keepScroll) window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}
function useRoute() {
  const [r, setR] = useState(parseHash);
  useEffect(() => {
    const f = () => setR(parseHash());
    window.addEventListener("hashchange", f); window.addEventListener("popstate", f); window.addEventListener("eco:route", f);
    return () => { window.removeEventListener("hashchange", f); window.removeEventListener("popstate", f); window.removeEventListener("eco:route", f); };
  }, []);
  return r;
}
/* update one query key in place (tabs, filters) */
function setQuery(patch, opts = {}) {
  const { path, query } = parseHash();
  const next = { ...query, ...patch };
  Object.keys(next).forEach((k) => (next[k] === "" || next[k] == null) && delete next[k]);
  navigate(path, next, { keepScroll: true, ...opts });
}
function Link({ to = "/", query, children, className, onClick, ...rest }) {
  return (
    <a href={buildHref(to, query)} className={className} {...rest}
      onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); onClick && onClick(e); ui.set({ menuOpen: false }); navigate(to, query); }}>
      {children}
    </a>
  );
}

/* ---------------- scroll reveal ---------------- */
function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll(".rv:not(.in)");
    const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, deps);
}

/* ---------------- icons (stroke, 24 grid) ---------------- */
const IC = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.2-4.2",
  cart: "M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2M10 20.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm8 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  x: "M6 6l12 12M18 6 6 18",
  chevD: "m6 9 6 6 6-6",
  chevR: "m9 6 6 6-6 6",
  chevL: "m15 6-6 6 6 6",
  arrowR: "M5 12h14m-6-6 6 6-6 6",
  arrowL: "M19 12H5m6-6-6 6 6 6",
  menu: "M4 7h16M4 12h16M4 17h16",
  home: "M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  pin: "M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 2",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  bolt: "M13 3 5 14h6l-1 7 8-11h-6l1-7Z",
  refresh: "M20 11a8 8 0 0 0-14.9-3M4 4v4h4m-4 5a8 8 0 0 0 14.9 3M20 20v-4h-4",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14",
  truck: "M3 6h11v10H3zM14 9h4l3 3v4h-7M7.5 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm11 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z",
  tag: "M3 12V4h8l9 9-8 8-9-9Zm5-4h.01",
  leaf: "M5 19c0-8 5-14 15-15-1 10-7 15-15 15Zm0 0 7-7",
  check: "m5 12 5 5 9-10",
  star: "M12 3.5 14.6 9l6 .6-4.5 4 1.3 5.9L12 16.5 6.6 19.5 7.9 13.6 3.4 9.6l6-.6L12 3.5Z",
  trash: "M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13",
  filter: "M4 5h16l-6 8v6l-4-2v-4L4 5Z",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.6 3.7 5.6 3.7 9S14.5 18.4 12 21c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3Z",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Zm4 4h4",
  box: "M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9ZM3 7.5 12 12l9-4.5M12 12v9",
  card: "M3 6h18v12H3zM3 10h18M7 15h3",
  lock: "M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3",
  zoom: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.2-4.2M11 8v6M8 11h6",
  carrot: "M14 10 4 20M9.5 9.5l5 5M14 10c2-2 4.5-3 6-3-0 1.5-1 4-3 6M14 10c-1-2-1-4.5 0-6 1.5 1 2.5 3.5 2 5.5",
  apple: "M12 7c-1.5-1-5-1.5-6.5 1.5S5 16 8 19c1.5 1.5 2.5 1 4 .5 1.5.5 2.5 1 4-.5 3-3 4-7.5 2.5-10.5S13.5 6 12 7Zm0 0c0-2 1-3.5 3-4",
  milk: "M8 3h8M9 3v3l-2 3v12h10V9l-2-3V3M7 13h10",
  meat: "M15 4a6 6 0 0 1 4 10l-5 5a4 4 0 0 1-6-1l-3 3M8 15a3 3 0 1 1 4 0",
  nut: "M12 3c4 0 7 3.5 7 8s-3 10-7 10-7-5.5-7-10 3-8 7-8Zm-4 6h8",
  whatsapp: "M4 20l1.3-4A8 8 0 1 1 8 18.8L4 20Zm5-11c0 3.3 2.7 6 6 6l1.2-1.4-2-1-1 .8a4 4 0 0 1-2.4-2.4l.8-1-1-2L9 9Z",
  repeat: "M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3m13-3v2a4 4 0 0 1-4 4H4",
  send: "M4 12 20 4l-6 16-3-7-7-1Z",
  sliders: "M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6",
};
function Icon({ name, size = 20, stroke = 2, className, style, fill = "none" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
      <path d={IC[name] || IC.leaf} />
    </svg>
  );
}

const catName = (id) => api.category(id)?.name || id;
const discountPct = (p) => (p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0);

Object.assign(window, { CFG, DATA, shop, ui, useShop, useUI, toast, api, cart, wish, useMoney, useUnit, parseHash, buildHref, navigate, useRoute, setQuery, Link, useReveal, Icon, catName, discountPct, flyToCart });

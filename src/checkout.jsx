/* ==========================================================================
   CART PAGE, CHECKOUT (address → slot → payment → review), CONFIRMATION,
   ORDER TRACKING. Payments behind one adapter.
   ========================================================================== */

/* ---- payment adapter: one interface, provider chosen in config ---- */
const PaymentAdapter = {
  async charge({ provider, amount, currency, email }) {
    // Replace each branch with real SDK calls (server-side intent creation).
    // stripe:      POST /api/pay/stripe  -> clientSecret -> stripe.confirmPayment
    // paystack:    PaystackPop.setup({ key, email, amount: amount*100, currency })
    // flutterwave: FlutterwaveCheckout({ public_key, tx_ref, amount, currency })
    await new Promise((r) => setTimeout(r, 1200));
    return { ok: true, ref: (provider || "mock").slice(0, 3).toUpperCase() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase() };
  },
};

function CartPage() {
  const s = useShop(); const money = useMoney();
  const t = cart.totals(s);
  useEffect(() => { document.title = "Cart — " + CFG.brand.name; }, []);
  const buyAgain = s.orders.flatMap((o) => o.lines.map((l) => l.id)).filter((id, i, a) => a.indexOf(id) === i).map(api.byId).filter(Boolean).slice(0, 4);
  return (
    <div className="wrap">
      <Crumbs items={[{ label: "Cart" }]} />
      <h1 style={{ fontSize: "clamp(26px, 3.4vw, 40px)", fontWeight: 800, marginBottom: 20 }}>Shopping cart</h1>
      {t.lines.length === 0 ? (
        <EmptyState icon="cart" title="Your cart is empty" text="Add some fresh produce to get started." action={<div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}><Link to="/shop" className="btn btn-green">Browse products</Link>{s.lastBasket && <button className="btn btn-ghost" onClick={() => { s.lastBasket.forEach((l) => cart.add(l.id, l.qty, l.w)); toast("Last basket restored"); }}><Icon name="repeat" size={16} /> Reorder last basket</button>}</div>} />
      ) : (
        <div className="co-grid" style={{ display: "grid", gap: 28, alignItems: "start" }}>
          <div className="card" style={{ padding: "8px 22px" }}>
            {t.lines.map((l) => <CartLine key={l.id + l.w} l={l} />)}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", flexWrap: "wrap", gap: 10 }}>
              <Link to="/shop" className="btn btn-ghost"><Icon name="arrowL" size={16} /> Continue shopping</Link>
              <button className="btn btn-ghost" onClick={() => { cart.clear(); toast("Cart cleared"); }}><Icon name="trash" size={16} /> Clear cart</button>
            </div>
          </div>
          <Summary t={t} cta={<Link to="/checkout" className="btn btn-green btn-block" style={{ minHeight: 52 }}><Icon name="lock" size={16} /> Proceed to checkout</Link>} />
        </div>
      )}
      {buyAgain.length > 0 && <section className="section"><SectionHeading title="Buy again" sub="From your previous orders" /><div className="pgrid c4">{buyAgain.map((p) => <ProductCard key={p.id} p={p} />)}</div></section>}
    </div>
  );
}

function Summary({ t, cta, slot }) {
  const money = useMoney();
  return (
    <aside className="card" style={{ padding: 22, display: "grid", gap: 14, position: "sticky", top: 90 }} aria-label="Order summary">
      <h2 style={{ fontSize: 20 }}>Order summary</h2>
      <FreeDeliveryBar toFree={t.toFree} sub={t.sub} />
      <PromoField />
      <div style={{ display: "grid", gap: 6, fontSize: 14.5 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">Subtotal ({t.count} items)</span><span>{money(t.sub)}</span></div>
        {t.disc > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "var(--green)" }}><span>Promo discount</span><span>−{money(t.disc)}</span></div>}
        <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">Delivery{slot ? ` · ${slot}` : ""}</span><span>{t.fee ? money(t.fee) : "Free"}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 20, borderTop: "1px solid var(--line)", paddingTop: 10, marginTop: 4 }}><span>Total</span><span>{money(t.total)}</span></div>
      </div>
      {cta}
    </aside>
  );
}

const STEPS = [{ id: "address", label: "Address" }, { id: "slot", label: "Delivery slot" }, { id: "payment", label: "Payment" }, { id: "review", label: "Review" }];

function nextDays(n = 5) {
  const out = []; const d = new Date();
  for (let i = 0; i < n; i++) { const x = new Date(d); x.setDate(d.getDate() + i); out.push({ id: x.toISOString().slice(0, 10), label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : x.toLocaleDateString("en-US", { weekday: "short" }), date: x.toLocaleDateString("en-US", { month: "short", day: "numeric" }) }); }
  return out;
}

function CheckoutPage({ query }) {
  const s = useShop(); const money = useMoney();
  const t = cart.totals(s);
  const stepIdx = Math.max(0, STEPS.findIndex((x) => x.id === query.step));
  const step = STEPS[stepIdx].id;
  const [form, setForm] = useState(() => { let saved = null; try { saved = JSON.parse(sessionStorage.getItem("eco.co")); } catch (e) {} return saved || {
    name: s.user?.name || "", email: s.user?.email || "", phone: "", line: s.addresses[0]?.line || "", city: s.addresses[0]?.city || "", zip: s.addresses[0]?.zip || s.area || "", notes: "",
    day: nextDays()[0].id, slot: "", pay: CFG.payments.provider === "mock" ? "stripe" : CFG.payments.provider, card: "", exp: "", cvc: "",
  }; });
  const [err, setErr] = useState({});
  const [paying, setPaying] = useState(false);
  useEffect(() => { sessionStorage.setItem("eco.co", JSON.stringify({ ...form, card: "", cvc: "" })); }, [form]);
  useEffect(() => { document.title = "Checkout — " + CFG.brand.name; }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const go = (i) => navigate("/checkout", i ? { step: STEPS[i].id } : {}, { keepScroll: false });

  const validate = (id) => {
    const e = {};
    if (id === "address") {
      if (form.name.trim().length < 2) e.name = "Enter your full name";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
      if (!/^[+\d][\d\s-]{6,}$/.test(form.phone)) e.phone = "Enter a valid phone number";
      if (form.line.trim().length < 5) e.line = "Enter your street address";
      if (form.city.trim().length < 2) e.city = "Enter your city";
      if (!form.zip.trim()) e.zip = "Enter your postal code";
      else if (!CFG.delivery.areas.includes(form.zip.trim())) e.zip = "Sorry, we don't deliver to this postal code yet (try 19801)";
    }
    if (id === "slot" && !form.slot) e.slot = "Choose a delivery slot";
    if (id === "payment" && ["stripe"].includes(form.pay)) {
      if (form.card.replace(/\s/g, "").length < 15) e.card = "Enter a valid card number (use 4242 4242 4242 4242)";
      if (!/^\d\d\/\d\d$/.test(form.exp)) e.exp = "MM/YY";
      if (!/^\d{3,4}$/.test(form.cvc)) e.cvc = "3–4 digits";
    }
    setErr(e);
    if (Object.keys(e).length) { setTimeout(() => document.querySelector(".input.err, .ferr")?.closest(".field, .slotwrap")?.querySelector("input, button")?.focus(), 30); }
    return !Object.keys(e).length;
  };
  // guard: can't skip ahead past invalid steps
  useEffect(() => { for (let i = 0; i < stepIdx; i++) { const id = STEPS[i].id; if ((id === "address" && !form.zip) || (id === "slot" && !form.slot)) { go(i); break; } } }, [stepIdx]);

  if (t.lines.length === 0) return <div className="wrap"><Crumbs items={[{ label: "Checkout" }]} /><EmptyState icon="cart" title="Nothing to check out" text="Your cart is empty." action={<Link to="/shop" className="btn btn-green">Shop now</Link>} /></div>;

  const place = async () => {
    setPaying(true);
    const res = await PaymentAdapter.charge({ provider: form.pay, amount: t.total, currency: s.currency, email: form.email });
    setPaying(false);
    if (!res.ok) return toast("Payment failed — please try again");
    const id = "EG" + Math.floor(100000 + Math.random() * 900000);
    const order = { id, ref: res.ref, date: new Date().toISOString(), lines: s.cart, total: t.total, currency: s.currency, slot: form.slot, day: form.day, address: `${form.line}, ${form.city} ${form.zip}`, name: form.name, pay: form.pay, status: 1 };
    shop.set((st) => ({ orders: [order, ...st.orders], lastBasket: st.cart, cart: [], promo: null }));
    sessionStorage.removeItem("eco.co");
    navigate("/order/" + id);
  };

  const F = ({ id, label, type = "text", span, ...rest }) => (
    <div className="field" style={span ? { gridColumn: "1 / -1" } : null}>
      <label htmlFor={"f-" + id}>{label}</label>
      <input id={"f-" + id} type={type} className={"input" + (err[id] ? " err" : "")} value={form[id]} onChange={set(id)} aria-invalid={!!err[id]} aria-describedby={err[id] ? "e-" + id : undefined} {...rest} />
      {err[id] && <span className="ferr" id={"e-" + id}>{err[id]}</span>}
    </div>
  );

  return (
    <div className="wrap">
      <Crumbs items={[{ label: "Cart", to: "/cart" }, { label: "Checkout" }]} />
      <h1 style={{ fontSize: "clamp(26px, 3.4vw, 40px)", fontWeight: 800, marginBottom: 18 }}>Checkout</h1>
      <ol aria-label="Checkout steps" style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
        {STEPS.map((st, i) => {
          const done = i < stepIdx, cur = i === stepIdx;
          return (
            <li key={st.id} style={{ flex: "1 0 auto" }}>
              <button onClick={() => i < stepIdx && go(i)} disabled={i > stepIdx} aria-current={cur ? "step" : undefined} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", minHeight: 52, padding: "0 16px", borderRadius: 999, background: cur ? "var(--green)" : done ? "var(--t-mint)" : "#fff", color: cur ? "#fff" : done ? "var(--green)" : "var(--muted)", fontWeight: 700, border: "1.5px solid " + (cur ? "var(--green)" : "var(--line)"), transition: "background .35s, color .35s", cursor: done ? "pointer" : "default" }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", background: cur ? "var(--lime)" : done ? "var(--green)" : "var(--bg)", color: cur ? "var(--green-900)" : done ? "#fff" : "inherit", fontSize: 13 }}>{done ? <Icon name="check" size={14} stroke={3} /> : i + 1}</span>{st.label}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="co-grid" style={{ display: "grid", gap: 28, alignItems: "start" }}>
        <div key={step} className="card" style={{ padding: 26, animation: "pageIn .45s var(--ease)" }}>
          {step === "address" && (
            <form onSubmit={(e) => { e.preventDefault(); validate("address") && go(1); }} noValidate>
              <h2 style={{ fontSize: 22, marginBottom: 16 }}>Delivery address</h2>
              {s.addresses.length > 0 && <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>{s.addresses.map((a) => <button type="button" key={a.id} className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, line: a.line, city: a.city, zip: a.zip })}><Icon name="pin" size={14} /> Use {a.label}</button>)}</div>}
              <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {F({ id: "name", label: "Full name", autoComplete: "name" })}
                {F({ id: "email", label: "Email", type: "email", autoComplete: "email" })}
                {F({ id: "phone", label: "Phone", type: "tel", autoComplete: "tel", placeholder: "+1 302 555 0100" })}
                {F({ id: "zip", label: "Postal code", autoComplete: "postal-code", inputMode: "numeric" })}
                {F({ id: "line", label: "Street address", span: true, autoComplete: "street-address" })}
                {F({ id: "city", label: "City", autoComplete: "address-level2" })}
                <div className="field"><label htmlFor="f-notes">Delivery notes (optional)</label><input id="f-notes" className="input" value={form.notes} onChange={set("notes")} placeholder="Gate code, leave at door…" /></div>
              </div>
              <button className="btn btn-green" style={{ marginTop: 22, minHeight: 50 }}>Continue to delivery slot <Icon name="arrowR" size={16} /></button>
            </form>
          )}
          {step === "slot" && (
            <div>
              <h2 style={{ fontSize: 22, marginBottom: 16 }}>Choose a delivery slot</h2>
              <div role="radiogroup" aria-label="Delivery day" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
                {nextDays().map((d) => <button key={d.id} role="radio" aria-checked={form.day === d.id} onClick={() => setForm({ ...form, day: d.id, slot: "" })} style={{ minWidth: 92, padding: "12px 10px", borderRadius: 16, border: "1.5px solid " + (form.day === d.id ? "var(--green)" : "var(--line)"), background: form.day === d.id ? "var(--green)" : "#fff", color: form.day === d.id ? "#fff" : "inherit", transition: "background .3s, color .3s" }}><b style={{ display: "block" }}>{d.label}</b><span style={{ fontSize: 13, opacity: .8 }}>{d.date}</span></button>)}
              </div>
              <div className="slotwrap" role="radiogroup" aria-label="Delivery time" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginTop: 16 }}>
                {CFG.delivery.slots.map((sl, k) => {
                  const today = form.day === nextDays()[0].id; const hr = +sl.slice(0, 2); const past = today && hr <= new Date().getHours();
                  const full = k === 2 && !today; const dis = past || full;
                  const on = form.slot === sl;
                  return <button key={sl} role="radio" aria-checked={on} disabled={dis} onClick={() => setForm({ ...form, slot: sl })} style={{ minHeight: 64, borderRadius: 16, border: "1.5px solid " + (on ? "var(--green)" : "var(--line)"), background: on ? "var(--t-mint)" : dis ? "var(--bg)" : "#fff", color: dis ? "#9aa49f" : "inherit", fontWeight: 700, textDecoration: dis ? "line-through" : "none" }}>{sl}<span style={{ display: "block", fontSize: 12, fontWeight: 600, color: on ? "var(--green)" : "var(--muted)" }}>{dis ? (full ? "Fully booked" : "Unavailable") : t.fee ? money(t.fee) : "Free"}</span></button>;
                })}
              </div>
              {err.slot && <div className="ferr" role="alert" style={{ marginTop: 10 }}>{err.slot}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
                <button className="btn btn-ghost" onClick={() => go(0)}><Icon name="arrowL" size={16} /> Back</button>
                <button className="btn btn-green" style={{ minHeight: 50 }} onClick={() => validate("slot") && go(2)}>Continue to payment <Icon name="arrowR" size={16} /></button>
              </div>
            </div>
          )}
          {step === "payment" && (
            <form onSubmit={(e) => { e.preventDefault(); validate("payment") && go(3); }} noValidate>
              <h2 style={{ fontSize: 22, marginBottom: 16 }}>Payment method</h2>
              <div role="radiogroup" aria-label="Payment provider" style={{ display: "grid", gap: 10 }}>
                {CFG.payments.available.map((pm) => {
                  const on = form.pay === pm.id;
                  return <label key={pm.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: 16, borderRadius: 16, border: "1.5px solid " + (on ? "var(--green)" : "var(--line)"), background: on ? "var(--t-mint)" : "#fff", cursor: "pointer", transition: "background .3s" }}>
                    <input type="radio" name="pay" checked={on} onChange={() => setForm({ ...form, pay: pm.id })} style={{ accentColor: "var(--green)", width: 18, height: 18 }} />
                    <span style={{ flex: 1 }}><b>{pm.label}</b><br /><span className="muted" style={{ fontSize: 13.5 }}>{pm.note}</span></span>
                    <Icon name={pm.id === "cod" ? "truck" : "card"} size={22} style={{ color: "var(--green)" }} />
                  </label>;
                })}
              </div>
              {form.pay === "stripe" && (
                <div style={{ display: "grid", gap: 14, gridTemplateColumns: "2fr 1fr 1fr", marginTop: 18, animation: "pageIn .35s var(--ease)" }} className="cardrow">
                  {F({ id: "card", label: "Card number", inputMode: "numeric", autoComplete: "cc-number", placeholder: "4242 4242 4242 4242" })}
                  {F({ id: "exp", label: "Expiry", placeholder: "MM/YY", autoComplete: "cc-exp" })}
                  {F({ id: "cvc", label: "CVC", inputMode: "numeric", autoComplete: "cc-csc" })}
                </div>
              )}
              {(form.pay === "paystack" || form.pay === "flutterwave") && <p className="muted" style={{ marginTop: 14, fontSize: 14 }}>You'll complete payment in the secure {form.pay === "paystack" ? "Paystack" : "Flutterwave"} window after reviewing your order.</p>}
              <p className="muted" style={{ marginTop: 14, fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}><Icon name="lock" size={14} /> Demo mode — no real charge. Provider: {CFG.payments.provider}.</p>
              <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                <button type="button" className="btn btn-ghost" onClick={() => go(1)}><Icon name="arrowL" size={16} /> Back</button>
                <button className="btn btn-green" style={{ minHeight: 50 }}>Review order <Icon name="arrowR" size={16} /></button>
              </div>
            </form>
          )}
          {step === "review" && (
            <div>
              <h2 style={{ fontSize: 22, marginBottom: 16 }}>Review your order</h2>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                {[["Deliver to", `${form.name}\n${form.line}, ${form.city} ${form.zip}\n${form.phone}`, 0], ["When", `${nextDays().find((d) => d.id === form.day)?.label} · ${form.slot}`, 1], ["Payment", CFG.payments.available.find((p) => p.id === form.pay)?.label + (form.card ? ` ending ${form.card.replace(/\s/g, "").slice(-4)}` : ""), 2]].map(([k, v, i]) => (
                  <div key={k} style={{ background: "var(--bg)", borderRadius: 16, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><b style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--muted)" }}>{k}</b><button onClick={() => go(i)} style={{ color: "var(--green)", fontWeight: 700, fontSize: 13 }}>Edit</button></div>
                    <p style={{ whiteSpace: "pre-line", marginTop: 6, fontSize: 14.5 }}>{v}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14 }}>{t.lines.map((l) => <div key={l.id + l.w} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)", fontSize: 14.5 }}><span>{l.qty} × {l.p.name} <span className="muted">({l.wLabel})</span></span><b>{money(l.total)}</b></div>)}</div>
              <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
                <button className="btn btn-ghost" onClick={() => go(2)}><Icon name="arrowL" size={16} /> Back</button>
                <button className="btn btn-green" style={{ minHeight: 52, flex: 1 }} onClick={place} disabled={paying} aria-busy={paying}>{paying ? <><span className="spin" /> Processing payment…</> : <><Icon name="lock" size={16} /> Place order · {money(t.total)}</>}</button>
              </div>
            </div>
          )}
        </div>
        <Summary t={t} slot={form.slot} />
      </div>
    </div>
  );
}

function OrderConfirmation({ id }) {
  const order = useShop((s) => s.orders.find((o) => o.id === id));
  const money = useMoney();
  if (!order) return <NotFound />;
  return (
    <div className="wrap" style={{ maxWidth: 760 }}>
      <div className="card" style={{ padding: "48px 28px", textAlign: "center", marginTop: 32, position: "relative", overflow: "hidden" }}>
        <div style={{ width: 92, height: 92, borderRadius: "50%", background: "var(--green)", color: "var(--lime)", display: "grid", placeItems: "center", margin: "0 auto", animation: "heart .7s var(--ease)" }}><Icon name="check" size={46} stroke={3} /></div>
        <h1 style={{ fontSize: 32, marginTop: 20 }}>Thank you, {order.name.split(" ")[0]}!</h1>
        <p className="muted" style={{ marginTop: 8 }}>Order <b style={{ color: "var(--ink)" }}>#{order.id}</b> is confirmed. Payment ref {order.ref}.</p>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: 26, textAlign: "left" }}>
          <div style={{ background: "var(--bg)", padding: 14, borderRadius: 14 }}><b className="muted" style={{ fontSize: 12, textTransform: "uppercase" }}>Arriving</b><div style={{ fontWeight: 700 }}>{order.slot}</div></div>
          <div style={{ background: "var(--bg)", padding: 14, borderRadius: 14 }}><b className="muted" style={{ fontSize: 12, textTransform: "uppercase" }}>Address</b><div style={{ fontWeight: 700 }}>{order.address}</div></div>
          <div style={{ background: "var(--bg)", padding: 14, borderRadius: 14 }}><b className="muted" style={{ fontSize: 12, textTransform: "uppercase" }}>Total</b><div style={{ fontWeight: 700 }}>{money(order.total)}</div></div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
          <Link to={"/track/" + order.id} className="btn btn-green"><Icon name="map" size={16} /> Track delivery</Link>
          <Link to="/shop" className="btn btn-ghost">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}

function TrackPage({ id }) {
  const orders = useShop((s) => s.orders);
  const [q, setQ] = useState(id || "");
  const order = orders.find((o) => o.id === (id || "").toUpperCase());
  const [stage, setStage] = useState(1);
  useEffect(() => { if (!order) return; setStage(1); const t = setInterval(() => setStage((x) => Math.min(3, x + 1)), 4000); return () => clearInterval(t); }, [order?.id]);
  const stages = [["Order placed", "box"], ["Packed at hub", "check"], ["Out for delivery", "truck"], ["Delivered", "home"]];
  return (
    <div className="wrap">
      <Crumbs items={[{ label: "Track order" }]} />
      <h1 style={{ fontSize: "clamp(26px, 3.4vw, 40px)", fontWeight: 800, marginBottom: 18 }}>Track your order</h1>
      <form onSubmit={(e) => { e.preventDefault(); navigate("/track/" + q.trim().toUpperCase()); }} style={{ display: "flex", gap: 8, maxWidth: 480, marginBottom: 24 }}>
        <input className="input" aria-label="Order number" placeholder="Order number, e.g. EG123456" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-green" style={{ minHeight: 48 }}>Track</button>
      </form>
      {id && !order && <EmptyState icon="search" title="Order not found" text="Check the number in your confirmation email. Orders placed in this browser appear in your account." />}
      {!id && orders.length > 0 && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{orders.slice(0, 4).map((o) => <Link key={o.id} to={"/track/" + o.id} className="btn btn-ghost btn-sm">#{o.id}</Link>)}</div>}
      {order && (
        <div className="co-grid" style={{ display: "grid", gap: 24, alignItems: "start" }}>
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ position: "relative", aspectRatio: "16/10", background: "#E8EFE6" }} role="img" aria-label="Map placeholder showing rider route">
              <svg viewBox="0 0 400 250" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true">
                {Array.from({ length: 9 }).map((_, i) => <line key={"h" + i} x1="0" x2="400" y1={i * 30} y2={i * 30 + 10} stroke="#fff" strokeWidth="6" />)}
                {Array.from({ length: 9 }).map((_, i) => <line key={"v" + i} y1="0" y2="250" x1={i * 50} x2={i * 50 - 14} stroke="#fff" strokeWidth="6" />)}
                <rect x="250" y="20" width="90" height="60" rx="10" fill="#cfe5c7" /><rect x="40" y="150" width="70" height="70" rx="10" fill="#cfe5c7" />
                <path id="route" d="M60 60 C 140 60, 140 140, 220 140 S 320 200, 340 200" fill="none" stroke="var(--green)" strokeWidth="5" strokeDasharray="10 8" strokeLinecap="round" />
                <circle cx="60" cy="60" r="10" fill="var(--green)" /><circle cx="340" cy="200" r="12" fill="var(--red)" />
                <g style={{ offsetPath: "path('M60 60 C 140 60, 140 140, 220 140 S 320 200, 340 200')", offsetDistance: `${(stage / 3) * 100}%`, transition: "offset-distance 3.5s var(--ease)" }}>
                  <circle r="16" fill="var(--lime)" stroke="var(--green)" strokeWidth="3" />
                </g>
              </svg>
              <span className="replace-tag">Map placeholder — connect Mapbox / Google Maps</span>
            </div>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <h2 style={{ fontSize: 20 }}>Order #{order.id}</h2>
            <p className="muted" style={{ fontSize: 14 }}>Slot {order.slot} · {order.address}</p>
            <ol style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "grid", gap: 0 }}>
              {stages.map(([l, ic], i) => (
                <li key={l} style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: i < 3 ? 22 : 0, position: "relative" }}>
                  {i < 3 && <span style={{ position: "absolute", left: 17, top: 36, bottom: 0, width: 2, background: i < stage ? "var(--green)" : "var(--line)", transition: "background .6s" }} />}
                  <span style={{ width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center", background: i <= stage ? "var(--green)" : "var(--bg)", color: i <= stage ? "#fff" : "var(--muted)", transition: "background .6s", flex: "none" }}><Icon name={ic} size={17} /></span>
                  <span style={{ paddingTop: 6 }}><b style={{ color: i <= stage ? "var(--ink)" : "var(--muted)" }}>{l}</b>{i === stage && <span className="pill-note" style={{ marginLeft: 8, padding: "2px 8px" }}>Now</span>}</span>
                </li>
              ))}
            </ol>
            <a className="btn btn-ghost btn-block" style={{ marginTop: 20 }} href={"tel:" + CFG.contact.phone.replace(/\s/g, "")}><Icon name="phone" size={16} /> Call support</a>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { CartPage, CheckoutPage, OrderConfirmation, TrackPage, PaymentAdapter });

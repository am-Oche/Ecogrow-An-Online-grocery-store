/* ==========================================================================
   LAYOUT — utility bar, header (search, nav, mega menu), mobile drawer,
   bottom nav, cart drawer, footer, WhatsApp button.
   ========================================================================== */

function Logo({ light }) {
  return (
    <Link to="/" aria-label={CFG.brand.name + " home"} style={{ display: "flex", alignItems: "center", gap: 10, flex: "none" }}>
      <span style={{ width: 42, height: 42, borderRadius: "50%", background: light ? "var(--lime)" : "var(--green)", color: light ? "var(--green-900)" : "var(--lime)", display: "grid", placeItems: "center" }}><Icon name="leaf" size={22} stroke={2.4} /></span>
      <span style={{ lineHeight: 1.05 }}>
        <span style={{ display: "block", fontWeight: 800, fontSize: 20, letterSpacing: "-.02em", color: light ? "#fff" : "var(--green)" }}>{CFG.brand.name}</span>
        <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: light ? "rgba(255,255,255,.75)" : "var(--muted)" }}>{CFG.brand.tagline}</span>
      </span>
    </Link>
  );
}

function UtilityBar() {
  const s = useShop();
  if (s.barClosed) return null;
  const sel = { background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,.25)", borderRadius: 999, height: 30, padding: "0 10px", fontSize: 13, fontWeight: 600 };
  return (
    <div style={{ background: "var(--green-900)", color: "rgba(255,255,255,.92)", fontSize: 13 }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", gap: 20, minHeight: 42, flexWrap: "wrap" }}>
        <span className="ub-hide" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="pin" size={15} />{CFG.contact.address}</span>
        <span className="ub-hide2" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="clock" size={15} />{CFG.contact.hours}</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", gap: 6, alignItems: "center" }} className="ub-hide">Need help? Call us: <a href={"tel:" + CFG.contact.phone.replace(/\s/g, "")} style={{ color: "var(--lime)", fontWeight: 700 }}>{CFG.contact.phone}</a></span>
        <label className="sr" htmlFor="cur">Currency</label>
        <select id="cur" style={sel} value={s.currency} onChange={(e) => { shop.set({ currency: e.target.value }); toast("Prices shown in " + e.target.value); }}>
          {Object.keys(CFG.currencies).map((c) => <option key={c} value={c} style={{ color: "#000" }}>{c}</option>)}
        </select>
        <label className="sr" htmlFor="lang">Language</label>
        <select id="lang" style={sel} value={s.lang} onChange={(e) => shop.set({ lang: e.target.value })}>
          {CFG.languages.map((l) => <option key={l.id} value={l.id} style={{ color: "#000" }}>{l.label}</option>)}
        </select>
        <button className="ub-x" aria-label="Hide top bar" onClick={() => shop.set({ barClosed: true })} style={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: "50%" }}><Icon name="x" size={14} /></button>
      </div>
    </div>
  );
}

function SearchBox({ autoFocus, onDone }) {
  const [q, setQ] = useState(parseHash().query.q || "");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const searches = useShop((s) => s.searches);
  const money = useMoney();
  const ref = useRef(null);
  const res = useMemo(() => api.search(q).slice(0, 5), [q]);
  const cats = useMemo(() => q.trim() ? DATA.categories.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase())) : [], [q]);
  useEffect(() => { const f = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); }; document.addEventListener("pointerdown", f); return () => document.removeEventListener("pointerdown", f); }, []);
  const submit = (term = q) => {
    term = term.trim(); if (!term) return;
    shop.set((s) => ({ searches: [term, ...s.searches.filter((x) => x !== term)].slice(0, 5) }));
    setOpen(false); onDone && onDone(); navigate("/search", { q: term });
  };
  const opts = [...cats.map((c) => ({ type: "cat", c })), ...res.map((p) => ({ type: "p", p }))];
  const key = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(opts.length - 1, h + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(-1, h - 1)); }
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter") { e.preventDefault(); const o = opts[hi]; if (o) { setOpen(false); onDone && onDone(); o.type === "p" ? navigate("/product/" + o.p.slug) : navigate("/shop", { cat: o.c.id }); } else submit(); }
  };
  return (
    <div ref={ref} style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <form role="search" onSubmit={(e) => { e.preventDefault(); submit(); }} style={{ display: "flex", alignItems: "center", background: "#fff", border: "1.5px solid var(--line)", borderRadius: 999, height: 50, padding: "0 6px 0 18px", gap: 10 }}>
        <Icon name="search" size={19} style={{ color: "var(--muted)", flex: "none" }} />
        <input autoFocus={autoFocus} aria-label="Search products" role="combobox" aria-expanded={open} aria-controls="sugg" aria-autocomplete="list" value={q} onFocus={() => setOpen(true)} onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(-1); }} onKeyDown={key} placeholder="Search for broccoli, milk, apples…" style={{ border: 0, outline: 0, flex: 1, minWidth: 0, background: "transparent", fontSize: 14.5 }} />
        <button type="submit" className="btn btn-green btn-sm" style={{ height: 38 }}>Search</button>
      </form>
      {open && (
        <div id="sugg" role="listbox" className="card" style={{ position: "absolute", left: 0, right: 0, top: 58, zIndex: 60, padding: 10, boxShadow: "var(--shadow-3)", animation: "modalIn .3s var(--ease) both", transform: "none" }}>
          {!q.trim() && (
            <div style={{ padding: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>{searches.length ? "Recent searches" : "Popular"}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(searches.length ? searches : ["strawberry", "milk", "organic", "beef", "kiwi"]).map((s) => <button key={s} className="btn btn-ghost btn-sm" onClick={() => { setQ(s); submit(s); }}><Icon name={searches.length ? "clock" : "search"} size={14} />{s}</button>)}
              </div>
            </div>
          )}
          {q.trim() && !opts.length && <div style={{ padding: 14 }} className="muted">No matches for “{q}”. Try “apple” or “vegetables”.</div>}
          {cats.map((c, i) => (
            <button key={c.id} role="option" aria-selected={hi === i} onClick={() => { setOpen(false); onDone && onDone(); navigate("/shop", { cat: c.id }); }} style={{ display: "flex", width: "100%", gap: 12, alignItems: "center", padding: 8, borderRadius: 12, background: hi === i ? "var(--t-mint)" : "" }}>
              <span className={"tint-" + c.tint} style={{ width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center" }}><Icon name="grid" size={16} /></span>
              <span style={{ textAlign: "left" }}><b>{c.name}</b><br /><span className="muted" style={{ fontSize: 12.5 }}>Category · {api.count(c.id)} items</span></span>
            </button>
          ))}
          {res.map((p, j) => { const i = j + cats.length; return (
            <button key={p.id} role="option" aria-selected={hi === i} onClick={() => { setOpen(false); onDone && onDone(); navigate("/product/" + p.slug); }} style={{ display: "flex", width: "100%", gap: 12, alignItems: "center", padding: 8, borderRadius: 12, background: hi === i ? "var(--t-mint)" : "" }}>
              <span className={"tint-" + api.category(p.category).tint} style={{ width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center", overflow: "hidden" }}><img src={p.images[0]} alt="" className="blend" style={{ width: "86%", height: "86%", objectFit: "contain" }} /></span>
              <span style={{ textAlign: "left", flex: 1 }}><b>{p.name}</b><br /><span className="muted" style={{ fontSize: 12.5 }}>{catName(p.category)}</span></span>
              <b>{money(p.salePrice ?? p.price)}</b>
            </button>
          ); })}
          {q.trim() && opts.length > 0 && <button onClick={() => submit()} style={{ width: "100%", padding: 10, fontWeight: 700, color: "var(--green)", textAlign: "left" }}>See all results for “{q}” →</button>}
        </div>
      )}
    </div>
  );
}

function NavItem({ item, path }) {
  const [open, setOpen] = useState(false);
  const t = useRef();
  const enter = () => { clearTimeout(t.current); setOpen(true); };
  const leave = () => { t.current = setTimeout(() => setOpen(false), 120); };
  const active = item.href && (item.href === "/" ? path === "/" : path.startsWith(item.href));
  const style = { display: "inline-flex", alignItems: "center", gap: 4, height: 44, padding: "0 14px", borderRadius: 999, fontWeight: 700, fontSize: 14.5, color: active ? "var(--green)" : "var(--ink)", background: active ? "var(--t-mint)" : "transparent" };
  if (!item.children && !item.mega) return <Link to={item.href} style={style}>{item.label}</Link>;
  return (
    <div style={{ position: "relative" }} onMouseEnter={enter} onMouseLeave={leave} onFocus={enter} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <button style={style} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)}>{item.label}<Icon name="chevD" size={15} style={{ transition: "transform .3s", transform: open ? "rotate(180deg)" : "" }} /></button>
      {open && (item.mega ? (
        <div className="card" style={{ position: "absolute", top: 52, left: -120, width: 640, padding: 18, zIndex: 60, boxShadow: "var(--shadow-3)", display: "grid", gridTemplateColumns: "1fr 1fr 220px", gap: 8, animation: "modalIn .3s var(--ease) both", transform: "none" }}>
          <div style={{ gridColumn: "1 / 3", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {DATA.categories.map((c) => (
              <Link key={c.id} to="/shop" query={{ cat: c.id }} onClick={() => setOpen(false)} style={{ display: "flex", gap: 10, alignItems: "center", padding: 8, borderRadius: 14 }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")} onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                <span className={"tint-" + c.tint} style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", overflow: "hidden" }}><img src={c.img} alt="" className="blend" style={{ width: "80%", height: "80%", objectFit: "contain" }} /></span>
                <span><b style={{ fontSize: 14 }}>{c.name}</b><br /><span className="muted" style={{ fontSize: 12.5 }}>{api.count(c.id)} products</span></span>
              </Link>
            ))}
          </div>
          <div style={{ background: "var(--green)", color: "#fff", borderRadius: 18, padding: 18, display: "grid", alignContent: "space-between", position: "relative", overflow: "hidden" }}>
            <TopoLines color="rgba(200,240,49,.15)" />
            <div style={{ position: "relative" }}><div style={{ fontFamily: "var(--script)", fontSize: 26, color: "var(--lime)" }}>This week</div><b style={{ fontSize: 18 }}>Up to 20% off fresh berries</b></div>
            <Link to="/shop" query={{ cat: "berries" }} onClick={() => setOpen(false)} className="btn btn-white btn-sm" style={{ position: "relative", justifySelf: "start", marginTop: 16 }}>Shop berries</Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ position: "absolute", top: 52, left: 0, minWidth: 220, padding: 8, zIndex: 60, boxShadow: "var(--shadow-3)", animation: "modalIn .3s var(--ease) both", transform: "none" }}>
          {item.children.map((c, i) => <Link key={i} to={c.href} query={c.query} onClick={() => setOpen(false)} style={{ display: "block", padding: "10px 14px", borderRadius: 12, fontWeight: 600 }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")} onMouseLeave={(e) => (e.currentTarget.style.background = "")}>{c.label}</Link>)}
        </div>
      ))}
    </div>
  );
}

function CartButton({ mobile }) {
  const count = useShop((s) => s.cart.reduce((a, l) => a + l.qty, 0));
  const pulse = useUI((s) => s.cartPulse);
  return (
    <button onClick={() => ui.set({ cartOpen: true })} aria-label={`Open cart, ${count} items`} {...(mobile ? { "data-cart-target-m": "" } : { "data-cart-target": "" })}
      className={mobile ? "" : "round dark"} style={mobile ? { position: "relative", display: "grid", justifyItems: "center", gap: 2, fontSize: 11, fontWeight: 700, minWidth: 56, minHeight: 50, alignContent: "center" } : { position: "relative" }}>
      <Icon name="cart" size={mobile ? 22 : 20} />
      {mobile && "Cart"}
      {count > 0 && <span key={pulse} className="bump" style={{ position: "absolute", top: mobile ? 2 : -4, right: mobile ? 8 : -4, minWidth: 20, height: 20, padding: "0 5px", borderRadius: 999, background: "var(--lime)", color: "var(--green-900)", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center", border: "2px solid #fff" }}>{count}</span>}
    </button>
  );
}

function Header({ path }) {
  const [small, setSmall] = useState(false);
  const user = useShop((s) => s.user);
  useEffect(() => { const f = () => setSmall(window.scrollY > 60); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: small ? "rgba(255,255,255,.92)" : "#fff", backdropFilter: "saturate(1.4) blur(10px)", boxShadow: small ? "0 6px 20px rgba(15,40,30,.08)" : "0 1px 0 var(--line)", transition: "box-shadow .3s, background .3s" }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", gap: 18, height: small ? 66 : 84, transition: "height .35s var(--ease)" }}>
        <button className="round hide-d" aria-label="Open menu" onClick={() => ui.set({ menuOpen: true })}><Icon name="menu" size={20} /></button>
        <Logo />
        <div className="hide-m" style={{ flex: 1, maxWidth: 420 }}><SearchBox /></div>
        <nav aria-label="Main" className="hide-m" style={{ display: "flex", gap: 2, marginLeft: "auto" }}>
          {CFG.nav.map((n) => <NavItem key={n.id} item={n} path={path} />)}
        </nav>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginLeft: "auto" }} className="hdr-icons">
          {!user && <Link to="/login" className="btn btn-ghost btn-sm hide-m">Login</Link>}
          <Link to="/wishlist" className="round hide-m" aria-label="Wishlist"><Icon name="heart" size={19} /></Link>
          <Link to="/account" className="round hide-m" aria-label="Account"><Icon name="user" size={19} /></Link>
          <span className="hide-m"><CartButton /></span>
          <button className="round hide-d" aria-label="Search" onClick={() => ui.set({ searchOpen: true })}><Icon name="search" size={19} /></button>
        </div>
      </div>
    </header>
  );
}

function MobileMenu() {
  const open = useUI((s) => s.menuOpen);
  const close = () => ui.set({ menuOpen: false });
  const ref = useDialog(open, close);
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={close} />
      <aside className="drawer left" role="dialog" aria-modal="true" aria-label="Menu" ref={ref}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 18, borderBottom: "1px solid var(--line)" }}><Logo /><button className="round" onClick={close} aria-label="Close menu"><Icon name="x" size={18} /></button></div>
        <div style={{ overflow: "auto", padding: 18, display: "grid", gap: 4 }}>
          {CFG.nav.filter((n) => !n.mega).map((n) => <Link key={n.id} to={n.href} style={{ padding: "12px 6px", fontWeight: 700, fontSize: 17 }}>{n.label}</Link>)}
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", margin: "14px 6px 6px" }}>Categories</div>
          {DATA.categories.map((c) => <Link key={c.id} to="/shop" query={{ cat: c.id }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 6px" }}><span className={"tint-" + c.tint} style={{ width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center", overflow: "hidden" }}><img src={c.img} alt="" className="blend" style={{ width: "80%", height: "80%", objectFit: "contain" }} /></span><b>{c.name}</b></Link>)}
          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            <Link to="/login" className="btn btn-green">Login / Register</Link>
            <a href={"tel:" + CFG.contact.phone.replace(/\s/g, "")} className="btn btn-ghost"><Icon name="phone" size={16} />{CFG.contact.phone}</a>
          </div>
        </div>
      </aside>
    </>
  );
}

function MobileSearch() {
  const open = useUI((s) => s.searchOpen);
  const close = () => ui.set({ searchOpen: false });
  const ref = useDialog(open, close);
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={close} />
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Search" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 90, background: "#fff", padding: 14, display: "flex", gap: 10, alignItems: "flex-start", animation: "pageIn .3s var(--ease)", boxShadow: "var(--shadow-2)" }}>
        <SearchBox autoFocus onDone={close} />
        <button className="round" onClick={close} aria-label="Close search" style={{ marginTop: 3 }}><Icon name="x" size={18} /></button>
      </div>
    </>
  );
}

function BottomNav({ path }) {
  const items = [["/", "home", "Home"], ["/categories", "grid", "Categories"], ["search", "search", "Search"], ["cart", "cart", "Cart"], ["/account", "user", "Account"]];
  return (
    <nav aria-label="Mobile" className="hide-d" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 55, background: "#fff", boxShadow: "0 -6px 20px rgba(15,40,30,.08)", display: "flex", justifyContent: "space-around", padding: "6px 4px calc(6px + env(safe-area-inset-bottom))" }}>
      {items.map(([to, ic, label]) => {
        if (to === "cart") return <CartButton key={to} mobile />;
        const active = to === path;
        const st = { display: "grid", justifyItems: "center", gap: 2, fontSize: 11, fontWeight: 700, minWidth: 56, minHeight: 50, alignContent: "center", color: active ? "var(--green)" : "var(--muted)" };
        if (to === "search") return <button key={to} style={st} onClick={() => ui.set({ searchOpen: true })}><Icon name={ic} size={22} />{label}</button>;
        return <Link key={to} to={to} style={st} aria-current={active ? "page" : undefined}><Icon name={ic} size={22} />{label}</Link>;
      })}
    </nav>
  );
}

function FreeDeliveryBar({ toFree, sub }) {
  const money = useMoney();
  const pct = Math.min(100, ((CFG.delivery.freeThreshold - toFree) / CFG.delivery.freeThreshold) * 100);
  return (
    <div style={{ background: "var(--t-mint)", borderRadius: 16, padding: 14 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, fontWeight: 600 }}>
        <Icon name="truck" size={18} style={{ color: "var(--green)" }} />
        {toFree > 0 ? <span>Add <b>{money(toFree)}</b> more for <b>free delivery</b></span> : <span><b>You've unlocked free delivery!</b> 🎉</span>}
      </div>
      <div style={{ height: 8, background: "#fff", borderRadius: 99, marginTop: 10, overflow: "hidden" }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin="0" aria-valuemax="100" aria-label="Progress to free delivery">
        <div style={{ height: "100%", width: "100%", transformOrigin: "left", transform: `scaleX(${pct / 100})`, background: "linear-gradient(90deg, var(--green), #2f9a6c)", borderRadius: 99, transition: "transform .6s var(--ease)" }} />
      </div>
    </div>
  );
}

function CartLine({ l, compact }) {
  const money = useMoney(); const unit = useUnit();
  const cat = api.category(l.p.category);
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
      <Link to={"/product/" + l.p.slug} className={"tint-" + cat.tint} style={{ width: compact ? 64 : 84, height: compact ? 64 : 84, borderRadius: 14, display: "grid", placeItems: "center", flex: "none", overflow: "hidden" }} onClick={() => ui.set({ cartOpen: false })}><img src={l.p.images[0]} alt="" className="blend" style={{ width: "84%", height: "84%", objectFit: "contain" }} /></Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, lineHeight: 1.3 }}>{l.p.name}</div>
        <div className="muted" style={{ fontSize: 13 }}>{unit(l.wLabel)} · {money(l.unit)} each</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <QuantityStepper value={l.qty} min={1} max={l.p.stock} onChange={(v) => cart.setQty(l.id, l.w, v)} light label={l.p.name + " quantity"} />
          <button onClick={() => { cart.remove(l.id, l.w); toast("Removed " + l.p.name); }} aria-label={"Remove " + l.p.name} style={{ width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center", color: "var(--muted)" }}><Icon name="trash" size={17} /></button>
        </div>
      </div>
      <b style={{ alignSelf: "flex-start" }}>{money(l.total)}</b>
    </div>
  );
}

function PromoField() {
  const promo = useShop((s) => s.promo);
  const [v, setV] = useState(""); const [err, setErr] = useState("");
  if (promo) return <div className="pill-note" style={{ justifyContent: "space-between", width: "100%", borderRadius: 14, padding: "10px 14px" }}><span><Icon name="tag" size={14} /> {promo} applied — {Math.round(CFG.delivery.promoCodes[promo] * 100)}% off</span><button onClick={() => shop.set({ promo: null })} style={{ textDecoration: "underline" }}>Remove</button></div>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); const c = v.trim().toUpperCase(); if (CFG.delivery.promoCodes[c]) { shop.set({ promo: c }); setErr(""); toast("Promo applied"); } else setErr("That code isn't valid. Try FRESH10."); }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input className={"input" + (err ? " err" : "")} aria-label="Promo code" placeholder="Promo code" value={v} onChange={(e) => setV(e.target.value)} style={{ height: 44 }} />
        <button className="btn btn-ghost" type="submit">Apply</button>
      </div>
      {err && <div className="ferr" role="alert" style={{ marginTop: 6 }}>{err}</div>}
    </form>
  );
}

function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const s = useShop();
  const money = useMoney();
  const close = () => ui.set({ cartOpen: false });
  const ref = useDialog(open, close);
  if (!open) return null;
  const t = cart.totals(s);
  const inCart = new Set(s.cart.map((l) => l.id));
  const suggest = DATA.products.filter((p) => !inCart.has(p.id) && p.stock > 0 && p.salePrice).slice(0, 6);
  return (
    <>
      <div className="scrim" onClick={close} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" ref={ref}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid var(--line)" }}>
          <h2 style={{ fontSize: 20 }}>Your cart <span className="muted" style={{ fontWeight: 600, fontSize: 15 }}>({t.count})</span></h2>
          <button className="round" onClick={close} aria-label="Close cart"><Icon name="x" size={18} /></button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
          {t.lines.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", display: "grid", gap: 12, justifyItems: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--t-mint)", color: "var(--green)", display: "grid", placeItems: "center" }}><Icon name="cart" size={34} /></div>
              <h3>Your cart is empty</h3><p className="muted">Fresh picks are waiting for you.</p>
              <Link to="/shop" className="btn btn-green" onClick={close}>Start shopping</Link>
              {s.lastBasket && <button className="btn btn-ghost" onClick={() => { s.lastBasket.forEach((l) => cart.add(l.id, l.qty, l.w)); toast("Last basket restored"); }}><Icon name="repeat" size={16} /> Reorder last basket</button>}
            </div>
          ) : (
            <>
              <FreeDeliveryBar toFree={t.toFree} sub={t.sub} />
              <div style={{ marginTop: 6 }}>{t.lines.map((l) => <CartLine key={l.id + "-" + l.w} l={l} compact />)}</div>
            </>
          )}
          {suggest.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>You may also like</h3>
              <div className="track" style={{ gap: 10 }}>
                {suggest.map((p) => (
                  <div key={p.id} data-fly style={{ width: 150, background: "var(--bg)", borderRadius: 16, padding: 10 }}>
                    <div className={"tint-" + api.category(p.category).tint} style={{ borderRadius: 12, height: 90, display: "grid", placeItems: "center", overflow: "hidden" }}><img src={p.images[0]} alt="" className="blend" style={{ width: "76%", height: "86%", objectFit: "contain" }} /></div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, marginTop: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                      <b style={{ fontSize: 14, color: "var(--red)" }}>{money(p.salePrice)}</b>
                      <button aria-label={"Add " + p.name} onClick={(e) => { cart.add(p.id, 1, 0, e.currentTarget); toast(p.name + " added"); }} style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--green)", color: "#fff", display: "grid", placeItems: "center" }}><Icon name="plus" size={15} stroke={3} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {t.lines.length > 0 && (
          <div style={{ padding: "16px 20px calc(16px + env(safe-area-inset-bottom))", borderTop: "1px solid var(--line)", display: "grid", gap: 10 }}>
            <PromoField />
            <div style={{ display: "grid", gap: 4, fontSize: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">Subtotal</span><span>{money(t.sub)}</span></div>
              {t.disc > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "var(--green)" }}><span>Discount</span><span>−{money(t.disc)}</span></div>}
              <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">Delivery</span><span>{t.fee ? money(t.fee) : "Free"}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18, marginTop: 4 }}><span>Total</span><span>{money(t.total)}</span></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 8 }}>
              <Link to="/cart" className="btn btn-ghost" onClick={close}>View cart</Link>
              <Link to="/checkout" className="btn btn-green" onClick={close}><Icon name="lock" size={16} /> Checkout</Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function Footer() {
  const col = (title, links) => (
    <div key={title}>
      <h3 style={{ fontSize: 16, color: "#fff", marginBottom: 14 }}>{title}</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 4 }}>
        {links.map(([label, to, q]) => <li key={label}><Link to={to} query={q} className="flink" style={{ display: "inline-block", padding: "5px 0", color: "rgba(255,255,255,.78)", fontSize: 14.5 }}>{label}</Link></li>)}
      </ul>
    </div>
  );
  return (
    <footer style={{ background: "var(--footer)", color: "rgba(255,255,255,.82)", marginTop: 0, paddingBottom: 0 }}>
      <div className="wrap" style={{ paddingTop: 56, paddingBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap", alignItems: "center", paddingBottom: 32, borderBottom: "1px solid rgba(255,255,255,.12)" }}>
          <div style={{ maxWidth: 420 }}><Logo light /><p style={{ marginTop: 14, fontSize: 14.5 }}>{CFG.brand.blurb}</p></div>
          <a href={"tel:" + CFG.contact.phone.replace(/\s/g, "")} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--lime)", color: "var(--green-900)", display: "grid", placeItems: "center" }}><Icon name="phone" size={26} /></span>
            <span><span style={{ display: "block", fontSize: 14 }}>Need help? Call us:</span><span style={{ display: "block", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#fff", letterSpacing: "-.02em" }}>{CFG.contact.phone}</span></span>
          </a>
        </div>
        <div className="fgrid" style={{ display: "grid", gap: 28, paddingTop: 36 }}>
          {CFG.footer.columns.map((c) => col(c.title, c.links))}
          <div>
            <h3 style={{ fontSize: 16, color: "#fff", marginBottom: 14 }}>Contacts</h3>
            <div style={{ display: "grid", gap: 10, fontSize: 14.5 }}>
              <span style={{ display: "flex", gap: 8 }}><Icon name="pin" size={17} style={{ flex: "none", marginTop: 2, color: "var(--lime)" }} />{CFG.contact.address}</span>
              <a href={"tel:" + CFG.contact.phone2.replace(/\s/g, "")} style={{ display: "flex", gap: 8 }}><Icon name="phone" size={17} style={{ color: "var(--lime)" }} />{CFG.contact.phone2}</a>
              <a href={"mailto:" + CFG.contact.email} style={{ display: "flex", gap: 8 }}><Icon name="mail" size={17} style={{ color: "var(--lime)" }} />{CFG.contact.email}</a>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: 16, color: "#fff", marginBottom: 14 }}>Download App</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {[["App Store", "Download on the"], ["Google Play", "Get it on"]].map(([n, s]) => (
                <a key={n} href="#" onClick={(e) => { e.preventDefault(); toast("App badges are placeholders — add store links in config"); }} style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(255,255,255,.25)", borderRadius: 12, padding: "8px 14px", width: 170 }}>
                  <Icon name={n === "App Store" ? "apple" : "send"} size={22} />
                  <span style={{ lineHeight: 1.1 }}><span style={{ fontSize: 10.5, display: "block" }}>{s}</span><b style={{ color: "#fff" }}>{n}</b></span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginTop: 40, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,.12)", fontSize: 13.5 }}>
          <span>© {new Date().getFullYear()} {CFG.brand.name}. All rights reserved. · <Link to="/policies" style={{ textDecoration: "underline" }}>Privacy</Link> · <Link to="/policies" query={{ tab: "terms" }} style={{ textDecoration: "underline" }}>Terms</Link></span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} aria-label="Accepted payment methods">
            {CFG.footer.paymentIcons.map((p) => <span key={p} style={{ background: "#fff", color: "var(--ink)", fontWeight: 800, fontSize: 11, padding: "6px 10px", borderRadius: 6 }}>{p}</span>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppButton() {
  if (!CFG.contact.whatsapp) return null;
  return (
    <a href={`https://wa.me/${CFG.contact.whatsapp}?text=${encodeURIComponent("Hi " + CFG.brand.name + ", I'd like to place an order")}`} target="_blank" rel="noopener" aria-label="Order on WhatsApp" className="wa"
      style={{ position: "fixed", right: 18, zIndex: 54, width: 54, height: 54, borderRadius: "50%", background: "#25D366", color: "#fff", display: "grid", placeItems: "center", boxShadow: "0 10px 24px rgba(37,211,102,.4)" }}>
      <Icon name="whatsapp" size={26} />
    </a>
  );
}

Object.assign(window, { Logo, UtilityBar, Header, SearchBox, MobileMenu, MobileSearch, BottomNav, CartDrawer, CartLine, FreeDeliveryBar, PromoField, Footer, WhatsAppButton });

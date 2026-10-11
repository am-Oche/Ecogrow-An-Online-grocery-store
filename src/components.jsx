/* ==========================================================================
   SHARED COMPONENTS — Badge, Stepper, ProductCard, Tabs, Accordion,
   Countdown, Carousel, QuickView, Toasts, Skeleton, EmptyState, etc.
   ========================================================================== */

function Badge({ text }) {
  if (!text) return null;
  const t = text.toLowerCase();
  const cls = t === "new" ? "new" : t === "hot" ? "hot" : t.includes("off") ? "off" : t === "organic" ? "org" : t === "sold out" ? "out" : "soft";
  return <span className={"badge " + cls}>{text}</span>;
}

function Stars({ value = 5, size = 14 }) {
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" size={size} stroke={1.5} fill={i <= Math.round(value) ? "currentColor" : "none"} />)}
    </span>
  );
}

function QuantityStepper({ value, onChange, min = 0, max = 99, light, lg, label = "quantity" }) {
  const [k, setK] = useState(0);
  const ch = (d) => { const v = Math.max(min, Math.min(max, value + d)); if (v !== value) { onChange(v); setK((x) => x + 1); } };
  return (
    <div className={"stepper" + (light ? " light" : "") + (lg ? " lg" : "")} role="group" aria-label={label}>
      <button aria-label="Decrease" onClick={() => ch(-1)}><Icon name="minus" size={16} stroke={2.5} /></button>
      <output key={k} className="bump" aria-live="polite">{String(value).padStart(2, "0")}</output>
      <button aria-label="Increase" onClick={() => ch(1)} disabled={value >= max}><Icon name="plus" size={16} stroke={2.5} /></button>
    </div>
  );
}

function AddControl({ p }) {
  const qty = useShop((s) => s.cart.filter((l) => l.id === p.id).reduce((a, l) => a + l.qty, 0));
  const [notified, setNotified] = useState(false);
  if (p.stock === 0) return (
    <button className="add" onClick={() => { setNotified(true); toast(`We'll email you when ${p.name} is back`); }} aria-label={`Notify me when ${p.name} is back in stock`}>
      <Icon name="bell" size={16} /> {notified ? "Set" : "Notify"}
    </button>
  );
  return (
    <div className="addwrap">
      {qty === 0
        ? <button className="add" onClick={(e) => { cart.add(p.id, 1, 0, e.currentTarget); toast(`${p.name} added to cart`); }} aria-label={`Add ${p.name} to cart`}><span className="pl"><Icon name="plus" size={14} stroke={3} /></span>Add</button>
        : <QuantityStepper value={qty} max={p.stock} onChange={(v) => cart.step(p.id, v - qty)} label={`${p.name} quantity`} />}
    </div>
  );
}

function Price({ p, mult = 1, big }) {
  const money = useMoney();
  const style = big ? { fontSize: 30 } : null;
  return p.salePrice
    ? <span className="price sale" style={style}>{money(p.salePrice * mult)}<s>{money(p.price * mult)}</s></span>
    : <span className="price" style={style}>{money(p.price * mult)}</span>;
}

function HeartBtn({ id, size = 18, className = "" }) {
  const on = useShop((s) => s.wish.includes(id));
  return (
    <button className={"heart " + (on ? "on " : "") + className} aria-pressed={on} aria-label={on ? "Remove from wishlist" : "Add to wishlist"} onClick={() => { wish.toggle(id); toast(on ? "Removed from wishlist" : "Saved to wishlist"); }}>
      <Icon name="heart" size={size} />
    </button>
  );
}

function ProductCard({ p, list }) {
  const unit = useUnit();
  const cat = api.category(p.category);
  const badge = p.stock === 0 ? "Sold out" : p.badge;
  if (list) return (
    <article className="pc" data-fly style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
      <Link to={"/product/" + p.slug} className={"pc-img tint-" + cat.tint} style={{ width: 150, flex: "none" }}>
        <img className="blend" src={p.images[0]} alt={p.name} loading="lazy" />
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Badge text={badge} />
        <div className="pc-cat" style={{ marginTop: 8 }}>{cat.name}</div>
        <Link to={"/product/" + p.slug} className="pc-name" style={{ display: "block", fontSize: 17 }}>{p.name}</Link>
        <div className="pc-w">{unit(p.weights[0].label)} · {p.brand} · <Stars value={p.rating} size={12} /> ({p.reviews})</div>
        <p className="muted" style={{ fontSize: 14, marginTop: 6, maxWidth: 560, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, paddingRight: 8 }}>
        <Price p={p} />
        <AddControl p={p} />
        <HeartBtn id={p.id} />
      </div>
    </article>
  );
  return (
    <article className="pc" data-fly>
      <div className={"pc-img tint-" + cat.tint}>
        <div className="pc-badge"><Badge text={badge} /></div>
        <div className="pc-act">
          <HeartBtn id={p.id} />
          <button className="qv" aria-label={`Quick view ${p.name}`} onClick={() => ui.set({ quick: p.id })}><Icon name="eye" size={18} /></button>
        </div>
        <Link to={"/product/" + p.slug} aria-label={p.name} style={{ display: "contents" }}>
          <img className="blend" src={p.images[0]} alt={p.name} loading="lazy" style={p.stock === 0 ? { filter: "grayscale(.6)", opacity: .7 } : null} />
        </Link>
      </div>
      <div className="pc-body">
        <div className="pc-cat">{cat.name}</div>
        <Link to={"/product/" + p.slug} className="pc-name">{p.name}</Link>
        <div className="pc-w">{unit(p.weights[0].label)}</div>
        {p.stock > 0 && p.stock <= 5 && <div className="low">Only {p.stock} left</div>}
        <div className="pc-foot"><Price p={p} /><AddControl p={p} /></div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="pc" aria-hidden="true">
      <div className="sk" style={{ aspectRatio: "1/.86", borderRadius: 16 }} />
      <div style={{ padding: "12px 6px" }}>
        <div className="sk" style={{ height: 10, width: "40%" }} />
        <div className="sk" style={{ height: 14, width: "80%", marginTop: 10 }} />
        <div className="sk" style={{ height: 30, width: "100%", marginTop: 18, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function EmptyState({ icon = "box", title, text, action }) {
  return (
    <div className="card" style={{ padding: "56px 24px", textAlign: "center", display: "grid", justifyItems: "center", gap: 10 }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--t-mint)", color: "var(--green)", display: "grid", placeItems: "center" }}><Icon name={icon} size={30} /></div>
      <h3 style={{ fontSize: 20 }}>{title}</h3>
      {text && <p className="muted" style={{ maxWidth: 380 }}>{text}</p>}
      {action}
    </div>
  );
}

/* ---- Tabs: sliding pill, ARIA tablist, arrow keys, auto-scroll-to-active ---- */
function Tabs({ tabs, value, onChange, variant = "", label = "Tabs", idBase = "tab" }) {
  const ref = useRef(null);
  const [pill, setPill] = useState({ x: 0, w: 0, ready: false });
  const measure = useCallback(() => {
    const el = ref.current?.querySelector(`[data-id="${value}"]`);
    if (!el) return;
    setPill({ x: el.offsetLeft, w: el.offsetWidth, ready: true });
    const box = ref.current;
    const target = el.offsetLeft - box.clientWidth / 2 + el.offsetWidth / 2;
    box.scrollTo({ left: target, behavior: "smooth" });
  }, [value]);
  useLayoutEffect(measure, [measure, tabs.length]);
  useEffect(() => { const r = () => measure(); window.addEventListener("resize", r); document.fonts?.ready.then(r); return () => window.removeEventListener("resize", r); }, [measure]);
  const onKey = (e) => {
    const i = tabs.findIndex((t) => t.id === value);
    let n = null;
    if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
    if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = tabs.length - 1;
    if (n !== null) { e.preventDefault(); onChange(tabs[n].id); requestAnimationFrame(() => ref.current.querySelector(`[data-id="${tabs[n].id}"]`)?.focus()); }
  };
  return (
    <div className={"tabs " + variant} role="tablist" aria-label={label} ref={ref} onKeyDown={onKey}>
      <span className="tab-pill" aria-hidden="true" style={{ width: pill.w, transform: `translateX(${pill.x - (variant.includes("underline") ? 0 : 4)}px)`, left: variant.includes("underline") ? 0 : 4, opacity: pill.ready ? 1 : 0 }} />
      {tabs.map((t) => (
        <button key={t.id} data-id={t.id} role="tab" id={`${idBase}-${t.id}`} aria-controls={`${idBase}-panel`} aria-selected={t.id === value} tabIndex={t.id === value ? 0 : -1} className="tab" onClick={() => onChange(t.id)}>
          {t.icon && <Icon name={t.icon} size={17} />}{t.label}{t.count != null && <span style={{ opacity: .7, fontWeight: 600 }}>({t.count})</span>}
        </button>
      ))}
    </div>
  );
}

/* ---- Animated grid: FLIP reflow + fade/scale for enter ---- */
function AnimatedGrid({ items, render, className = "pgrid c4", keyOf = (x) => x.id }) {
  const ref = useRef(null);
  const prev = useRef(new Map());
  useLayoutEffect(() => {
    const box = ref.current; if (!box) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map();
    [...box.children].forEach((el, i) => {
      const k = el.dataset.k; const r = el.getBoundingClientRect(); next.set(k, r);
      if (reduce) return;
      const old = prev.current.get(k);
      if (old) {
        const dx = old.left - r.left, dy = old.top - r.top;
        if (dx || dy) el.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: "none" }], { duration: 480, easing: "cubic-bezier(.22,.9,.3,1)" });
      } else {
        el.animate([{ opacity: 0, transform: "scale(.92) translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 460, delay: Math.min(i, 8) * 40, easing: "cubic-bezier(.22,.9,.3,1)", fill: "backwards" });
      }
    });
    prev.current = next;
  });
  return <div className={className} ref={ref}>{items.map((x) => <div key={keyOf(x)} data-k={keyOf(x)} style={{ display: "grid" }}>{render(x)}</div>)}</div>;
}

/* ---- Accordion: single-open, animated height (grid-rows) ---- */
function Accordion({ items, defaultOpen = 0, light }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={"acc-item" + (isOpen ? " open" : "")}>
            <h3 style={{ margin: 0 }}>
              <button className="acc-btn" aria-expanded={isOpen} aria-controls={`acc-${i}`} id={`accb-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                {it.q}<span className="chev"><Icon name="chevD" size={16} stroke={2.5} /></span>
              </button>
            </h3>
            <div className="acc-panel" id={`acc-${i}`} role="region" aria-labelledby={`accb-${i}`}><div><p>{it.a}</p></div></div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Countdown with flipping digits ---- */
function useCountdown(end) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, new Date(end).getTime() - now);
  return { d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60 };
}
function Countdown({ end }) {
  const t = useCountdown(end);
  const cells = [["d", "days"], ["h", "hr"], ["m", "min"], ["s", "sec"]];
  return (
    <div role="timer" aria-label={`Deal ends in ${t.d} days ${t.h} hours ${t.m} minutes`} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      {cells.map(([k, lbl], i) => (
        <React.Fragment key={k}>
          <div style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)", borderRadius: 12, padding: "6px 10px", minWidth: 58, textAlign: "center", perspective: 200 }}>
            <div style={{ fontWeight: 800, fontSize: 22, fontVariantNumeric: "tabular-nums", color: "var(--lime)", overflow: "hidden" }}><span key={t[k]} className="flip">{String(t[k]).padStart(2, "0")}</span></div>
            <div style={{ fontSize: 11, opacity: .8, letterSpacing: ".06em", textTransform: "uppercase" }}>{lbl}</div>
          </div>
          {i < 3 && <span style={{ opacity: .5, fontWeight: 800 }}>:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---- Carousel: native scroll-snap + mouse drag with inertia + arrows ---- */
function Carousel({ children, label, arrows = "top", title, itemWidth = 220, gap = 18, extra }) {
  const ref = useRef(null);
  const [can, setCan] = useState({ l: false, r: true });
  const upd = () => { const el = ref.current; if (!el) return; setCan({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 }); };
  useEffect(() => { upd(); const el = ref.current; el.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd); return () => { el.removeEventListener("scroll", upd); window.removeEventListener("resize", upd); }; }, []);
  const go = (d) => { const el = ref.current; el.scrollBy({ left: d * Math.max(el.clientWidth * 0.8, itemWidth), behavior: "smooth" }); };
  // drag-to-scroll with inertia (mouse only; touch uses native)
  useEffect(() => {
    const el = ref.current; let down = false, sx = 0, sl = 0, v = 0, lx = 0, lt = 0, raf, moved = false;
    const md = (e) => { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = lx = e.clientX; sl = el.scrollLeft; lt = performance.now(); cancelAnimationFrame(raf); };
    const mm = (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5 && !moved) { moved = true; el.classList.add("dragging"); } if (!moved) return; el.scrollLeft = sl - dx; const t = performance.now(); v = (e.clientX - lx) / Math.max(1, t - lt); lx = e.clientX; lt = t; };
    const mu = () => { if (!down) return; down = false; if (!moved) return; let vel = v * 16; const step = () => { el.scrollLeft -= vel; vel *= 0.92; if (Math.abs(vel) > 0.5) raf = requestAnimationFrame(step); else el.classList.remove("dragging"); }; step(); setTimeout(() => el.classList.remove("dragging"), 400); };
    const clk = (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } };
    el.addEventListener("pointerdown", md); window.addEventListener("pointermove", mm); window.addEventListener("pointerup", mu); el.addEventListener("click", clk, true);
    return () => { el.removeEventListener("pointerdown", md); window.removeEventListener("pointermove", mm); window.removeEventListener("pointerup", mu); el.removeEventListener("click", clk, true); };
  }, []);
  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      {(title || arrows === "top") && (
        <div className="sh">
          <div>{title}</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {extra}
            <button className="round" onClick={() => go(-1)} disabled={!can.l} aria-label="Previous"><Icon name="arrowL" size={18} /></button>
            <button className="round dark" onClick={() => go(1)} disabled={!can.r} aria-label="Next"><Icon name="arrowR" size={18} /></button>
          </div>
        </div>
      )}
      <div className="track" ref={ref} style={{ gap }}>{children}</div>
    </div>
  );
}

function SectionHeading({ title, sub, center, right }) {
  return (
    <div className={"sh" + (center ? " center" : "")}>
      <div><h2>{title}</h2>{sub && <p className="sub">{sub}</p>}</div>
      {right}
    </div>
  );
}

function CategoryTile({ c }) {
  const count = c.query?.cat ? api.count(c.query.cat) : c.query?.q ? api.search(c.query.q).length : 0;
  return (
    <Link to="/shop" query={c.query} className={"tint-" + c.tint} style={{ width: 150, borderRadius: 22, padding: "18px 12px 16px", display: "grid", justifyItems: "center", textAlign: "center", gap: 6, transition: "transform .35s var(--ease), box-shadow .35s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
      <div style={{ width: 86, height: 86, borderRadius: "50%", background: "rgba(255,255,255,.65)", display: "grid", placeItems: "center", overflow: "hidden" }}>
        <img src={c.img} alt="" className="blend" style={{ width: "88%", height: "88%", objectFit: "contain" }} loading="lazy" draggable="false" />
      </div>
      <div style={{ fontWeight: 800, fontSize: 14.5, marginTop: 4 }}>{c.label}</div>
      <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>{count} items</div>
    </Link>
  );
}

/* ---- Quick view modal (focus trapped, Esc to close) ---- */
function useDialog(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    const el = ref.current;
    setTimeout(() => el?.querySelector("button, a, input, select")?.focus(), 30);
    const key = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && el) {
        const f = [...el.querySelectorAll("button:not([disabled]), a[href], input, select, textarea, [tabindex='0']")];
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); document.body.style.overflow = ""; prevFocus?.focus?.(); };
  }, [open]);
  return ref;
}

function QuickView() {
  const id = useUI((s) => s.quick);
  const close = () => ui.set({ quick: null });
  const ref = useDialog(!!id, close);
  const [w, setW] = useState(0); const [q, setQ] = useState(1);
  const unit = useUnit();
  useEffect(() => { setW(0); setQ(1); }, [id]);
  if (!id) return null;
  const p = api.byId(id); const cat = api.category(p.category);
  return (
    <>
      <div className="scrim" onClick={close} />
      <div className="modal" role="dialog" aria-modal="true" aria-label={`Quick view: ${p.name}`} ref={ref}>
        <button className="round" onClick={close} aria-label="Close" style={{ position: "absolute", right: 14, top: 14, zIndex: 3 }}><Icon name="x" size={18} /></button>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <div className={"tint-" + cat.tint} style={{ display: "grid", placeItems: "center", minHeight: 340, position: "relative" }} data-fly>
            <div style={{ position: "absolute", top: 18, left: 18 }}><Badge text={p.badge} /></div>
            <img src={p.images[0]} alt={p.name} className="blend" style={{ width: "78%", maxHeight: 380, objectFit: "contain" }} />
          </div>
          <div style={{ padding: "36px 32px", display: "grid", gap: 14, alignContent: "start" }}>
            <div className="pc-cat">{cat.name} · {p.brand}</div>
            <h2 style={{ fontSize: 28 }}>{p.name}</h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}><Stars value={p.rating} /> <b>{p.rating}</b> <span className="muted">({p.reviews} reviews)</span></div>
            <Price p={p} mult={p.weights[w].mult} big />
            <p className="muted">{p.description}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {p.weights.map((x, i) => <button key={i} className="btn btn-sm" onClick={() => setW(i)} style={{ border: "1.5px solid " + (i === w ? "var(--green)" : "var(--line)"), background: i === w ? "var(--t-mint)" : "#fff", color: i === w ? "var(--green)" : "inherit" }}>{unit(x.label)}</button>)}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 6 }}>
              {p.stock > 0 ? <>
                <QuantityStepper value={q} min={1} max={p.stock} onChange={setQ} light lg />
                <button className="btn btn-green" style={{ minHeight: 50, flex: 1 }} onClick={(e) => { cart.add(p.id, q, w, e.currentTarget); toast(`${q} × ${p.name} added`); close(); }}><Icon name="cart" size={18} /> Add to cart</button>
              </> : <button className="btn btn-red" onClick={() => toast("We'll let you know when it's back")}><Icon name="bell" size={18} /> Notify me</button>}
              <HeartBtn id={p.id} className="round" />
            </div>
            <Link to={"/product/" + p.slug} onClick={close} style={{ fontWeight: 700, color: "var(--green)", display: "inline-flex", gap: 6, alignItems: "center" }}>View full details <Icon name="arrowR" size={16} /></Link>
          </div>
        </div>
      </div>
    </>
  );
}

function Toasts() {
  const ts = useUI((s) => s.toasts);
  return <div className="toasts" role="status" aria-live="polite">{ts.map((t) => <div key={t.id} className="toast"><span className="ok"><Icon name="check" size={14} stroke={3} /></span>{t.msg}</div>)}</div>;
}

function Crumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      <Link to="/">Home</Link>
      {items.map((it, i) => <React.Fragment key={i}><span aria-hidden="true">/</span>{it.to ? <Link to={it.to} query={it.query}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}</React.Fragment>)}
    </nav>
  );
}

function PageHead({ title, sub, crumbs }) {
  return (
    <div className="wrap">
      <Crumbs items={crumbs || [{ label: title }]} />
      <div style={{ background: "var(--green)", color: "#fff", borderRadius: "var(--r-xl)", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
        <TopoLines color="rgba(200,240,49,.12)" />
        <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", position: "relative" }}>{title}</h1>
        {sub && <p style={{ opacity: .85, marginTop: 8, position: "relative", maxWidth: 620 }}>{sub}</p>}
      </div>
    </div>
  );
}

/* topographic texture (decorative) */
function TopoLines({ color = "rgba(255,255,255,.1)" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} fill="none" stroke={color} strokeWidth="1.4" d={`M${-50 + i * 6} ${300 - i * 22} C ${120 + i * 10} ${230 - i * 26}, ${220 - i * 4} ${330 - i * 30}, ${380 + i * 8} ${210 - i * 22} S ${560} ${140 - i * 14}, ${680} ${180 - i * 20}`} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => <ellipse key={"e" + i} cx="500" cy="60" rx={30 + i * 26} ry={18 + i * 16} fill="none" stroke={color} strokeWidth="1.4" />)}
    </svg>
  );
}

Object.assign(window, { Badge, Stars, QuantityStepper, AddControl, Price, HeartBtn, ProductCard, SkeletonCard, EmptyState, Tabs, AnimatedGrid, Accordion, Countdown, useCountdown, Carousel, SectionHeading, CategoryTile, QuickView, Toasts, Crumbs, PageHead, TopoLines, useDialog });

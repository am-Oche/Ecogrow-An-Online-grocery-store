/* ==========================================================================
   SHOP / CATEGORY / SEARCH / PRODUCT DETAIL
   All filters sync to the URL query (shareable, back-button safe).
   ========================================================================== */

const SORTS = [
  { id: "pop", label: "Most popular" },
  { id: "new", label: "Newest" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
  { id: "discount", label: "Biggest discount" },
];
const PAGE = 12;

function applyFilters(list, q) {
  const cats = q.cat ? q.cat.split(",") : [];
  const tags = q.tags ? q.tags.split(",") : [];
  const brands = q.brand ? q.brand.split(",") : [];
  const min = q.min ? +q.min : 0, max = q.max ? +q.max : Infinity;
  let r = list.filter((p) => {
    const price = p.salePrice ?? p.price;
    if (cats.length && !cats.includes(p.category)) return false;
    if (tags.length && !tags.every((t) => p.tags.includes(t))) return false;
    if (brands.length && !brands.includes(p.brand)) return false;
    if (price < min || price > max) return false;
    if (q.rating && p.rating < +q.rating) return false;
    if (q.stock === "1" && p.stock === 0) return false;
    if (q.sale === "1" && !p.salePrice) return false;
    if (q.q && !api.search(q.q).includes(p)) return false;
    return true;
  });
  const s = q.sort || "pop";
  const pr = (p) => p.salePrice ?? p.price;
  r = [...r].sort((a, b) => s === "low" ? pr(a) - pr(b) : s === "high" ? pr(b) - pr(a) : s === "rating" ? b.rating - a.rating : s === "new" ? b.createdAt - a.createdAt : s === "discount" ? discountPct(b) - discountPct(a) : b.reviews - a.reviews);
  return r;
}

function toggleList(csv, v) { const a = csv ? csv.split(",") : []; return (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]).join(","); }

function Filters({ q }) {
  const money = useMoney();
  const maxPrice = Math.ceil(Math.max(...DATA.products.map((p) => p.price)));
  const [range, setRange] = useState(q.max ? +q.max : maxPrice);
  useEffect(() => setRange(q.max ? +q.max : maxPrice), [q.max]);
  const box = (title, children) => <fieldset style={{ border: 0, padding: 0, margin: "0 0 22px" }}><legend style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>{title}</legend>{children}</fieldset>;
  const upd = (patch) => setQuery({ ...patch, page: "" });
  return (
    <div>
      {box("Category", DATA.categories.map((c) => (
        <label key={c.id} className="chk"><input type="checkbox" checked={(q.cat || "").split(",").includes(c.id)} onChange={() => upd({ cat: toggleList(q.cat, c.id) })} />{c.name}<span className="muted" style={{ marginLeft: "auto", fontSize: 13 }}>{api.count(c.id)}</span></label>
      )))}
      {box("Price", <>
        <input type="range" min="1" max={maxPrice} value={range} onChange={(e) => setRange(+e.target.value)} onPointerUp={() => upd({ max: range >= maxPrice ? "" : range })} onKeyUp={() => upd({ max: range >= maxPrice ? "" : range })} aria-label="Maximum price" style={{ width: "100%", accentColor: "var(--green)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }} className="muted"><span>{money(0)}</span><b style={{ color: "var(--ink)" }}>up to {money(range)}</b></div>
      </>)}
      {box("Dietary & quality", CFG.dietaryTags.map((t) => <label key={t.id} className="chk"><input type="checkbox" checked={(q.tags || "").split(",").includes(t.id)} onChange={() => upd({ tags: toggleList(q.tags, t.id) })} />{t.label}</label>))}
      {box("Brand", DATA.brands.map((b) => <label key={b} className="chk"><input type="checkbox" checked={(q.brand || "").split(",").includes(b)} onChange={() => upd({ brand: toggleList(q.brand, b) })} />{b}</label>))}
      {box("Rating", [4.5, 4, 0].map((r) => <label key={r} className="chk"><input type="radio" name="rating" checked={(+q.rating || 0) === r} onChange={() => upd({ rating: r || "" })} />{r ? <><Stars value={r} size={13} /> {r}+</> : "Any rating"}</label>))}
      {box("Availability", <>
        <label className="chk"><input type="checkbox" checked={q.stock === "1"} onChange={() => upd({ stock: q.stock === "1" ? "" : "1" })} />In stock only</label>
        <label className="chk"><input type="checkbox" checked={q.sale === "1"} onChange={() => upd({ sale: q.sale === "1" ? "" : "1" })} />On sale</label>
      </>)}
    </div>
  );
}

function ShopPage({ query: q, searchMode }) {
  const [view, setView] = useState(q.view || "grid");
  const filterOpen = useUI((s) => s.filterOpen);
  const [loading, setLoading] = useState(true);
  const sig = JSON.stringify(q);
  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), 260); return () => clearTimeout(t); }, [sig]);
  const results = useMemo(() => applyFilters(api.products(), q), [sig]);
  const page = +q.page || 1;
  const shown = results.slice(0, page * PAGE);
  const singleCat = q.cat && !q.cat.includes(",") ? api.category(q.cat) : null;
  const title = searchMode ? `Results for “${q.q || ""}”` : singleCat ? singleCat.name : q.sale ? "On sale" : "All products";
  useEffect(() => { document.title = `${title} — ${CFG.brand.name}`; }, [title]);
  // tabs reuse product tab config; selecting syncs ?cat
  const tabId = CFG.productTabs.find((t) => t.filter === (q.cat || "all"))?.id || (q.cat ? null : "all");
  const active = [
    ...(q.cat ? q.cat.split(",").map((c) => ["cat", c, catName(c)]) : []),
    ...(q.tags ? q.tags.split(",").map((t) => ["tags", t, t]) : []),
    ...(q.brand ? q.brand.split(",").map((b) => ["brand", b, b]) : []),
    ...(q.max ? [["max", "", "≤ " + q.max]] : []),
    ...(q.rating ? [["rating", "", q.rating + "★+"]] : []),
    ...(q.stock ? [["stock", "", "In stock"]] : []),
    ...(q.sale ? [["sale", "", "On sale"]] : []),
  ];
  // infinite scroll sentinel
  const sent = useRef(null);
  useEffect(() => {
    if (!sent.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && shown.length < results.length) setQuery({ page: page + 1 }, { replace: true }); }, { rootMargin: "300px" });
    io.observe(sent.current); return () => io.disconnect();
  }, [shown.length, results.length, page]);

  return (
    <div className="wrap">
      <Crumbs items={searchMode ? [{ label: "Search" }] : singleCat ? [{ label: "Shop", to: "/shop" }, { label: singleCat.name }] : [{ label: "Shop" }]} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div><h1 style={{ fontSize: "clamp(26px, 3.4vw, 40px)", fontWeight: 800 }}>{title}</h1><p className="muted" style={{ marginTop: 4 }}>{results.length} products</p></div>
        {searchMode && <div style={{ width: "min(100%, 460px)" }}><SearchBox key={q.q} /></div>}
      </div>
      {!searchMode && tabId !== null && <div style={{ marginBottom: 20 }}><Tabs tabs={CFG.productTabs} value={tabId} variant="green" label="Shop by category" idBase="shop-tab" onChange={(id) => { const t = CFG.productTabs.find((x) => x.id === id); setQuery({ cat: t.filter === "all" ? "" : t.filter, page: "" }); }} /></div>}
      <div className="shop-grid" style={{ display: "grid", gap: 28, alignItems: "start" }}>
        <aside className="hide-m card" style={{ padding: 22, position: "sticky", top: 90 }} aria-label="Filters"><Filters q={q} /></aside>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
            <button className="btn btn-ghost hide-d" onClick={() => ui.set({ filterOpen: true })}><Icon name="sliders" size={17} /> Filters{active.length ? ` (${active.length})` : ""}</button>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
              {active.map(([k, v, l]) => <button key={k + v} className="pill-note" onClick={() => setQuery({ [k]: v ? toggleList(q[k], v) : "", page: "" })} aria-label={"Remove filter " + l}>{l} <Icon name="x" size={13} stroke={3} /></button>)}
              {active.length > 1 && <button onClick={() => navigate(searchMode ? "/search" : "/shop", searchMode ? { q: q.q } : {}, { keepScroll: true })} style={{ fontWeight: 700, fontSize: 13, textDecoration: "underline", padding: "0 6px" }}>Clear all</button>}
            </div>
            <label className="sr" htmlFor="sort">Sort by</label>
            <select id="sort" className="input" style={{ width: "auto", height: 44 }} value={q.sort || "pop"} onChange={(e) => setQuery({ sort: e.target.value === "pop" ? "" : e.target.value, page: "" })}>
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <div role="group" aria-label="View" style={{ display: "flex", gap: 6 }}>
              {["grid", "list"].map((v) => <button key={v} className={"round" + (view === v ? " dark" : "")} aria-pressed={view === v} aria-label={v + " view"} onClick={() => { setView(v); setQuery({ view: v === "grid" ? "" : v }, { replace: true }); }}><Icon name={v} size={17} /></button>)}
            </div>
          </div>
          {loading ? <div className="pgrid">{Array.from({ length: 6 }).map((_, k) => <SkeletonCard key={k} />)}</div>
            : results.length === 0 ? <EmptyState icon="search" title="No products match" text="Try removing a filter or searching for something else." action={<button className="btn btn-green" onClick={() => navigate("/shop")}>Reset filters</button>} />
            : view === "list" ? <div style={{ display: "grid", gap: 14 }}>{shown.map((p) => <ProductCard key={p.id} p={p} list />)}</div>
            : <AnimatedGrid items={shown} className="pgrid" render={(p) => <ProductCard p={p} />} />}
          <div ref={sent} style={{ height: 1 }} />
          {!loading && shown.length < results.length && <div style={{ textAlign: "center", marginTop: 24 }}><button className="btn btn-ghost" onClick={() => setQuery({ page: page + 1 }, { replace: true })}>Load more ({results.length - shown.length} left)</button></div>}
          {!loading && results.length > PAGE && shown.length >= results.length && <p className="muted" style={{ textAlign: "center", marginTop: 24 }}>You've seen all {results.length} products.</p>}
        </div>
      </div>
      {filterOpen && <FilterDrawer q={q} count={results.length} />}
    </div>
  );
}

function FilterDrawer({ q, count }) {
  const close = () => ui.set({ filterOpen: false });
  const ref = useDialog(true, close);
  return (
    <>
      <div className="scrim" onClick={close} />
      <aside className="drawer left" role="dialog" aria-modal="true" aria-label="Filters" ref={ref}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 18, borderBottom: "1px solid var(--line)" }}><h2 style={{ fontSize: 20 }}>Filters</h2><button className="round" onClick={close} aria-label="Close filters"><Icon name="x" size={18} /></button></div>
        <div style={{ flex: 1, overflow: "auto", padding: 20 }}><Filters q={q} /></div>
        <div style={{ padding: 16, borderTop: "1px solid var(--line)" }}><button className="btn btn-green btn-block" onClick={close}>Show {count} products</button></div>
      </aside>
    </>
  );
}

function CategoriesPage() {
  useEffect(() => { document.title = "Categories — " + CFG.brand.name; }, []);
  return (
    <>
      <PageHead title="All categories" sub="Browse every aisle of our farm-fresh store." />
      <div className="wrap" style={{ marginTop: 28, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))" }}>
        {DATA.categories.map((c) => (
          <Link key={c.id} to="/shop" query={{ cat: c.id }} className={"tint-" + c.tint} style={{ borderRadius: "var(--r-lg)", padding: 22, display: "flex", alignItems: "center", gap: 16, minHeight: 120, transition: "transform .3s var(--ease)" }}>
            <span style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.7)", display: "grid", placeItems: "center", overflow: "hidden", flex: "none" }}><img src={c.img} alt="" className="blend" style={{ width: "86%", height: "86%", objectFit: "contain" }} /></span>
            <span><b style={{ fontSize: 18 }}>{c.name}</b><br /><span className="muted">{api.count(c.id)} products</span></span>
          </Link>
        ))}
      </div>
    </>
  );
}

/* ---------------- product detail ---------------- */
function Gallery({ p }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(null);
  const cat = api.category(p.category);
  const imgs = [p.images[0], p.images[0], cat.img];
  return (
    <div>
      <div className={"tint-" + cat.tint} data-fly style={{ position: "relative", borderRadius: "var(--r-xl)", aspectRatio: "1/1", overflow: "hidden", cursor: "zoom-in", display: "grid", placeItems: "center" }}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }} onMouseLeave={() => setZoom(null)}>
        <div style={{ position: "absolute", top: 18, left: 18, zIndex: 2 }}><Badge text={p.stock === 0 ? "Sold out" : p.badge} /></div>
        <img key={i} src={imgs[i]} alt={p.name} className="blend" style={{ width: i === 1 ? "100%" : "80%", height: i === 1 ? "100%" : "80%", objectFit: i === 1 ? "cover" : "contain", transform: zoom ? "scale(1.9)" : "none", transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "center", transition: zoom ? "transform .15s" : "transform .4s var(--ease)", animation: "fade .4s" }} />
        <span className="pill-note" style={{ position: "absolute", bottom: 14, right: 14, background: "#fff" }}><Icon name="zoom" size={14} /> Hover to zoom</span>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        {imgs.map((src, k) => <button key={k} onClick={() => setI(k)} aria-label={`Image ${k + 1}`} aria-pressed={k === i} className={"tint-" + cat.tint} style={{ width: 80, height: 80, borderRadius: 16, overflow: "hidden", border: "2.5px solid " + (k === i ? "var(--green)" : "transparent"), display: "grid", placeItems: "center" }}><img src={src} alt="" className="blend" style={{ width: k === 1 ? "100%" : "80%", height: k === 1 ? "100%" : "80%", objectFit: k === 1 ? "cover" : "contain" }} /></button>)}
      </div>
    </div>
  );
}

function ProductPage({ slug, query }) {
  const p = api.product(slug);
  const unit = useUnit();
  const [w, setW] = useState(0);
  const [q, setQ] = useState(1);
  const recent = useShop((s) => s.recent);
  const unitPref = useShop((s) => s.unit);
  const money = useMoney();
  useEffect(() => {
    if (!p) return;
    setW(0); setQ(1);
    document.title = `${p.name} — ${CFG.brand.name}`;
    shop.set((s) => ({ recent: [p.id, ...s.recent.filter((x) => x !== p.id)].slice(0, 8) }));
    // JSON-LD Product
    let el = document.getElementById("ld-product"); if (!el) { el = document.createElement("script"); el.type = "application/ld+json"; el.id = "ld-product"; document.head.appendChild(el); }
    el.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: p.name, image: p.images, description: p.description, brand: p.brand, aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews }, offers: { "@type": "Offer", priceCurrency: "USD", price: (p.salePrice ?? p.price).toFixed(2), availability: p.stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" } });
    return () => el.remove();
  }, [slug]);
  if (!p) return <NotFound />;
  const cat = api.category(p.category);
  const tab = ["description", "nutrition", "reviews", "delivery"].includes(query.tab) ? query.tab : "description";
  const tabs = [{ id: "description", label: "Description" }, { id: "nutrition", label: "Nutrition" }, { id: "reviews", label: "Reviews", count: p.reviews }, { id: "delivery", label: "Delivery & Returns" }];
  const rel = api.related(p);
  const rec = recent.filter((id) => id !== p.id).map(api.byId).filter(Boolean).slice(0, 4);
  return (
    <div className="wrap">
      <Crumbs items={[{ label: "Shop", to: "/shop" }, { label: cat.name, to: "/shop", query: { cat: cat.id } }, { label: p.name }]} />
      <div className="pdp" style={{ display: "grid", gap: 40, alignItems: "start" }}>
        <Gallery p={p} />
        <div style={{ display: "grid", gap: 16 }}>
          <div className="pc-cat">{cat.name} · {p.brand}</div>
          <h1 style={{ fontSize: "clamp(28px, 3.4vw, 42px)", fontWeight: 800 }}>{p.name}</h1>
          <a href={buildHref("/product/" + p.slug, { tab: "reviews" })} onClick={(e) => { e.preventDefault(); setQuery({ tab: "reviews" }); }} style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 14.5 }}><Stars value={p.rating} /> <b>{p.rating}</b> <span className="muted" style={{ textDecoration: "underline" }}>{p.reviews} reviews</span></a>
          <Price p={p} mult={p.weights[w].mult} big />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{p.tags.map((t) => <span key={t} className="pill-note" style={{ textTransform: "capitalize" }}><Icon name="leaf" size={13} />{t}</span>)}</div>
          <p className="muted" style={{ fontSize: 15.5 }}>{p.description}</p>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Size</div>
            <div role="radiogroup" aria-label="Size" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {p.weights.map((x, i) => <button key={i} role="radio" aria-checked={i === w} onClick={() => setW(i)} className="btn" style={{ border: "1.5px solid " + (i === w ? "var(--green)" : "var(--line)"), background: i === w ? "var(--t-mint)" : "#fff", color: i === w ? "var(--green)" : "inherit" }}>{unit(x.label)}</button>)}
              <button className="btn btn-sm" onClick={() => shop.set((s) => ({ unit: s.unit === "metric" ? "imperial" : "metric" }))} style={{ textDecoration: "underline", fontWeight: 600 }}>Show in {unitPref === "metric" ? "lb / oz" : "kg / g"}</button>
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, color: p.stock === 0 ? "var(--red)" : p.stock <= 5 ? "#B5560B" : "var(--green)" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "currentColor" }} />
            {p.stock === 0 ? "Out of stock" : p.stock <= 5 ? `Low stock — only ${p.stock} left` : "In stock, ready for same-day delivery"}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {p.stock > 0 ? <>
              <QuantityStepper value={q} min={1} max={p.stock} onChange={setQ} light lg label="Quantity" />
              <button className="btn btn-green" style={{ minHeight: 52, flex: "1 1 200px" }} onClick={(e) => { cart.add(p.id, q, w, e.currentTarget); toast(`${q} × ${p.name} added`); }}><Icon name="cart" size={18} /> Add to cart</button>
            </> : <NotifyForm p={p} />}
            <HeartBtn id={p.id} className="round" size={20} />
          </div>
          <div className="card" style={{ padding: 16, display: "grid", gap: 10, fontSize: 14, background: "var(--bg)", boxShadow: "none" }}>
            <span style={{ display: "flex", gap: 10, alignItems: "center" }}><Icon name="truck" size={18} style={{ color: "var(--green)" }} />Free delivery on orders over {money(CFG.delivery.freeThreshold)}</span>
            <span style={{ display: "flex", gap: 10, alignItems: "center" }}><Icon name="refresh" size={18} style={{ color: "var(--green)" }} />Instant refund on any rotten item</span>
          </div>
        </div>
      </div>

      <section className="section">
        <Tabs tabs={tabs} value={tab} variant="underline" label="Product information" idBase="pdp-tab" onChange={(id) => setQuery({ tab: id === "description" ? "" : id }, { replace: true })} />
        <div id="pdp-tab-panel" role="tabpanel" aria-labelledby={"pdp-tab-" + tab} key={tab} style={{ paddingTop: 24, animation: "pageIn .4s var(--ease)", maxWidth: 820 }}>
          {tab === "description" && <div style={{ display: "grid", gap: 12 }}><p>{p.description}</p><p className="muted">Sourced from {p.brand}. Packed in compostable trays. Weight shown is the minimum; produce may vary slightly by season.</p></div>}
          {tab === "nutrition" && <table style={{ width: "100%", maxWidth: 480, borderCollapse: "collapse" }}><caption style={{ textAlign: "left", fontWeight: 800, marginBottom: 8 }}>Typical values per 100g</caption><tbody>{p.nutrition.map(([k, v]) => <tr key={k} style={{ borderBottom: "1px solid var(--line)" }}><th scope="row" style={{ textAlign: "left", padding: "10px 0", fontWeight: 600 }}>{k}</th><td style={{ textAlign: "right" }}>{v}</td></tr>)}</tbody></table>}
          {tab === "reviews" && <Reviews p={p} />}
          {tab === "delivery" && <div style={{ display: "grid", gap: 12 }}><p><b>Delivery:</b> within 1 hour inside our zone, or pick a 2-hour slot at checkout. Free over {money(CFG.delivery.freeThreshold)}, otherwise {money(CFG.delivery.fee)}.</p><p><b>Returns:</b> fresh food can't be returned, but if anything arrives damaged or below standard, report it within 24 hours for an instant refund.</p><AreaChecker /></div>}
        </div>
      </section>

      {rel.length > 0 && <section className="section"><SectionHeading title="Related products" /><div className="pgrid c4">{rel.map((x) => <ProductCard key={x.id} p={x} />)}</div></section>}
      {rec.length > 0 && <section className="section"><SectionHeading title="Recently viewed" /><div className="pgrid c4">{rec.map((x) => <ProductCard key={x.id} p={x} />)}</div></section>}
    </div>
  );
}

function NotifyForm({ p }) {
  const [email, setEmail] = useState(""); const [done, setDone] = useState(false); const [err, setErr] = useState("");
  if (done) return <span className="pill-note"><Icon name="check" size={14} /> We'll email {email} when it's back</span>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email"); setDone(true); }} style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap" }}>
      <input className={"input" + (err ? " err" : "")} placeholder="Email for restock alert" aria-label="Email for restock alert" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} style={{ flex: "1 1 200px" }} />
      <button className="btn btn-red" style={{ minHeight: 48 }}><Icon name="bell" size={16} /> Notify me</button>
      {err && <div className="ferr" role="alert" style={{ width: "100%" }}>{err}</div>}
    </form>
  );
}

function Reviews({ p }) {
  const base = [
    { n: "Jordan K.", r: 5, t: "Exactly as fresh as advertised. Will reorder every week.", d: "2 days ago" },
    { n: "Melissa T.", r: 5, t: "Great size and flavour, delivered in 40 minutes.", d: "1 week ago" },
    { n: "Chris B.", r: 4, t: "Very good quality, one piece was slightly bruised but support refunded it instantly.", d: "3 weeks ago" },
  ];
  const [list, setList] = useState(base);
  const [form, setForm] = useState({ n: "", t: "", r: 5 }); const [err, setErr] = useState({});
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}><div style={{ fontSize: 48, fontWeight: 800 }}>{p.rating}</div><div><Stars value={p.rating} size={18} /><div className="muted">Based on {p.reviews} reviews</div></div></div>
      {list.map((r, i) => <div key={i} style={{ borderBottom: "1px solid var(--line)", paddingBottom: 14 }}><div style={{ display: "flex", gap: 10, alignItems: "center" }}><b>{r.n}</b><Stars value={r.r} size={13} /><span className="muted" style={{ fontSize: 13 }}>{r.d}</span></div><p style={{ marginTop: 6 }}>{r.t}</p></div>)}
      <form className="card" style={{ padding: 18, display: "grid", gap: 12, boxShadow: "none", border: "1.5px solid var(--line)" }} onSubmit={(e) => { e.preventDefault(); const er = {}; if (form.n.trim().length < 2) er.n = "Please enter your name"; if (form.t.trim().length < 10) er.t = "Review should be at least 10 characters"; setErr(er); if (Object.keys(er).length) return; setList([{ ...form, d: "just now" }, ...list]); setForm({ n: "", t: "", r: 5 }); toast("Thanks for your review!"); }}>
        <b>Write a review</b>
        <div role="radiogroup" aria-label="Your rating" style={{ display: "flex", gap: 4 }}>{[1, 2, 3, 4, 5].map((s) => <button type="button" key={s} role="radio" aria-checked={form.r === s} aria-label={s + " stars"} onClick={() => setForm({ ...form, r: s })} style={{ color: "var(--star)", width: 34, height: 34 }}><Icon name="star" size={24} fill={s <= form.r ? "currentColor" : "none"} stroke={1.5} /></button>)}</div>
        <div className="field"><label htmlFor="rn">Name</label><input id="rn" className={"input" + (err.n ? " err" : "")} value={form.n} onChange={(e) => setForm({ ...form, n: e.target.value })} />{err.n && <span className="ferr">{err.n}</span>}</div>
        <div className="field"><label htmlFor="rt">Review</label><textarea id="rt" rows="3" className={"input" + (err.t ? " err" : "")} value={form.t} onChange={(e) => setForm({ ...form, t: e.target.value })} />{err.t && <span className="ferr">{err.t}</span>}</div>
        <button className="btn btn-green" style={{ justifySelf: "start" }}>Submit review</button>
      </form>
    </div>
  );
}

function AreaChecker() {
  const area = useShop((s) => s.area);
  const [v, setV] = useState(area); const [res, setRes] = useState(area ? CFG.delivery.areas.includes(area) : null);
  return (
    <form onSubmit={(e) => { e.preventDefault(); const z = v.trim(); shop.set({ area: z }); setRes(CFG.delivery.areas.includes(z)); }} style={{ display: "grid", gap: 8 }}>
      <label htmlFor="zip" style={{ fontWeight: 700, fontSize: 14 }}>Check delivery to your area</label>
      <div style={{ display: "flex", gap: 8, maxWidth: 420 }}>
        <input id="zip" className="input" placeholder="Postal code, e.g. 19801" value={v} onChange={(e) => setV(e.target.value)} inputMode="numeric" />
        <button className="btn btn-green" style={{ minHeight: 48 }}>Check</button>
      </div>
      {res !== null && <div role="status" style={{ fontWeight: 700, fontSize: 14, color: res ? "var(--green)" : "var(--red)" }}>{res ? `✓ Great news — we deliver to ${v} within 1 hour.` : `Sorry, we don't deliver to ${v} yet. We'll notify you when we do.`}</div>}
    </form>
  );
}

Object.assign(window, { ShopPage, ProductPage, CategoriesPage, AreaChecker });

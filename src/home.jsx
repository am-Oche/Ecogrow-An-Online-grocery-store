/* ==========================================================================
   HOME PAGE — sections in reference order.
   ========================================================================== */

function Hero() {
  const slides = CFG.hero;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef(null);
  useEffect(() => { if (paused) return; const t = setInterval(() => setI((x) => (x + 1) % slides.length), 6000); return () => clearInterval(t); }, [paused, slides.length]);
  const s = slides[i];
  return (
    <section className="wrap" aria-roledescription="carousel" aria-label="Featured offers" style={{ marginTop: 20 }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)} onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) setI((x) => (x + (dx < 0 ? 1 : -1) + slides.length) % slides.length); }}>
      <div className="hero" style={{ position: "relative", background: "var(--green)", borderRadius: "var(--r-xl)", overflow: "hidden", color: "#fff", minHeight: 460 }}>
        <TopoLines color="rgba(200,240,49,.10)" />
        <div key={s.id} className="hero-grid" style={{ position: "relative", display: "grid", alignItems: "center", minHeight: 460 }}>
          <div className="hero-copy" style={{ padding: "48px 0 48px 56px", position: "relative", zIndex: 2 }} aria-live="polite">
            <span className="pill-note" style={{ background: "rgba(255,255,255,.12)", color: "#fff", animation: "pageIn .6s var(--ease) both" }}><Icon name="leaf" size={14} /> 100% organic · same-day delivery</span>
            <h1 style={{ fontSize: "clamp(32px, 4.6vw, 60px)", fontWeight: 800, marginTop: 18, letterSpacing: "-.03em" }}>
              {s.title.split(" ").map((w, k) => <span key={k} className="wr" style={{ animationDelay: k * 70 + "ms" }}>{w}&nbsp;</span>)}
              <br /><span className="wr" style={{ color: "var(--lime)", fontStyle: "italic", animationDelay: s.title.split(" ").length * 70 + 60 + "ms" }}>{s.accent}</span>
            </h1>
            <p style={{ fontSize: 18, marginTop: 16, opacity: .9, animation: "pageIn .7s .35s var(--ease) both" }}>{s.sub}</p>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap", animation: "pageIn .7s .45s var(--ease) both" }}>
              <Link to={s.href} query={s.query} className="btn btn-white" style={{ minHeight: 52, padding: "0 26px" }}>{s.cta} <span className="ic-badge" style={{ marginRight: -12 }}><Icon name="arrowR" size={14} stroke={2.6} /></span></Link>
              <Link to="/shop" query={{ sale: "1" }} className="btn" style={{ minHeight: 52, color: "#fff", border: "1.5px solid rgba(255,255,255,.35)" }}>See all deals</Link>
            </div>
          </div>
          <div className="hero-art" style={{ position: "relative", alignSelf: "stretch", minHeight: 360 }}>
            <div style={{ position: "absolute", inset: "28px 28px 28px 0", borderRadius: "220px 28px 28px 220px", overflow: "hidden", animation: "heroUp .9s .1s var(--ease) both" }}>
              <img src={s.img} alt={s.alt} fetchpriority="high" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: s.pos }} />
            </div>
            <img src="img/p/strawberry.jpg" alt="" aria-hidden="true" className="float a" style={{ position: "absolute", left: -26, top: 46, width: 96, height: 96, objectFit: "cover", borderRadius: "50%", border: "5px solid var(--green)" }} />
            <img src="img/p/kiwi.jpg" alt="" aria-hidden="true" className="float b" style={{ position: "absolute", left: 30, bottom: 34, width: 76, height: 76, objectFit: "cover", borderRadius: "50%", border: "5px solid var(--green)" }} />
            <div className="float c" style={{ position: "absolute", right: 46, bottom: 50, background: "var(--lime)", color: "var(--green-900)", borderRadius: 999, padding: "10px 16px", fontWeight: 800, boxShadow: "var(--shadow-2)" }}>Up to 60% off</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 56, bottom: 26, display: "flex", gap: 8, zIndex: 3 }} role="tablist" aria-label="Choose slide" className="hero-dots">
          {slides.map((x, k) => <button key={x.id} role="tab" aria-selected={k === i} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} style={{ height: 10, width: k === i ? 34 : 10, borderRadius: 99, background: k === i ? "var(--lime)" : "rgba(255,255,255,.4)", transition: "width .4s var(--ease), background .3s", padding: 0, minHeight: 10 }} />)}
        </div>
      </div>
    </section>
  );
}

function FeaturedCategories() {
  return (
    <section className="wrap section rv">
      <Carousel label="Featured categories" title={<h2 style={{ fontSize: "clamp(22px, 2.6vw, 32px)", fontWeight: 800 }}>Featured Categories</h2>} itemWidth={150} gap={16}
        extra={<Link to="/categories" className="hide-m" style={{ fontWeight: 700, color: "var(--green)", marginRight: 8 }}>All categories →</Link>}>
        {CFG.featuredCategories.map((c) => <CategoryTile key={c.label} c={c} />)}
      </Carousel>
    </section>
  );
}

function PromoBanners() {
  return (
    <section className="wrap section">
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))" }}>
        {CFG.promos.map((p, k) => (
          <div key={p.id} className="rv promo" style={{ transitionDelay: k * 90 + "ms", position: "relative", borderRadius: "var(--r-xl)", overflow: "hidden", background: p.tone === "yellow" ? "var(--yellow)" : "var(--pink)", minHeight: 240, display: "grid", gridTemplateColumns: "1.1fr 1fr", alignItems: "center" }}>
            <div style={{ padding: "32px 0 32px 32px", position: "relative", zIndex: 2 }}>
              <h3 style={{ fontSize: "clamp(20px, 2.2vw, 28px)", fontWeight: 800 }}>{p.title}</h3>
              <Link to={p.href} query={p.query} className="btn btn-green" style={{ marginTop: 20 }}>{p.cta} <Icon name="arrowR" size={16} /></Link>
            </div>
            <div style={{ position: "relative", height: "100%", minHeight: 240 }}>
              {p.imgs.map((src, j) => (
                <div key={j} className={"promo-fruit pf" + j} style={{ position: "absolute", borderRadius: "50%", overflow: "hidden", background: "#fff", boxShadow: "var(--shadow-2)", ...[{ width: 170, height: 170, right: 24, top: 26 }, { width: 110, height: 110, right: 160, bottom: 18 }, { width: 84, height: 84, right: 12, bottom: 12 }][j] }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FreshProducts() {
  const { query } = useRoute();
  const tabs = CFG.productTabs;
  const tab = tabs.find((t) => t.id === query.tab) ? query.tab : tabs[0].id;
  const [loading, setLoading] = useState(false);
  const def = tabs.find((t) => t.id === tab);
  const items = useMemo(() => api.products().filter((p) => def.filter === "all" || p.category === def.filter || (def.filter === "fruits" && p.category === "berries")).slice(0, 8), [tab]);
  const change = (id) => { setLoading(true); setQuery({ tab: id === tabs[0].id ? "" : id }, { replace: false }); setTimeout(() => setLoading(false), 220); };
  return (
    <section className="wrap section" id="fresh">
      <div className="rv" style={{ textAlign: "center", marginBottom: 22 }}>
        <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800 }}>Delicious fresh products</h2>
        <p className="muted" style={{ marginTop: 6 }}>Hand-picked this morning, at your door within the hour.</p>
      </div>
      <div className="rv" style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
        <div style={{ maxWidth: "100%" }}><Tabs tabs={tabs} value={tab} onChange={change} label="Product categories" idBase="home-tab" /></div>
      </div>
      <div id="home-tab-panel" role="tabpanel" aria-labelledby={"home-tab-" + tab}>
        {loading ? <div className="pgrid c4">{Array.from({ length: 8 }).map((_, k) => <SkeletonCard key={k} />)}</div>
          : items.length ? <AnimatedGrid items={items} render={(p) => <ProductCard p={p} />} /> : <EmptyState title="Nothing here yet" text="Add products to this category in data.js." />}
      </div>
      <div style={{ textAlign: "center", marginTop: 30 }}>
        <Link to="/shop" query={def.filter !== "all" ? { cat: def.filter } : undefined} className="btn btn-green" style={{ minHeight: 52, padding: "0 28px" }}>View All Products <Icon name="arrowR" size={16} /></Link>
      </div>
    </section>
  );
}

function DeliveryBanner() {
  const b = CFG.deliveryBanner;
  const ref = useRef(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const f = () => { const el = ref.current; if (!el) return; const r = el.getBoundingClientRect(); const v = 1 - Math.min(1, Math.max(0, (r.top + r.height * 0.3) / window.innerHeight)); setP(v); };
    f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f);
  }, []);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const drive = reduce ? 0 : Math.max(0, 1 - p * 1.6) * 240;
  return (
    <section className="wrap section" ref={ref}>
      <div className="dbanner" style={{ position: "relative", background: "var(--red)", color: "#fff", borderRadius: "var(--r-xl)", minHeight: 300, display: "grid", gridTemplateColumns: "1.2fr 1fr", alignItems: "center", overflow: "visible" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "var(--r-xl)", overflow: "hidden" }}><TopoLines color="rgba(255,255,255,.09)" /></div>
        <div style={{ padding: "44px 0 44px 48px", position: "relative", zIndex: 2 }} className="rv">
          <h2 style={{ fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 800 }}>{b.title}</h2>
          <div style={{ fontSize: "clamp(22px, 2.6vw, 34px)", fontWeight: 800, color: "#FFE8B0", marginTop: 8 }}>{b.hours}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            {b.chips.map((c) => <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.14)", padding: "8px 14px", borderRadius: 999, fontWeight: 700, fontSize: 14 }}><span style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", color: "var(--red)", display: "grid", placeItems: "center" }}><Icon name="check" size={12} stroke={3.2} /></span>{c}</span>)}
          </div>
          <Link to="/shop" className="btn btn-white" style={{ marginTop: 24, minHeight: 50 }}>{b.cta} <span className="ic-badge" style={{ background: "var(--red)", color: "#fff", marginRight: -12 }}><Icon name="arrowR" size={14} stroke={2.6} /></span></Link>
        </div>
        <div className="rider" style={{ position: "relative", alignSelf: "end", height: "100%" }}>
          <img src={b.img} alt="Delivery rider on a scooter carrying a grocery box" loading="lazy" style={{ position: "absolute", right: -10, bottom: -28, width: "min(460px, 115%)", transform: `translateX(${drive}px)`, willChange: "transform", filter: "drop-shadow(0 20px 24px rgba(0,0,0,.25))" }} />
          <span className="replace-tag" style={{ top: 14, right: 14 }}>Replace with photo cutout</span>
        </div>
      </div>
    </section>
  );
}

function BestDeal() {
  const deals = api.deals();
  return (
    <section className="wrap section">
      <div className="deal-grid" style={{ display: "grid", gap: 20, alignItems: "stretch" }}>
        <div className="rv" style={{ position: "relative", background: "var(--green)", color: "#fff", borderRadius: "var(--r-xl)", overflow: "hidden", padding: "30px 26px 0", display: "flex", flexDirection: "column" }}>
          <TopoLines color="rgba(200,240,49,.1)" />
          <div style={{ position: "relative" }}>
            <div style={{ fontFamily: "var(--script)", fontSize: 44, color: "var(--lime)", lineHeight: .9 }}>Today's</div>
            <h2 style={{ fontSize: 34, fontWeight: 800 }}>Best Deal</h2>
            <div style={{ marginTop: 16 }}><Countdown end={CFG.deal.endsAt} /></div>
          </div>
          <div style={{ position: "relative", marginTop: 22, flex: 1, minHeight: 190, borderRadius: "200px 200px 0 0", overflow: "hidden" }}>
            <img src="img/people/apple-hand.jpg" alt="Hand holding a freshly picked red apple in an orchard" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
          </div>
        </div>
        <div className="rv" style={{ minWidth: 0, transitionDelay: "100ms" }}>
          <Carousel label="Today's deals" title={<span className="muted" style={{ fontWeight: 600 }}>{deals.length} products on sale — prices end when the timer hits zero</span>} itemWidth={240}>
            {deals.map((p) => <div key={p.id} style={{ width: 240, display: "grid" }}><ProductCard p={{ ...p, badge: discountPct(p) + "% off" }} /></div>)}
          </Carousel>
        </div>
      </div>
    </section>
  );
}

function PartnerLogo({ p }) {
  const c = "#2a3a33";
  const common = { width: 170, height: 90, viewBox: "0 0 170 90", role: "img", "aria-label": p.name + " (placeholder logo)" };
  if (p.style === "seal") return <svg {...common}><circle cx="45" cy="45" r="32" fill="none" stroke={c} strokeWidth="2" /><circle cx="45" cy="45" r="25" fill="none" stroke={c} strokeWidth="1" strokeDasharray="2 3" /><path d="M45 26c8 6 8 20 0 32-8-12-8-26 0-32Z" fill={c} /><text x="88" y="52" fontFamily="Plus Jakarta Sans" fontWeight="800" fontSize="20" letterSpacing="3" fill={c}>{p.name.toUpperCase()}</text></svg>;
  if (p.style === "script") return <svg {...common}><text x="85" y="44" textAnchor="middle" fontFamily="Caveat" fontWeight="700" fontSize="40" fill={c}>Sweet</text><text x="85" y="72" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontWeight="800" fontSize="16" letterSpacing="6" fill={c}>GARDEN</text></svg>;
  if (p.style === "leaf") return <svg {...common}><path d="M22 66c0-24 14-40 40-42-2 26-18 42-40 42Zm0 0 22-22" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" /><text x="72" y="44" fontFamily="Plus Jakarta Sans" fontWeight="800" fontSize="19" fill={c}>Green</text><text x="72" y="66" fontFamily="Plus Jakarta Sans" fontWeight="500" fontSize="17" fill={c}>Valley</text></svg>;
  return <svg {...common}><rect x="10" y="18" width="150" height="54" rx="27" fill="none" stroke={c} strokeWidth="2" /><text x="85" y="44" textAnchor="middle" fontFamily="Caveat" fontWeight="700" fontSize="28" fill={c}>Fresh Field</text><text x="85" y="62" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontWeight="700" fontSize="9" letterSpacing="3" fill={c}>EST · 1998</text></svg>;
}

function Partners() {
  const list = DATA.partners;
  return (
    <section className="wrap section rv">
      <SectionHeading center title="Our organic farm partners" sub="Placeholder logos — replace with the client's real partner marks." />
      <div className="marquee" aria-label="Farm partners">
        <div className="marquee-track">
          {[...list, ...list, ...list].map((p, k) => (
            <div key={k} className="partner" aria-hidden={k >= list.length ? "true" : undefined} style={{ position: "relative" }}><PartnerLogo p={p} /></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FarmFAQ() {
  return (
    <section className="section farm" style={{ position: "relative", overflow: "hidden" }}>
      <img src="img/farm.jpg" alt="" aria-hidden="true" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 70%" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(8,30,22,.82) 0%, rgba(8,30,22,.45) 50%, rgba(8,30,22,.2) 100%)" }} />
      <div className="wrap farm-grid" style={{ position: "relative", display: "grid", gap: 32, alignItems: "center", padding: "80px 20px" }}>
        <div className="rv" style={{ color: "#fff" }}>
          <div style={{ fontFamily: "var(--script)", fontSize: 34, color: "var(--lime)" }}>From our fields</div>
          <h2 style={{ fontSize: "clamp(28px, 3.6vw, 48px)", fontWeight: 800, maxWidth: 480 }}>Organic farming and agriculture questions</h2>
          <p style={{ marginTop: 14, maxWidth: 440, opacity: .9 }}>Everything you've wanted to know about how your food is grown, harvested and delivered.</p>
          <Link to="/faq" className="btn btn-lime" style={{ marginTop: 22 }}>Read all FAQs <Icon name="arrowR" size={16} /></Link>
        </div>
        <div className="rv card" style={{ padding: 18, transitionDelay: "120ms", maxWidth: 560, justifySelf: "end", width: "100%" }}>
          <Accordion items={DATA.faqs.slice(0, 5)} defaultOpen={3} />
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const list = DATA.testimonials;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => { if (paused) return; const t = setInterval(() => setI((x) => (x + 1) % list.length), 5500); return () => clearInterval(t); }, [paused]);
  const go = (d) => setI((x) => (x + d + list.length) % list.length);
  return (
    <section className="wrap section rv" aria-roledescription="carousel" aria-label="Customer testimonials" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div style={{ background: "#fff", borderRadius: "var(--r-xl)", padding: "48px 24px", boxShadow: "var(--shadow-1)", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 16, maxWidth: 900, margin: "0 auto" }}>
          <button className="round" onClick={() => go(-1)} aria-label="Previous testimonial"><Icon name="arrowL" size={18} /></button>
          <div style={{ display: "grid", textAlign: "center" }} aria-live="polite">
            {list.map((t, k) => (
              <figure key={k} aria-hidden={k !== i} style={{ gridArea: "1/1", margin: 0, opacity: k === i ? 1 : 0, transform: k === i ? "none" : "translateY(10px) scale(.98)", transition: "opacity .6s var(--ease), transform .6s var(--ease)", pointerEvents: k === i ? "auto" : "none" }}>
                <img src={t.img} alt={t.name} loading="lazy" style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover", margin: "0 auto", border: "4px solid var(--t-mint)" }} />
                <blockquote style={{ margin: "18px auto 0", fontSize: "clamp(16px, 1.8vw, 21px)", fontWeight: 600, lineHeight: 1.5, maxWidth: 680 }}>“{t.quote}”</blockquote>
                <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8 }}><Stars value={t.rating} size={17} /><b>(5.0)</b></div>
                <figcaption style={{ marginTop: 6 }}><b>{t.name}</b> <span className="muted">· {t.role}</span></figcaption>
              </figure>
            ))}
          </div>
          <button className="round dark" onClick={() => go(1)} aria-label="Next testimonial"><Icon name="arrowR" size={18} /></button>
        </div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 24 }}>
          {list.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Testimonial ${k + 1}`} aria-current={k === i} style={{ width: k === i ? 26 : 8, height: 8, borderRadius: 99, background: k === i ? "var(--green)" : "var(--line)", transition: "width .4s var(--ease)" }} />)}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="wrap section">
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))" }}>
        {CFG.features.map((f, k) => (
          <div key={f.title} className="rv feat" style={{ transitionDelay: k * 70 + "ms", display: "flex", gap: 14, alignItems: "center", padding: 18, borderRadius: "var(--r-lg)", background: "#fff", boxShadow: "var(--shadow-1)" }}>
            <span style={{ width: 54, height: 54, borderRadius: 16, background: "var(--t-mint)", color: "var(--green)", display: "grid", placeItems: "center", flex: "none" }}><Icon name={f.icon} size={24} /></span>
            <span><b style={{ display: "block" }}>{f.title}</b><span className="muted" style={{ fontSize: 14 }}>{f.sub}</span></span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PhotoStrip() {
  return (
    <section className="section strip" aria-label="Our farmers and team">
      {CFG.photoStrip.map((p, k) => (
        <div key={k} style={{ overflow: "hidden", position: "relative" }}>
          <img src={p.img} alt={p.alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos, transition: "transform 1.2s var(--ease)" }} />
        </div>
      ))}
    </section>
  );
}

function HomePage() {
  useReveal([]);
  useEffect(() => { document.title = `${CFG.brand.name} — ${CFG.brand.tagline}`; }, []);
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <PromoBanners />
      <FreshProducts />
      <DeliveryBanner />
      <BestDeal />
      <Partners />
      <FarmFAQ />
      <Testimonials />
      <Features />
      <PhotoStrip />
    </>
  );
}

Object.assign(window, { HomePage, PartnerLogo });

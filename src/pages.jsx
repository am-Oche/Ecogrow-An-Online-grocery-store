/* ==========================================================================
   CONTENT PAGES — Wishlist, Account, Login/Register, Blog, About, Contact,
   FAQ, Stores, Careers, Policies, 404.
   ========================================================================== */

function useTitle(t) { useEffect(() => { document.title = `${t} — ${CFG.brand.name}`; }, [t]); }

function WishlistPage() {
  useTitle("Wishlist");
  const ids = useShop((s) => s.wish);
  const items = ids.map(api.byId).filter(Boolean);
  return (
    <>
      <PageHead title="Your wishlist" sub={`${items.length} saved item${items.length === 1 ? "" : "s"}`} />
      <div className="wrap" style={{ marginTop: 28 }}>
        {items.length ? <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}><button className="btn btn-green" onClick={() => { items.filter((p) => p.stock).forEach((p) => cart.add(p.id)); toast("In-stock items added to cart"); }}><Icon name="cart" size={16} /> Add all to cart</button></div>
          <AnimatedGrid items={items} render={(p) => <ProductCard p={p} />} />
        </> : <EmptyState icon="heart" title="No favourites yet" text="Tap the heart on any product to save it here." action={<Link to="/shop" className="btn btn-green">Discover products</Link>} />}
      </div>
    </>
  );
}

function LoginPage({ query }) {
  const mode = query.mode === "register" ? "register" : "login";
  useTitle(mode === "login" ? "Login" : "Register");
  const [f, setF] = useState({ name: "", email: "", pw: "" }); const [err, setErr] = useState({});
  const submit = (e) => {
    e.preventDefault(); const er = {};
    if (mode === "register" && f.name.trim().length < 2) er.name = "Enter your name";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = "Enter a valid email";
    if (f.pw.length < 6) er.pw = "At least 6 characters";
    setErr(er); if (Object.keys(er).length) return;
    shop.set({ user: { name: f.name || f.email.split("@")[0], email: f.email } });
    toast("Welcome" + (mode === "register" ? " to " + CFG.brand.name : " back") + "!");
    navigate("/account");
  };
  return (
    <div className="wrap" style={{ maxWidth: 1000 }}>
      <Crumbs items={[{ label: mode === "login" ? "Login" : "Register" }]} />
      <div className="card auth" style={{ display: "grid", overflow: "hidden" }}>
        <div style={{ position: "relative", minHeight: 240 }} className="auth-img">
          <img src="img/veg-basket.jpg" alt="Basket of fresh vegetables" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(10,46,37,.85))" }} />
          <div style={{ position: "absolute", left: 26, bottom: 26, right: 26, color: "#fff" }}><div style={{ fontFamily: "var(--script)", fontSize: 32, color: "var(--lime)" }}>Fresh every day</div><b style={{ fontSize: 22 }}>Save addresses, reorder in one tap and track every delivery.</b></div>
        </div>
        <div style={{ padding: "36px 32px" }}>
          <Tabs tabs={[{ id: "login", label: "Login" }, { id: "register", label: "Register" }]} value={mode} variant="green" label="Account" idBase="auth" onChange={(id) => setQuery({ mode: id === "login" ? "" : id }, { replace: true })} />
          <form key={mode} onSubmit={submit} noValidate style={{ display: "grid", gap: 14, marginTop: 22, animation: "pageIn .4s var(--ease)" }}>
            {mode === "register" && <div className="field"><label htmlFor="l-n">Full name</label><input id="l-n" className={"input" + (err.name ? " err" : "")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />{err.name && <span className="ferr">{err.name}</span>}</div>}
            <div className="field"><label htmlFor="l-e">Email</label><input id="l-e" type="email" className={"input" + (err.email ? " err" : "")} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />{err.email && <span className="ferr">{err.email}</span>}</div>
            <div className="field"><label htmlFor="l-p">Password</label><input id="l-p" type="password" className={"input" + (err.pw ? " err" : "")} value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} autoComplete={mode === "login" ? "current-password" : "new-password"} />{err.pw && <span className="ferr">{err.pw}</span>}</div>
            <button className="btn btn-green" style={{ minHeight: 50 }}>{mode === "login" ? "Login" : "Create account"}</button>
            <p className="muted" style={{ fontSize: 13.5, textAlign: "center" }}>Demo only — any email + 6-character password works.</p>
          </form>
        </div>
      </div>
    </div>
  );
}

function AccountPage({ query }) {
  useTitle("Account");
  const s = useShop(); const money = useMoney();
  const sec = ["orders", "addresses", "profile"].includes(query.tab) ? query.tab : "orders";
  const [addr, setAddr] = useState({ label: "", line: "", city: "", zip: "" });
  if (!s.user) return <div className="wrap"><Crumbs items={[{ label: "Account" }]} /><EmptyState icon="user" title="Sign in to your account" text="View orders, manage addresses and reorder your last basket." action={<Link to="/login" className="btn btn-green">Login / Register</Link>} /></div>;
  return (
    <>
      <PageHead title={`Hello, ${s.user.name}`} sub={s.user.email} crumbs={[{ label: "Account" }]} />
      <div className="wrap" style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Tabs tabs={[{ id: "orders", label: "Orders", icon: "box", count: s.orders.length }, { id: "addresses", label: "Addresses", icon: "pin" }, { id: "profile", label: "Profile", icon: "user" }]} value={sec} variant="green" label="Account sections" idBase="acct" onChange={(id) => setQuery({ tab: id === "orders" ? "" : id }, { replace: true })} />
          {s.lastBasket && <button className="btn btn-lime" onClick={() => { s.lastBasket.forEach((l) => cart.add(l.id, l.qty, l.w)); toast("Last basket added to cart"); ui.set({ cartOpen: true }); }}><Icon name="repeat" size={16} /> Reorder last basket</button>}
        </div>
        <div key={sec} role="tabpanel" id="acct-panel" aria-labelledby={"acct-" + sec} style={{ marginTop: 22, animation: "pageIn .4s var(--ease)" }}>
          {sec === "orders" && (s.orders.length ? (
            <div style={{ display: "grid", gap: 12 }}>
              {s.orders.map((o) => (
                <div key={o.id} className="card" style={{ padding: 18, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ display: "flex" }}>{o.lines.slice(0, 4).map((l, i) => { const p = api.byId(l.id); return <span key={i} className={"tint-" + api.category(p.category).tint} style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #fff", marginLeft: i ? -12 : 0, display: "grid", placeItems: "center", overflow: "hidden" }}><img src={p.images[0]} alt="" className="blend" style={{ width: "80%", height: "80%", objectFit: "contain" }} /></span>; })}</div>
                  <div style={{ flex: 1, minWidth: 180 }}><b>#{o.id}</b> <span className="pill-note" style={{ marginLeft: 6, padding: "2px 10px" }}>Out for delivery</span><div className="muted" style={{ fontSize: 13.5 }}>{new Date(o.date).toLocaleString()} · {o.lines.reduce((a, l) => a + l.qty, 0)} items · {money(o.total)}</div></div>
                  <Link to={"/track/" + o.id} className="btn btn-ghost btn-sm"><Icon name="map" size={14} /> Track</Link>
                  <button className="btn btn-green btn-sm" onClick={() => { o.lines.forEach((l) => cart.add(l.id, l.qty, l.w)); toast("Items added to cart"); }}><Icon name="repeat" size={14} /> Buy again</button>
                </div>
              ))}
            </div>
          ) : <EmptyState icon="box" title="No orders yet" text="Your orders will appear here after checkout." action={<Link to="/shop" className="btn btn-green">Start shopping</Link>} />)}
          {sec === "addresses" && (
            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" }}>
              {s.addresses.map((a) => <div key={a.id} className="card" style={{ padding: 18 }}><b style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon name="pin" size={16} style={{ color: "var(--green)" }} />{a.label}</b><p className="muted" style={{ marginTop: 6 }}>{a.line}<br />{a.city} {a.zip}</p><button style={{ marginTop: 10, color: "var(--red)", fontWeight: 700, fontSize: 13.5 }} onClick={() => shop.set((st) => ({ addresses: st.addresses.filter((x) => x.id !== a.id) }))}>Remove</button></div>)}
              <form className="card" style={{ padding: 18, display: "grid", gap: 10 }} onSubmit={(e) => { e.preventDefault(); if (!addr.line || !addr.zip) return toast("Street and postal code are required"); shop.set((st) => ({ addresses: [...st.addresses, { ...addr, label: addr.label || "Address", id: "a" + Date.now() }] })); setAddr({ label: "", line: "", city: "", zip: "" }); toast("Address saved"); }}>
                <b>Add address</b>
                {["label", "line", "city", "zip"].map((k) => <input key={k} className="input" aria-label={k} placeholder={{ label: "Label (Home, Work)", line: "Street address", city: "City", zip: "Postal code" }[k]} value={addr[k]} onChange={(e) => setAddr({ ...addr, [k]: e.target.value })} />)}
                <button className="btn btn-green">Save address</button>
              </form>
            </div>
          )}
          {sec === "profile" && (
            <div className="card" style={{ padding: 22, maxWidth: 560, display: "grid", gap: 14 }}>
              <div className="field"><label htmlFor="pn">Name</label><input id="pn" className="input" value={s.user.name} onChange={(e) => shop.set({ user: { ...s.user, name: e.target.value } })} /></div>
              <div className="field"><label htmlFor="pe">Email</label><input id="pe" className="input" value={s.user.email} onChange={(e) => shop.set({ user: { ...s.user, email: e.target.value } })} /></div>
              <div className="field"><label htmlFor="pu">Weight units</label><select id="pu" className="input" value={s.unit} onChange={(e) => shop.set({ unit: e.target.value })}><option value="metric">Metric (kg, g, L)</option><option value="imperial">Imperial (lb, oz)</option></select></div>
              <button className="btn btn-ghost" style={{ justifySelf: "start" }} onClick={() => { shop.set({ user: null }); navigate("/"); toast("Signed out"); }}>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function BlogPage() {
  useTitle("Blog");
  const posts = DATA.posts;
  return (
    <>
      <PageHead title="From the farm journal" sub="Seasonal guides, recipes and stories from the people who grow your food." crumbs={[{ label: "Blog" }]} />
      <div className="wrap" style={{ marginTop: 28, display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" }}>
        {posts.map((p, i) => (
          <Link key={p.slug} to={"/blog/" + p.slug} className="card pc" style={{ padding: 10, display: "flex", flexDirection: "column", ...(i === 0 ? { gridColumn: "1 / -1" } : {}) }}>
            <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: i === 0 ? "21/8" : "16/10", background: "var(--t-sand)" }}><img src={p.img} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
            <div style={{ padding: "16px 8px 8px" }}>
              <span className="pill-note" style={{ padding: "3px 10px" }}>{p.cat}</span>
              <h2 style={{ fontSize: i === 0 ? 28 : 19, marginTop: 10 }}>{p.title}</h2>
              <p className="muted" style={{ marginTop: 6 }}>{p.excerpt}</p>
              <div className="muted" style={{ fontSize: 13, marginTop: 10 }}>{new Date(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {p.read} min read</div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

function ArticlePage({ slug }) {
  const p = DATA.posts.find((x) => x.slug === slug);
  useTitle(p ? p.title : "Not found");
  if (!p) return <NotFound />;
  return (
    <article className="wrap" style={{ maxWidth: 820 }}>
      <Crumbs items={[{ label: "Blog", to: "/blog" }, { label: p.title }]} />
      <span className="pill-note">{p.cat}</span>
      <h1 style={{ fontSize: "clamp(30px, 4.4vw, 50px)", marginTop: 14, fontWeight: 800 }}>{p.title}</h1>
      <div className="muted" style={{ marginTop: 10 }}>{new Date(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {p.read} min read</div>
      <div style={{ borderRadius: "var(--r-xl)", overflow: "hidden", marginTop: 24, aspectRatio: "16/8", background: "var(--t-sand)" }}><img src={p.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
      <div style={{ display: "grid", gap: 18, fontSize: 17.5, lineHeight: 1.75, marginTop: 28 }}>{p.body.map((b, i) => <p key={i}>{b}</p>)}</div>
      <div style={{ marginTop: 40, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <Link to="/blog" className="btn btn-ghost"><Icon name="arrowL" size={16} /> All articles</Link>
        <Link to="/shop" className="btn btn-green">Shop the season <Icon name="arrowR" size={16} /></Link>
      </div>
    </article>
  );
}

function AboutPage() {
  useTitle("About");
  return (
    <>
      <PageHead title={`About ${CFG.brand.name}`} sub="We connect families with the farms down the road — fresh, fair and fast." crumbs={[{ label: "About" }]} />
      <div className="wrap" style={{ marginTop: 32, display: "grid", gap: 32, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", alignItems: "center" }}>
        <div style={{ borderRadius: "var(--r-xl)", overflow: "hidden", aspectRatio: "4/3" }}><img src="img/people/farmer-produce.jpg" alt="One of our partner farmers with a crate of vegetables" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "62% 30%" }} /></div>
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ fontFamily: "var(--script)", fontSize: 34, color: "var(--green)" }}>Our story</div>
          <h2 style={{ fontSize: 32 }}>Grown nearby. Delivered within the hour.</h2>
          <p className="muted">We started with three farms and one van. Today we work with more than thirty organic and local growers, pay them fairly and on time, and deliver their harvest the same day it's picked.</p>
          <p className="muted">Every product page tells you who grew it and how. If anything isn't right, we refund it instantly — because trust is the only thing we really sell.</p>
          <Link to="/stores" className="btn btn-green" style={{ justifySelf: "start" }}>Visit a store</Link>
        </div>
      </div>
      <div className="wrap section"><SectionHeading center title="Our organic farm partners" /><div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>{DATA.partners.map((p) => <PartnerLogo key={p.name} p={p} />)}</div></div>
    </>
  );
}

function ContactPage() {
  useTitle("Contact");
  const [f, setF] = useState({ name: "", email: "", topic: "Order issue", msg: "" }); const [err, setErr] = useState({}); const [sent, setSent] = useState(false);
  return (
    <>
      <PageHead title="Contact us" sub="We usually reply within an hour during opening times." crumbs={[{ label: "Contact" }]} />
      <div className="wrap co-grid" style={{ marginTop: 28, display: "grid", gap: 24, alignItems: "start" }}>
        <form className="card" style={{ padding: 26, display: "grid", gap: 14 }} noValidate onSubmit={(e) => { e.preventDefault(); const er = {}; if (f.name.trim().length < 2) er.name = "Enter your name"; if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = "Enter a valid email"; if (f.msg.trim().length < 10) er.msg = "Tell us a bit more (10+ characters)"; setErr(er); if (!Object.keys(er).length) setSent(true); }}>
          {sent ? <EmptyState icon="check" title="Message sent" text={`Thanks ${f.name.split(" ")[0]} — we'll get back to ${f.email} shortly.`} /> : <>
            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <div className="field"><label htmlFor="c-n">Name</label><input id="c-n" className={"input" + (err.name ? " err" : "")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />{err.name && <span className="ferr">{err.name}</span>}</div>
              <div className="field"><label htmlFor="c-e">Email</label><input id="c-e" type="email" className={"input" + (err.email ? " err" : "")} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />{err.email && <span className="ferr">{err.email}</span>}</div>
            </div>
            <div className="field"><label htmlFor="c-t">Topic</label><select id="c-t" className="input" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>{["Order issue", "Delivery", "Payments", "Wholesale", "Other"].map((t) => <option key={t}>{t}</option>)}</select></div>
            <div className="field"><label htmlFor="c-m">Message</label><textarea id="c-m" rows="5" className={"input" + (err.msg ? " err" : "")} value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} />{err.msg && <span className="ferr">{err.msg}</span>}</div>
            <button className="btn btn-green" style={{ justifySelf: "start", minHeight: 50 }}><Icon name="send" size={16} /> Send message</button>
          </>}
        </form>
        <div className="card" style={{ padding: 22, display: "grid", gap: 14 }}>
          {[["phone", CFG.contact.phone, "tel:" + CFG.contact.phone.replace(/\s/g, "")], ["mail", CFG.contact.email, "mailto:" + CFG.contact.email], ["pin", CFG.contact.address], ["clock", CFG.contact.hours]].map(([ic, v, href]) => (
            <a key={ic} href={href} style={{ display: "flex", gap: 12, alignItems: "center" }}><span style={{ width: 44, height: 44, borderRadius: 14, background: "var(--t-mint)", color: "var(--green)", display: "grid", placeItems: "center", flex: "none" }}><Icon name={ic} size={19} /></span><b style={{ fontSize: 14.5 }}>{v}</b></a>
          ))}
          {CFG.contact.whatsapp && <a className="btn btn-block" style={{ background: "#25D366", color: "#fff" }} href={`https://wa.me/${CFG.contact.whatsapp}`} target="_blank" rel="noopener"><Icon name="whatsapp" size={18} /> Chat on WhatsApp</a>}
        </div>
      </div>
    </>
  );
}

function FAQPage() {
  useTitle("FAQ");
  return (
    <>
      <PageHead title="Frequently asked questions" sub="Can't find an answer? Call us any time during opening hours." crumbs={[{ label: "FAQ" }]} />
      <div className="wrap" style={{ marginTop: 28, maxWidth: 860 }}><div className="card" style={{ padding: 18 }}><Accordion items={DATA.faqs} defaultOpen={0} /></div></div>
    </>
  );
}

function StoresPage() {
  useTitle("Stores");
  return (
    <>
      <PageHead title="Our stores" sub="Pick up in person or say hello to the team." crumbs={[{ label: "Stores" }]} />
      <div className="wrap" style={{ marginTop: 28, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
        {DATA.stores.map((s) => (
          <div key={s.name} className="card" style={{ padding: 22, display: "grid", gap: 8 }}>
            <h2 style={{ fontSize: 19 }}>{s.name}</h2>
            <span className="muted" style={{ display: "flex", gap: 8 }}><Icon name="pin" size={16} style={{ flex: "none", marginTop: 3 }} />{s.addr}</span>
            <span className="muted" style={{ display: "flex", gap: 8 }}><Icon name="clock" size={16} />{s.hours}</span>
            <a href={"tel:" + s.phone.replace(/\s/g, "")} style={{ display: "flex", gap: 8, fontWeight: 700, color: "var(--green)" }}><Icon name="phone" size={16} />{s.phone}</a>
          </div>
        ))}
      </div>
    </>
  );
}

function CareersPage() {
  useTitle("Careers");
  const jobs = [["Delivery Rider", "Wilmington · Full-time / Part-time"], ["Warehouse Picker", "Newark Hub · Full-time"], ["Customer Support Specialist", "Remote (US) · Full-time"], ["Farm Partnerships Manager", "Wilmington · Full-time"]];
  return (
    <>
      <PageHead title="Careers" sub="Help us bring fresh food to every doorstep." crumbs={[{ label: "Careers" }]} />
      <div className="wrap" style={{ marginTop: 28, display: "grid", gap: 12, maxWidth: 900 }}>
        {jobs.map(([t, m]) => <div key={t} className="card" style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}><div><b style={{ fontSize: 17 }}>{t}</b><div className="muted" style={{ fontSize: 14 }}>{m}</div></div><Link to="/contact" className="btn btn-ghost btn-sm">Apply <Icon name="arrowR" size={14} /></Link></div>)}
      </div>
    </>
  );
}

function PoliciesPage({ query }) {
  useTitle("Policies");
  const tabs = [{ id: "privacy", label: "Privacy" }, { id: "terms", label: "Terms" }, { id: "returns", label: "Returns" }, { id: "shipping", label: "Shipping" }];
  const tab = tabs.find((t) => t.id === query.tab) ? query.tab : "privacy";
  const body = {
    privacy: ["We collect only what we need to fulfil your orders: name, contact details, delivery address and order history.", "Payment details are processed by our payment providers and never stored on our servers.", "You can request a copy or deletion of your data at any time by emailing " + CFG.contact.email + "."],
    terms: ["Prices and availability may change without notice. Fresh produce weights are approximate.", "Orders are confirmed once payment is authorised. We may substitute an item of equal or better quality if yours is unavailable, unless you opt out at checkout."],
    returns: ["Fresh food can't be returned, but anything damaged, spoiled or below standard is refunded instantly.", "Report issues within 24 hours from your order page or by phone. No need to send the item back."],
    shipping: [`Delivery within 1 hour in our service area, or choose a 2-hour slot. Free over ${CFG.currencies.USD.symbol}${CFG.delivery.freeThreshold}, otherwise ${CFG.currencies.USD.symbol}${CFG.delivery.fee}.`, "Service area: " + CFG.delivery.areas.join(", ") + "."],
  };
  return (
    <>
      <PageHead title="Policies" sub="Placeholder legal copy — have counsel review before launch." crumbs={[{ label: "Policies" }]} />
      <div className="wrap" style={{ marginTop: 24, maxWidth: 860 }}>
        <Tabs tabs={tabs} value={tab} variant="underline" label="Policies" idBase="pol" onChange={(id) => setQuery({ tab: id === "privacy" ? "" : id }, { replace: true })} />
        <div key={tab} role="tabpanel" id="pol-panel" aria-labelledby={"pol-" + tab} style={{ paddingTop: 22, display: "grid", gap: 14, animation: "pageIn .4s var(--ease)" }}>
          {body[tab].map((b, i) => <p key={i}>{b}</p>)}
        </div>
      </div>
    </>
  );
}

function NotFound() {
  useTitle("Page not found");
  return (
    <div className="wrap" style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: "clamp(90px, 16vw, 180px)", fontWeight: 800, color: "var(--green)", letterSpacing: "-.06em", lineHeight: 1 }}>4<span style={{ color: "var(--lime)", WebkitTextStroke: "3px var(--green)" }}>0</span>4</div>
      <h1 style={{ fontSize: 28, marginTop: 10 }}>This aisle is empty</h1>
      <p className="muted" style={{ marginTop: 8 }}>The page you're looking for has moved or never existed.</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}><Link to="/" className="btn btn-green">Back home</Link><Link to="/shop" className="btn btn-ghost">Browse shop</Link></div>
    </div>
  );
}

Object.assign(window, { WishlistPage, LoginPage, AccountPage, BlogPage, ArticlePage, AboutPage, ContactPage, FAQPage, StoresPage, CareersPage, PoliciesPage, NotFound });

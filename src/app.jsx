/* ==========================================================================
   APP — route table. Adding a page = one component + one entry here
   (+ optional nav entry in config.js).
   ========================================================================== */
const ROUTES = [
  [/^\/$/, () => <HomePage />],
  [/^\/shop$/, (m, q) => <ShopPage query={q} />],
  [/^\/categories$/, () => <CategoriesPage />],
  [/^\/search$/, (m, q) => <ShopPage query={q} searchMode />],
  [/^\/product\/([\w-]+)$/, (m, q) => <ProductPage slug={m[1]} query={q} />],
  [/^\/cart$/, () => <CartPage />],
  [/^\/checkout$/, (m, q) => <CheckoutPage query={q} />],
  [/^\/order\/(\w+)$/, (m) => <OrderConfirmation id={m[1]} />],
  [/^\/track(?:\/(\w+))?$/, (m) => <TrackPage id={m[1]} />],
  [/^\/wishlist$/, () => <WishlistPage />],
  [/^\/account$/, (m, q) => <AccountPage query={q} />],
  [/^\/login$/, (m, q) => <LoginPage query={q} />],
  [/^\/blog$/, () => <BlogPage />],
  [/^\/blog\/([\w-]+)$/, (m) => <ArticlePage slug={m[1]} />],
  [/^\/about$/, () => <AboutPage />],
  [/^\/contact$/, () => <ContactPage />],
  [/^\/faq$/, () => <FAQPage />],
  [/^\/stores$/, () => <StoresPage />],
  [/^\/careers$/, () => <CareersPage />],
  [/^\/policies$/, (m, q) => <PoliciesPage query={q} />],
];

function App() {
  const { path, query } = useRoute();
  let el = <NotFound />, key = path;
  for (const [re, fn] of ROUTES) { const m = path.match(re); if (m) { el = fn(m, query); break; } }
  useEffect(() => { requestAnimationFrame(() => { document.querySelectorAll(".rv:not(.in)").forEach((x) => { const r = x.getBoundingClientRect(); if (r.top < innerHeight) x.classList.add("in"); }); }); }, [path]);
  useReveal([path]);
  return (
    <>
      <a href="#main" className="sr" onFocus={(e) => e.currentTarget.classList.remove("sr")} onBlur={(e) => e.currentTarget.classList.add("sr")} onClick={(e) => { e.preventDefault(); document.getElementById("main").focus(); }}>Skip to content</a>
      <UtilityBar />
      <Header path={path} />
      <main id="main" tabIndex="-1" style={{ outline: "none", minHeight: "60vh", paddingBottom: 72 }}>
        <div className="page" key={key}>{el}</div>
      </main>
      <Footer />
      <BottomNav path={path} />
      <CartDrawer />
      <MobileMenu />
      <MobileSearch />
      <QuickView />
      <Toasts />
      <WhatsAppButton />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

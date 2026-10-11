/* ==========================================================================
   ECOGROW — SITE CONFIG
   Everything a client may want to change lives here: brand, contact, nav,
   tabs, currency, payments, delivery rules, promos, countdown, copy.
   Components read ONLY from window.ECO_CONFIG / window.ECO_DATA.
   ========================================================================== */
window.ECO_CONFIG = {
  brand: {
    name: "Ecogrow",                      // PLACEHOLDER — fictional brand, replace
    tagline: "Online grocery store",
    logoMark: "leaf",                     // swap for an <img> path when client logo arrives
    blurb: "Fresh produce, dairy and pantry staples from local organic farms, delivered to your door the same day.",
  },
  contact: {
    address: "1234 Market Street, Wilmington, DE 19801",
    hours: "Mon–Sun · 09:00 AM – 08:00 PM",
    phone: "+1 800 900 2462",
    phone2: "+1 302 555 0148",
    email: "hello@ecogrow.store",
    whatsapp: "18009002462",              // digits only; set "" to hide the floating WhatsApp button
  },
  market: {
    region: "US",
    defaultCurrency: "USD",
    defaultLanguage: "en",
    weightUnit: "metric",                 // "metric" | "imperial" (user can switch)
  },
  currencies: {                           // rates relative to base USD — verify before launch
    USD: { symbol: "$", rate: 1, locale: "en-US" },
    EUR: { symbol: "€", rate: 0.92, locale: "de-DE" },
    GBP: { symbol: "£", rate: 0.79, locale: "en-GB" },
    NGN: { symbol: "₦", rate: 1550, locale: "en-NG" },
    KES: { symbol: "KSh", rate: 129, locale: "en-KE" },
  },
  languages: [
    { id: "en", label: "English" },
    { id: "es", label: "Español" },
    { id: "fr", label: "Français" },
  ],
  payments: {
    provider: "mock",                     // "stripe" | "paystack" | "flutterwave" | "mock"
    available: [
      { id: "stripe", label: "Card (Stripe)", note: "Visa, Mastercard, Amex, Apple Pay" },
      { id: "paystack", label: "Paystack", note: "Cards, bank transfer, USSD" },
      { id: "flutterwave", label: "Flutterwave", note: "Cards, mobile money, M-Pesa" },
      { id: "cod", label: "Cash on delivery", note: "Pay the rider at your door" },
    ],
  },
  delivery: {
    freeThreshold: 50,                    // in base currency (USD)
    fee: 4.99,
    areas: ["19801", "19802", "19803", "19804", "19805", "19806", "19808", "19809", "19810"],
    slots: ["09:00 – 11:00", "11:00 – 13:00", "13:00 – 15:00", "15:00 – 17:00", "17:00 – 19:00", "19:00 – 20:00"],
    promoCodes: { FRESH10: 0.10, FIRST60: 0.60 },
  },
  deal: {
    endsAt: "2026-10-22T20:30:00",        // drives the "Today's Best Deal" countdown
  },

  /* ---- NAVIGATION: add / remove / rename / reorder freely ---- */
  nav: [
    { id: "home", label: "Home", href: "/" },
    { id: "shop", label: "Shop", href: "/shop", children: [
      { label: "All products", href: "/shop" },
      { label: "On sale", href: "/shop", query: { sale: "1" } },
      { label: "Organic only", href: "/shop", query: { tags: "organic" } },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Track an order", href: "/track" },
    ]},
    { id: "category", label: "Category", mega: true },
    { id: "blog", label: "Blog", href: "/blog" },
    { id: "about", label: "About", href: "/about" },
  ],

  /* ---- PRODUCT TABS (home + shop). filter = category id or "all" ---- */
  productTabs: [
    { id: "all", label: "All Products", icon: "grid", filter: "all" },
    { id: "vegetables", label: "Vegetables", icon: "carrot", filter: "vegetables" },
    { id: "fruits", label: "Fruits", icon: "apple", filter: "fruits" },
    { id: "milk", label: "Milk", icon: "milk", filter: "dairy" },
    { id: "meat", label: "Meat", icon: "meat", filter: "meat" },
    { id: "snacks", label: "Snacks", icon: "nut", filter: "snacks" },
  ],

  dietaryTags: [
    { id: "organic", label: "Organic" },
    { id: "vegan", label: "Vegan" },
    { id: "gluten-free", label: "Gluten-free" },
    { id: "local", label: "Local" },
  ],

  hero: [
    { id: "h1", title: "Discover Mouthwatering Grocery", accent: "Deals Today!", sub: "Enjoy Up to 60% Off Your First Buy!", cta: "Shop now", href: "/shop", img: "img/people/farmer-produce.jpg", pos: "62% 30%", alt: "Smiling farmer in an apron holding a wooden crate of fresh vegetables in a green field" },
    { id: "h2", title: "Farm-Fresh Produce,", accent: "Picked This Morning", sub: "Same-day delivery from 30+ local organic farms.", cta: "Browse vegetables", href: "/shop", query: { cat: "vegetables" }, img: "img/veg-basket3.jpg", pos: "50% 50%", alt: "Wicker basket filled with assorted fresh vegetables" },
    { id: "h3", title: "Crisp Orchard Apples", accent: "Now 15% Off", sub: "Hand-picked, unwaxed and never cold-stored for months.", cta: "Shop fruits", href: "/shop", query: { cat: "fruits" }, img: "img/people/apples-basin.jpg", pos: "50% 55%", alt: "Hands holding a large enamel bowl full of red apples" },
  ],

  featuredCategories: [
    { label: "Cake & Milk", img: "img/p/cake.jpg", tint: "rose", query: { cat: "bakery" } },
    { label: "Organic Kiwi", img: "img/p/kiwi.jpg", tint: "sage", query: { q: "kiwi" } },
    { label: "Peach", img: "img/p/peach.jpg", tint: "peach", query: { q: "peach" } },
    { label: "Red Apple", img: "img/p/apple.jpg", tint: "butter", query: { q: "apple" } },
    { label: "Snacks", img: "img/p/nuts.jpg", tint: "sand", query: { cat: "snacks" } },
    { label: "Vegetables", img: "img/p/broccoli.jpg", tint: "mint", query: { cat: "vegetables" } },
    { label: "Strawberry", img: "img/p/strawberry.jpg", tint: "rose", query: { cat: "berries" } },
    { label: "Black plum", img: "img/p/plum.jpg", tint: "lilac", query: { q: "plum" } },
    { label: "Dairy", img: "img/p/milk.jpg", tint: "sky", query: { cat: "dairy" } },
    { label: "Spices", img: "img/p/chili.jpg", tint: "peach", query: { cat: "spices" } },
  ],

  promos: [
    { id: "p1", tone: "yellow", title: "Everyday Fresh & Clean with Our Products", cta: "Shop now", href: "/shop", query: { cat: "vegetables" }, imgs: ["img/p/cabbage.jpg", "img/p/broccoli.jpg", "img/p/corn.jpg"] },
    { id: "p2", tone: "pink", title: "Make your Breakfast Healthy and Easy", cta: "Shop now", href: "/shop", query: { cat: "fruits" }, imgs: ["img/p/strawberry.jpg", "img/p/kiwi.jpg", "img/p/peach.jpg"] },
  ],

  deliveryBanner: {
    title: "Stay home & get your daily needs everyday",
    hours: "09:00 AM to 08:00 PM",
    chips: ["Best Price", "Free Delivery"],
    cta: "Order Now",
    img: "img/rider-cut.png",
  },

  features: [
    { icon: "bolt", title: "Fast Delivery", sub: "Within 1 hour max" },
    { icon: "phone", title: "Order Grocery", sub: "By web or app" },
    { icon: "refresh", title: "Return Instantly", sub: "Any rotten items" },
    { icon: "map", title: "Track Delivery", sub: "With live map coverage" },
  ],

  photoStrip: [
    { img: "img/people/farmer-produce.jpg", pos: "62% 40%", alt: "Farmer holding a crate of vegetables" },
    { img: "img/people/apples-basin.jpg", pos: "50% 50%", alt: "Bowl of freshly picked apples" },
    { img: "img/veg-basket2.jpg", pos: "50% 60%", alt: "Basket of herbs, eggs and tomatoes" },
    { img: "img/people/apple-hand.jpg", pos: "50% 50%", alt: "Hand holding a freshly picked apple" },
  ],

  footer: {
    columns: [
      { title: "Useful Pages", links: [["Order", "/track"], ["Returns", "/policies", { tab: "returns" }], ["Help Center", "/faq"], ["Career", "/careers"], ["Policy", "/policies"]] },
      { title: "Help Center", links: [["Payments", "/faq"], ["Shipping", "/policies", { tab: "shipping" }], ["FAQ", "/faq"], ["Checkout", "/checkout"], ["Other Issues", "/contact"]] },
      { title: "Store Information", links: [["Store Information", "/stores"], ["About Store", "/about"], ["Latest Products", "/shop", { sort: "new" }], ["New Discounts", "/shop", { sale: "1" }], ["Sale Products", "/shop", { sale: "1", sort: "discount" }]] },
    ],
    paymentIcons: ["VISA", "Mastercard", "Amex", "PayPal", "Apple Pay"],
  },
};

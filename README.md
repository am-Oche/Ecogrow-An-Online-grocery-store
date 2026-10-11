# Ecogrow — online grocery store

This is a working, multi-page prototype of the store. You can click through all of it. Every piece of content, setting and brand detail lives in two files, so the client can change things without touching any component:

| File | What it holds |
|---|---|
| `src/config.js` | brand, contact details, hours, nav, product tabs, currencies, payments, delivery rules, promo codes, countdown end date, hero slides, promos, footer |
| `src/data.js` | 8 categories, 40 products, 6 testimonials, 8 FAQs, 4 blog posts, stores, partners, and the image license ledger (`ECO_ASSETS`) |
| `src/styles.css` | design tokens (colors, radii, shadows, fonts) as CSS variables |

## How to edit
- **Nav:** edit `ECO_CONFIG.nav`. You can add, remove, rename or reorder items. An item with `children` becomes a dropdown. `mega: true` gives you the category mega-menu.
- **Product tabs:** edit `productTabs` (`id`, `label`, `icon`, `filter` = category id or `"all"`). The Home and Shop pages both read this list.
- **Categories / products:** add entries in `data.js`. Weight options are generated from the base weight.
- **Banners:** edit `hero[]`, `promos[]`, `deliveryBanner`, `featuredCategories[]`.
- **Countdown:** set `deal.endsAt`.
- **Colors / fonts:** change the `:root` variables in `styles.css` and the Google Fonts link in the HTML.
- **Currency:** set `market.defaultCurrency` and the `currencies` rates. Prices are stored in USD.
- **Payments:** set `payments.provider`. Real SDK calls go in `PaymentAdapter.charge` (`src/checkout.jsx`).
- **Free delivery / fees / service area / slots:** edit the `delivery` block.
- **WhatsApp:** set `contact.whatsapp`. Use `""` to hide it.
- **Adding a page:** write a component, add one line to `ROUTES` in `src/app.jsx`, and optionally add a nav entry.

## URL state
Routes use a hash, and every tab, filter, sort, checkout step and account section is saved in the query string (for example `#/?tab=fruits`, `#/shop?cat=dairy&tags=organic&sort=low`). This means refresh, the back button and sharing a link all work.

## Images: verify before launch
All images are public-domain or CC0 photos taken from library search results. They are listed with their sources in `ECO_ASSETS`. Free stock libraries had very few clean cutouts, so:
- product photos sit on tinted tiles using `mix-blend-mode: multiply`. Run `scripts/remove-bg.py` to make real transparent WebP cutouts.
- the scooter rider is an **illustration** whose background was removed in the browser. It is tagged "Replace with photo cutout".
- no licensed photo of a smiling older farmer was available. The hero uses a younger farmer holding a crate of vegetables.
- the farm partner logos and the "Ecogrow" brand are fictional placeholders.

## Porting to Next.js
The structure maps directly onto a Next.js App Router project:
- `core.jsx` stores → Zustand `persist`
- `Tabs` / `AnimatedGrid` → Framer Motion `layoutId` / `layout`
- `Carousel` → Embla
- forms → React Hook Form + Zod
- `ROUTES` → `app/` folders

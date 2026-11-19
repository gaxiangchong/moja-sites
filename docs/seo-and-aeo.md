# SEO & AEO — what's in the code, and what you still need to do

AEO = Answer Engine Optimisation: being the source ChatGPT, Perplexity, Gemini
and Google's AI Overviews quote when someone asks "where can I order a burnt
cheesecake in Johor Bahru?". It runs on the same foundations as SEO plus clean,
machine-readable facts — which is what the structured data below provides.

---

## 1. What the site now emits

| Page | Title / description | Canonical | Structured data |
|---|---|---|---|
| `/` | Local, keyword-led | ✅ | `Bakery`, `WebSite`, `WebPage`, `ItemList` |
| `/shop` | "Cake Menu — Order Cakes in Johor Bahru…" | ✅ | `CollectionPage`, `ItemList`, `BreadcrumbList` |
| `/product/[slug]` | Per-cake, auto-generated with price | ✅ | `Product` + `Offer`/`AggregateOffer`, `BreadcrumbList` |
| `/about` | Bakery story + locality | ✅ | `AboutPage`, `BreadcrumbList` |
| `/faq` | Ordering/delivery/halal/storage | ✅ | `FAQPage` (all 18 Q&As), `BreadcrumbList` |
| `/contact` | Contact + visible NAP | ✅ | `ContactPage`, `BreadcrumbList` |
| Legal pages | Canonicalised | ✅ | — |

Plus `/robots.txt` and `/sitemap.xml`, both generated from the live catalog.

Validate anything after a deploy with the
[Rich Results Test](https://search.google.com/test/rich-results) and
[Schema Markup Validator](https://validator.schema.org/).

---

## 2. Environment variables

| Variable | Default | Why it matters |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://mojamaison.com` | **Set this on the host.** Drives every canonical tag, the sitemap and all absolute URLs in structured data. A wrong value points Google at the wrong domain. |
| `NEXT_PUBLIC_SHOW_PRICES` | prices shown | Set `false` to hide prices again site-wide. Note this also removes price/availability from search results — Google only shows prices that are visible on the page. |
| `NEXT_PUBLIC_ORDERING_ENABLED` | ordering on | `false` disables the in-app CTA. WhatsApp ordering keeps working either way. |

**About prices:** no new sync is needed. Prices already travel from the member
app to the storefront — `basePriceCents` and `variants[].priceCents` come over
the catalog API (`/shop/catalog/bundle`) and are snapshotted into
`config/products.catalog.json` by `npm run catalog:pull`. They were simply never
rendered. Update a price in the member app and the storefront follows within
`CATALOG_CACHE_SECONDS` (default 5 minutes).

---

## 3. Before you call this done — edit these

1. **`src/lib/siteConfig.ts` → `SERVICE_AREAS`.** Currently lists the townships
   around the Iskandar Puteri kitchen. These names appear to customers *and* in
   `areaServed` structured data, so an area listed here reads as a promise.
   Trim it to where you actually deliver.
2. **Opening hours.** The homepage, contact page, footer and the `Bakery` schema
   all say Mon 11:00–20:00, Wed–Sun 10:00–18:00, Tue closed. The original site
   only stated Monday and "Tue: OFF" — confirm the Wed–Sun hours are right, and
   if not, fix them in `src/lib/siteConfig.ts` (`OPENING_HOURS`) *and* the three
   display spots so they stay consistent. Wrong hours in schema is worse than no
   hours.
3. **Geo coordinates.** Adding `latitude`/`longitude` to the `Bakery` node (in
   `src/lib/jsonLd.ts`) improves map and "near me" matching. Grab them from your
   Google Business Profile pin.

---

## 4. Off-site work — this is where most of the ranking actually comes from

Code can only take local search so far. In order of impact:

1. **Google Business Profile.** For "cake shop near me" style searches, the
   local pack outranks everything on this list combined. Claim the listing,
   match the name/address/phone to the site *exactly*, add real photos weekly,
   set the same hours, and ask every happy customer for a review.
2. **Google Search Console.** Verify `mojamaison.com`, submit
   `https://mojamaison.com/sitemap.xml`, then watch Coverage and the Products
   report for structured-data errors.
3. **Bing Webmaster Tools.** Bing's index feeds ChatGPT search. Cheap to do,
   directly affects AEO.
4. **Real reviews.** The three testimonials on the homepage are hard-coded in
   `src/app/page.tsx`. I deliberately did **not** mark them up as
   `Review`/`AggregateRating`: self-serving review markup that isn't tied to a
   verified review system violates Google's policy and risks a manual action.
   Once reviews live in a real system (Google, or the member app), wire that
   source in and the markup becomes safe — and genuinely valuable.
5. **Content for the questions people actually type.** The FAQ is good AEO fuel
   because answer engines lift Q&A pairs verbatim. Worth adding, once you can
   answer them accurately: "How far in advance should I order?", "Do you deliver
   to [area]?", "What's the minimum order for corporate gifting?", "Do you do
   custom cake designs?". Add them to the `sections` array in
   `src/app/faq/page.tsx` — the schema picks them up automatically.

---

## 5. Conversion notes

- Every product page now offers two paths: the Moja app, and WhatsApp with the
  cake name and URL pre-written into the message.
- Sold-out cakes used to dead-end. They now offer "Ask about availability"
  (WhatsApp) and a link back to what's in stock.
- Dead `href="#"` links on the homepage (email, phone, Instagram) and the FAQ
  ("Contact support") are now real `mailto:` / `tel:` / profile / `/contact`
  links.
- The hero image is a 2.1 MB PNG. `next/image` re-encodes it, but exporting a
  WebP source around 300–400 KB would still cut the largest-contentful-paint
  time, which is a ranking factor on mobile.

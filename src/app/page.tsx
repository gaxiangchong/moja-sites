import Image from "next/image";
import Link from "next/link";
import { OrderInAppButton } from "@/components/OrderInAppButton";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getHomeFeaturedProducts, getShopSections } from "@/lib/products";
import type { ShopListingProduct } from "@/lib/productTypes";

const HERO_IMAGE = "/images/hero-chef-burnt-cheesecake.png";

const PREMIUM_SECTION_ID = "premium-cake";
const PREMIUM_HIGHLIGHT_COUNT = 4;

/**
 * Short flavour lines for the "Premium cakes" tiles, keyed by product slug.
 * Anything missing falls back to a trimmed version of the catalog description,
 * so a newly added cake still renders sensibly.
 */
const PREMIUM_FLAVOUR_NOTES: Record<string, string> = {
  "caramel-espresso-gateau": "Espresso sponge, salted caramel.",
  "jasmine-blanc-cheesecake": "Jasmine tea, floral, burnt Basque.",
  "lemon-yuzu-cake": "Osmanthus chantilly, sweet longan.",
  "matcha-marmalade": "Ceremonial matcha, yuzu marmalade.",
  "strawberry-shortcake": "Chiffon sponge, cream, strawberries.",
  "mixed-fruit-basque-cheesecake": "Caramelised top, custardy centre.",
  "pistachio-noir-cheesecake": "Pistachio, dark chocolate, burnt Basque.",
  "tiramisu-noir-cheesecake": "Espresso, mascarpone, cocoa.",
  "citron-basque-cheesecake": "Lemon zest, tangy and creamy.",
  "truffle-basque-cheesecake": "Dark chocolate truffle ganache.",
};

function flavourNote(product: ShopListingProduct): string {
  const curated = PREMIUM_FLAVOUR_NOTES[product.slug];
  if (curated) return curated;

  // Fallback: first sentence of the catalog description, trimmed to one line.
  const firstSentence = product.description.split(/(?<=\.)\s/)[0]?.trim() ?? "";
  if (firstSentence.length <= 64) return firstSentence;
  return `${firstSentence.slice(0, 61).replace(/[\s,—-]+$/, "")}…`;
}

export const revalidate = 300;

export default async function Home() {
  const [featuredProducts, shopSections] = await Promise.all([
    getHomeFeaturedProducts(),
    getShopSections(),
  ]);

  // Drive the "Premium cakes" tiles from the live catalog so they can never
  // advertise a cake the store no longer sells. Skip anything already shown in
  // the featured row above to avoid repeating the same cakes on one page.
  const featuredSlugs = new Set(featuredProducts.map((p) => p.slug));
  const premiumProducts =
    shopSections.find((section) => section.id === PREMIUM_SECTION_ID)
      ?.products ?? [];
  const unfeaturedPremium = premiumProducts.filter(
    (p) => !featuredSlugs.has(p.slug),
  );
  const premiumHighlights = (
    unfeaturedPremium.length > 0 ? unfeaturedPremium : premiumProducts
  ).slice(0, PREMIUM_HIGHLIGHT_COUNT);

  return (
    <div className="flex flex-col flex-1">
      <div className="border-b border-slate-900/10 bg-slate-900 text-center text-[11px] font-medium tracking-wide text-white sm:text-xs">
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <span className="text-[#9edcff]">Freshly baked</span> in small batches
          <span className="mx-2 text-slate-400">·</span>
          Order via the{" "}
          <span className="font-semibold text-white">Moja app</span>
          <span className="mx-2 text-slate-400">·</span>
          Pickup &amp; delivery slots available
        </div>
      </div>

      <SiteHeader />

      <main className="flex-1">
        {/* Full-bleed hero: image-first for immediate visual hook */}
        <section className="relative isolate w-full overflow-hidden bg-[#050a14]">
          <div className="absolute inset-0">
            <div className="hero-image-drift absolute inset-[-8%] min-h-[120%] min-w-[120%]">
              <Image
                src={HERO_IMAGE}
                alt="Pastry chef finishing a burnt Basque cheesecake, highlighting the caramelized top and careful craftsmanship"
                fill
                className="object-cover object-center"
                sizes="100vw"
                priority
                fetchPriority="high"
              />
            </div>
            {/* No directional overlay — full photo stays even; copy uses the glass panel + shadows */}
          </div>

          <div className="relative mx-auto flex w-full min-h-[min(48vh,440px)] max-w-6xl flex-col justify-start gap-6 px-4 pb-10 pt-5 sm:min-h-[min(44vh,400px)] sm:pb-11 sm:pt-6 lg:min-h-[min(42vh,380px)] lg:pb-12 lg:pt-8">
            <div className="ml-auto w-full max-w-xl text-left lg:max-w-2xl rounded-3xl border border-white/[0.14] bg-slate-950/25 px-5 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-7 sm:py-8 lg:bg-slate-950/20 lg:backdrop-blur-lg">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#c8e8ff] backdrop-blur-md">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#57f0ff] shadow-[0_0_12px_rgba(87,240,255,0.9)]"
                  aria-hidden
                />
                Baked to order · Muslim-friendly ingredients
              </div>

              <h1 className="font-display mt-6 text-balance text-4xl font-medium leading-[1.08] tracking-tight text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.6)] sm:text-5xl lg:text-6xl">
                Cakes worth craving for everyday moments
              </h1>
              <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-slate-100/95 [text-shadow:0_1px_16px_rgba(0,0,0,0.4)] sm:text-lg">
                Less-sweet, texture-forward recipes guests remember. Explore
                our collection here — order sizes, slots, and rewards in the app.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#62a6ff] to-[#57f0ff] px-7 py-3.5 text-sm font-semibold text-[#050a14] shadow-[0_16px_48px_rgba(98,166,255,0.35)] transition hover:brightness-110"
                >
                  Explore our cakes
                </Link>
                <OrderInAppButton
                  className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                  label="Order in app"
                />
              </div>

              {/* <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-100/90 [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-2">
                  <span className="text-amber-300" aria-hidden>
                    ★★★★★
                  </span>
                  <span className="font-medium text-white">Loved for taste &amp; texture</span>
                </div>
                <span className="hidden h-4 w-px bg-white/20 sm:block" aria-hidden />
                <div>
                  <span className="font-semibold text-[#9edcff]">
                    Order before 1PM
                  </span>{" "}
                  Mon–Sat for same / next-day
                </div>
              </div> */}
            </div>
          </div>
        </section>

        {/* Quick trust + urgency strip */}
        <section
          className="border-b border-slate-900/10 bg-white/90 backdrop-blur-sm"
          aria-label="Why Moja Maison"
        >
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-5 sm:grid-cols-3">
            {[
              {
                title: "Fresh from our kitchen",
                body: "Made after you order — not sitting on a shelf.",
              },
              {
                title: "Clear pickup & delivery windows",
                body: "Choose a slot that fits your day.",
              },
              {
                title: "Gifting-ready presentation",
                body: "Impress at birthdays, raya, and “just because”.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-3 rounded-2xl border border-slate-900/8 bg-white/80 px-4 py-3"
              >
                <span
                  className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-[#62a6ff] to-[#57f0ff]"
                  aria-hidden
                />
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-sm text-slate-600">{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-12 pb-6 sm:pt-16">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <h2 className="font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                Built for celebrations — and ordinary Thursdays.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                When people eat with their eyes first, a strong hero photo wins
                attention; the next click should feel effortless. Start with
                crowd favorites, then explore the full menu.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1a5f9e] hover:text-slate-900"
              >
                See full menu
                <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="lg:col-span-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Baked fresh daily",
                    desc: "Preorder required — crafted in small batches.",
                  },
                  {
                    title: "Same / next-day delivery",
                    desc: "Order before 1PM (Mon–Sat).",
                  },
                  {
                    title: "Muslim-friendly",
                    desc: "Ingredients selected with care.",
                  },
                  {
                    title: "Coverage",
                    desc: "Delivery within selected city zones.",
                  },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="rounded-2xl border border-slate-900/10 bg-white/80 p-4 shadow-sm shadow-slate-900/[0.03]"
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      {f.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="shop" className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                Featured creations
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                A taste of what we bake — tap a cake for the full story. To
                order, open the Moja app for sizes, pickup slots, and member
                rewards.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-900/15 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-900/25 hover:bg-slate-50"
            >
              View all products
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((p, idx) => (
              <article
                key={p.slug}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-900/10 bg-white/90 shadow-sm shadow-slate-900/[0.04] transition hover:-translate-y-0.5 hover:border-slate-900/15 hover:shadow-md"
              >
                <Link
                  href={`/product/${p.slug}`}
                  className="relative block aspect-[4/3] overflow-hidden bg-slate-100"
                >
                  <div
                    className="absolute inset-0 opacity-90 transition group-hover:opacity-100"
                    style={{
                      background:
                        idx % 2 === 0
                          ? "radial-gradient(420px 240px at 15% 15%, rgba(98,166,255,0.28), transparent 55%)"
                          : "radial-gradient(420px 240px at 85% 15%, rgba(87,240,255,0.22), transparent 55%)",
                    }}
                    aria-hidden
                  />
                  <Image
                    src={p.images[0]?.src ?? "/images/demo/shop/display-case.jpg"}
                    alt={p.images[0]?.alt ?? p.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
                  {p.badge ? (
                    <div className="absolute left-3 top-3 rounded-full border border-slate-900/10 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
                      {p.badge}
                    </div>
                  ) : null}
                </Link>

                <div className="flex flex-1 flex-col p-5 pt-4">
                  <Link href={`/product/${p.slug}`}>
                    <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-[#1a5f9e]">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                    {p.shortDescription ?? p.summary}
                  </p>

                  <div className="mt-5 flex gap-2">
                    <Link
                      href={`/product/${p.slug}`}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-900/12 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-white"
                    >
                      View details
                    </Link>
                    <OrderInAppButton
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#62a6ff] to-[#57f0ff] px-4 py-2.5 text-sm font-semibold text-[#050a14] transition hover:brightness-110"
                      label="Order in app"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <h2 className="font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                Premium cakes
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                A union of flavors and textures — built for gifting, sharing,
                and those “just because” days.
              </p>
            </div>
            <div className="lg:col-span-7">
              <div className="grid gap-4 sm:grid-cols-2">
                {premiumHighlights.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/product/${p.slug}`}
                    className="block rounded-3xl border border-slate-900/10 bg-white/85 p-5 transition hover:-translate-y-0.5 hover:border-slate-900/20 hover:bg-white hover:shadow-sm"
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      {p.name}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {flavourNote(p)}
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900/20" />
                      Crafted in small batches
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-3xl border border-slate-900/10 bg-gradient-to-br from-white via-white to-[#f0f7ff] p-6 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl">
                  Real reviews from real celebrations
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                  Social proof reduces hesitation — here&apos;s what customers
                  say about freshness, delivery, and flavor balance.
                </p>
              </div>
              <OrderInAppButton label="Order in app" />
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {[
                {
                  name: "Rain Prince",
                  text: "The Original Basque was light and not too sweet, with that custardy centre everyone talks about. Would order again.",
                  meta: "10 Mar 26",
                },
                {
                  name: "Jaslene K",
                  text: "Our Strawberry Short Cake arrived fresh and moist, and the cream was beautifully balanced. Delivery was right on time.",
                  meta: "03 Mar 26",
                },
                {
                  name: "Norhayati",
                  text: "Citron Blossom Basque had a lovely tangy lift against the creaminess. Fast delivery and the perfect size — no leftovers.",
                  meta: "04 Feb 26",
                },
              ].map((r) => (
                <blockquote
                  key={r.name}
                  className="rounded-3xl border border-slate-900/10 bg-white/90 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-slate-900">{r.name}</div>
                    <div className="text-xs text-slate-400">{r.meta}</div>
                  </div>
                  <p
                    className="mt-2 text-amber-500"
                    aria-label="5 out of 5 stars"
                  >
                    ★★★★★
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    “{r.text}”
                  </p>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-slate-900/10 bg-white/85 p-6">
                <div className="text-sm font-semibold text-slate-900">
                  Follow us on Instagram
                </div>
                <div className="mt-2 text-sm leading-relaxed text-slate-600">
                  New drops, behind-the-scenes, and limited editions — follow
                  before they sell out.
                </div>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800">
                  @mojamaison
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-900/10 bg-white/85 p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Operation hours
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <div>Web - Mon: 11:00 AM - 8:00 PM</div>
                      <div>Tue: OFF</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Connect
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <div>
                        Email:{" "}
                        <a
                          className="font-medium text-slate-800 hover:text-slate-900"
                          href="#"
                        >
                          admin@mojamaison.com
                        </a>
                      </div>
                      <div>
                        Phone:{" "}
                        <a
                          className="font-medium text-slate-800 hover:text-slate-900"
                          href="#"
                        >
                          +60 11-3933 1134
                        </a>
                      </div>
                      <div className="mt-3">
                        <Link
                          href="/contact"
                          className="text-sm font-semibold text-[#1a5f9e] hover:text-slate-900"
                        >
                          WhatsApp, email &amp; social →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="faq" className="mt-6 border-t border-slate-900/10 pt-6">
                  <div className="text-sm font-semibold text-slate-900">FAQ</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        q: "Can I get same-day delivery?",
                        a: "Selected items only. Order before 1PM (Mon–Sat).",
                      },
                      {
                        q: "Do you bake upon order?",
                        a: "Yes — preorder required for freshness and quality.",
                      },
                    ].map((x) => (
                      <div
                        key={x.q}
                        className="rounded-2xl border border-slate-900/10 bg-white/70 p-4"
                      >
                        <div className="text-sm font-semibold text-slate-900">
                          {x.q}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">{x.a}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

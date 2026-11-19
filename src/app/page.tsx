import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { OrderInAppButton } from "@/components/OrderInAppButton";
import { OrderOnWhatsAppButton } from "@/components/OrderOnWhatsAppButton";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  getHomeFeaturedProducts,
  getProductsBySlug,
  getShopSections,
} from "@/lib/products";
import type { ProductDetail } from "@/lib/productTypes";
  getCatalogSource,
  getHomeFeaturedProducts,
  getShopSections,
} from "@/lib/products";
import type { ShopListingProduct } from "@/lib/productTypes";
import { getCompanyConfig } from "@/lib/companyConfig";
import { itemListJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import {
  displayPriceLabel,
  priceLabelFrom,
  pricesVisible,
} from "@/lib/priceDisplay";
import { SERVICE_AREAS, SITE_DESCRIPTION } from "@/lib/siteConfig";

const HOME_TITLE =
  "Cake Delivery in Johor Bahru & Iskandar Puteri | Handcrafted to Order";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
};

const HERO_IMAGE = "/images/hero-moja-baker-basque.webp";

/**
 * Sections the featured row tops up from, in the order they are drawn on.
 * "premium-cake" is listed last because it doubles as the fallback for when
 * config/catalog-sections.json is not splitting it into the cake tiers.
 */
const PREMIUM_SECTION_IDS = [
  "signature-basque",
  "premium-basque",
  "cream-cake",
  "premium-cake",
];
/** Featured creations runs two rows of three on desktop. */
const FEATURED_COUNT = 6;

const COOKIE_SECTION_ID = "box-edition";
const COOKIE_HIGHLIGHT_COUNT = 3;

export const revalidate = 300;

export default async function Home() {
  const [homeFeatured, shopSections, productsBySlug] = await Promise.all([
    getHomeFeaturedProducts(),
    getShopSections(),
    getProductsBySlug(),
  ]);
  const showPrices = pricesVisible(catalogSource);

  // The catalog only marks a handful of products as featured, which is not
  // enough to fill two rows. Top the row up with premium cakes that are not
  // already featured, drawn from the shop section so nothing unlisted appears.
  const featuredSlugs = new Set(homeFeatured.map((p) => p.slug));
  const premiumFill = shopSections
    .filter((section) => PREMIUM_SECTION_IDS.includes(section.id))
    .flatMap((section) => section.products)
    .filter((p) => !featuredSlugs.has(p.slug))
    .map((p) => productsBySlug.get(p.slug))
    .filter((p): p is ProductDetail => Boolean(p));

  const featuredProducts = [...homeFeatured, ...premiumFill].slice(
    0,
    FEATURED_COUNT,
  );

  // Cookie jars keep and travel far better than whole cakes, so they get their
  // own shipping-led section rather than sharing the cake framing.
  const cookieHighlights = (
    shopSections.find((section) => section.id === COOKIE_SECTION_ID)
      ?.products ?? []
  ).slice(0, COOKIE_HIGHLIGHT_COUNT);

  const company = getCompanyConfig();
  const featuredPriceLabels = new Map(
    featuredProducts.map((p) => [p.slug, priceLabelFrom(p.price, p.variants)]),
  );
  const structuredData = [
    webPageJsonLd({
      name: HOME_TITLE,
      description: SITE_DESCRIPTION,
      path: "/",
    }),
    itemListJsonLd(
      featuredProducts.map((p) => ({
        slug: p.slug,
        name: p.name,
        description: p.shortDescription ?? p.summary,
        price: p.price,
        imageSrc: p.images[0]?.src ?? "",
      })),
      { name: "Featured cakes", path: "/" },
    ),
  ];

  return (
    <div className="flex flex-col flex-1">
      {structuredData.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
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
            {/*
              Only a little over-scale: enough for the slow drift to have room,
              but not so much that it crops the baker and the apron wordmark off
              the right edge. The photo is composed deliberately, with the
              subject right and clear space left, so hard cropping costs us the
              whole point of it.
            */}
            <div className="hero-image-drift absolute inset-[-3%] min-h-[106%] min-w-[106%]">
              <Image
                src={HERO_IMAGE}
                alt="A Moja Maison baker dusting sugar over a burnt Basque cheesecake on a marble counter in a sunlit kitchen"
                fill
                /*
                  On phones the wide photo is cropped to a tall frame, and
                  centring it would show mostly the empty wall. Favour the
                  right side so the baker and the cake stay in shot; from sm up
                  the frame is wide enough to centre and keep the clear space.
                */
                className="object-cover object-[72%_center] sm:object-center"
                sizes="100vw"
                priority
                fetchPriority="high"
              />
            </div>
            {/*
              Directional scrim instead of a frosted panel. The subject of the
              photo sits on the right, so the copy goes left and the gradient
              darkens only that side, leaving the baker and the cake uncovered.
              Phones get a vertical gradient instead: the crop is too narrow
              for any part of the frame to stay clear.
            */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-[#050a14]/85 via-[#050a14]/55 to-[#050a14]/85 sm:bg-gradient-to-r sm:from-[#050a14]/90 sm:via-[#050a14]/45 sm:to-transparent"
              aria-hidden
            />
          </div>

          <div className="relative mx-auto flex w-full min-h-[min(48vh,440px)] max-w-6xl flex-col justify-start gap-6 px-4 pb-10 pt-5 sm:min-h-[min(44vh,400px)] sm:pb-11 sm:pt-6 lg:min-h-[min(42vh,380px)] lg:pb-12 lg:pt-8">
            <div className="mr-auto w-full max-w-xl text-left lg:max-w-2xl py-7 sm:py-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#c8e8ff] backdrop-blur-md">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#57f0ff] shadow-[0_0_12px_rgba(87,240,255,0.9)]"
                  aria-hidden
                />
                Baked to order · Muslim-friendly ingredients
              </div>

              <h1 className="font-display mt-6 text-balance text-[1.75rem] font-medium leading-[1.12] tracking-tight text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.6)] sm:text-5xl lg:text-6xl">
                {/* Keeps each clause whole so the line can only break at the
                    comma, never mid-phrase. The phone size is set small
                    enough that the longer clause still fits on one line. */}
                <span className="inline-block">A Little Cake,</span>{" "}
                <span className="inline-block">A Lot of Happiness.</span>
              </h1>
              <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-slate-100/95 [text-shadow:0_1px_16px_rgba(0,0,0,0.4)] sm:text-lg">
                Beautifully crafted cakes for everyday treats and special
                moments. Explore our collection here — order sizes, slots, and
                rewards in the app.
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
                <OrderOnWhatsAppButton
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                  label="WhatsApp us"
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
                Birthdays, Raya, office farewells, or a quiet Thursday that
                deserves cake — every order is baked after you place it, then
                collected in {SERVICE_AREAS[0]} or delivered to your door.
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
                    title: "Delivery coverage",
                    desc: `${SERVICE_AREAS.slice(0, 4).join(", ")} and nearby.`,
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
                This week&apos;s most-ordered cakes. Tap one for sizes,
                allergens and storage, then order in the Moja app or on
                WhatsApp.
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
                  {displayPriceLabel(
                    featuredPriceLabels.get(p.slug),
                    showPrices,
                  ) ? (
                    <div className="mt-1.5 text-sm font-semibold text-slate-900">
                      {displayPriceLabel(
                        featuredPriceLabels.get(p.slug),
                        showPrices,
                      )}
                    </div>
                  ) : null}
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

        {cookieHighlights.length > 0 && (
          <section id="cookies" className="mx-auto max-w-6xl px-4 py-10">
            <div className="overflow-hidden rounded-3xl border border-slate-900/10 bg-gradient-to-br from-[#f7fbff] via-white to-[#f0f7ff]">
              <div className="p-6 sm:p-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#62a6ff]"
                        aria-hidden
                      />
                      Delivered nationwide
                    </div>
                    <h2 className="font-display mt-4 text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                      Cookie jars we can send anywhere
                    </h2>
                    <p className="mt-3 text-base leading-relaxed text-slate-600">
                      Our cakes travel within our delivery zones, but cookie
                      jars keep beautifully — so we ship them nationwide.
                      Sealed fresh, packed to arrive intact, and ready to gift.
                    </p>
                  </div>
                  <Link
                    href="/shop#box-edition"
                    className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-900/15 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-900/25 hover:bg-slate-50"
                  >
                    See all cookie jars
                  </Link>
                </div>

                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {cookieHighlights.map((c) => (
                    <article
                      key={c.slug}
                      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-900/10 bg-white/90 shadow-sm shadow-slate-900/[0.04] transition hover:-translate-y-0.5 hover:border-slate-900/15 hover:shadow-md"
                    >
                      <Link
                        href={`/product/${c.slug}`}
                        className="relative block aspect-[4/3] overflow-hidden bg-slate-100"
                      >
                        <Image
                          src={c.imageSrc}
                          alt={c.name}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col p-5">
                        <Link
                          href={`/product/${c.slug}`}
                          className="font-display text-lg font-medium tracking-tight text-slate-900"
                        >
                          {c.name}
                        </Link>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                          {c.description}
                        </p>
                        <div className="mt-5 flex gap-2">
                          <Link
                            href={`/product/${c.slug}`}
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

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      title: "Ships nationwide",
                      desc: "Cookie jars reach addresses across Malaysia.",
                    },
                    {
                      title: "Sealed for freshness",
                      desc: "Packed airtight so they arrive crisp.",
                    },
                    {
                      title: "Gift-ready jars",
                      desc: "Presented to hand over exactly as they arrive.",
                    },
                  ].map((f) => (
                    <div
                      key={f.title}
                      className="rounded-2xl border border-slate-900/10 bg-white/80 p-4"
                    >
                      <div className="text-sm font-semibold text-slate-900">
                        {f.title}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {f.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-3xl border border-slate-900/10 bg-gradient-to-br from-white via-white to-[#f0f7ff] p-6 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl">
                  Real reviews from real celebrations
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                  What customers tell us about freshness, delivery and how the
                  cakes taste.
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
                <a
                  href="https://www.instagram.com/mojamaison"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
                >
                  @mojamaison
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-900/10 bg-white/85 p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Opening hours
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <div>Mon: 11:00 AM – 8:00 PM</div>
                      <div>Wed–Sun: 10:00 AM – 6:00 PM</div>
                      <div>Tue: Closed</div>
                    </div>
                    <div className="mt-3 text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">
                        Find us:
                      </span>{" "}
                      {company.registeredAddress}
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
                          className="font-medium text-slate-800 underline-offset-2 hover:text-slate-900 hover:underline"
                          href={`mailto:${company.contactEmail}`}
                        >
                          {company.contactEmail}
                        </a>
                      </div>
                      <div>
                        Phone:{" "}
                        <a
                          className="font-medium text-slate-800 underline-offset-2 hover:text-slate-900 hover:underline"
                          href={`tel:${company.contactPhone.replace(/[^\d+]/g, "")}`}
                        >
                          {company.contactPhone}
                        </a>
                      </div>
                      <div className="mt-3">
                        <OrderOnWhatsAppButton label="WhatsApp us to order" />
                      </div>
                      <div className="mt-3">
                        <Link
                          href="/contact"
                          className="text-sm font-semibold text-[#1a5f9e] hover:text-slate-900"
                        >
                          All contact channels →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="faq" className="mt-6 border-t border-slate-900/10 pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-900">
                      FAQ
                    </div>
                    <Link
                      href="/faq"
                      className="text-sm font-semibold text-[#1a5f9e] hover:text-slate-900"
                    >
                      See all answers →
                    </Link>
                  </div>
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

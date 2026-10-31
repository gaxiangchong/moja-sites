import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCatalogProducts,
  getProductsBySlug,
  type ProductDetail,
} from "@/lib/products";
import { OrderInAppButton } from "@/components/OrderInAppButton";
import { ProductGallery } from "@/components/product/ProductGallery";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export async function generateStaticParams() {
  try {
    const products = await getCatalogProducts();
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export const revalidate = 300;

const CRAFT_POINTS = [
  {
    title: "Baked to order",
    body: "Prepared after you order so every cake arrives at its best.",
  },
  {
    title: "Less-sweet profile",
    body: "Balanced sweetness that lets flavour and texture shine through.",
  },
  {
    title: "Gifting-ready",
    body: "Beautiful presentation for birthdays, celebrations, and thoughtful surprises.",
  },
];

const ORDER_STEPS = [
  {
    step: "01",
    title: "Open the Moja app",
    body: "Sign in with your phone number — no password needed.",
  },
  {
    step: "02",
    title: "Choose your cake",
    body: "Pick your size, pickup slot, and any add-ons like birthday kits.",
  },
  {
    step: "03",
    title: "Collect or receive",
    body: "Select a convenient pickup time or delivery window.",
  },
];

function pickRelated(product: ProductDetail, all: ProductDetail[]): ProductDetail[] {
  const sameCategory = all.filter(
    (p) => p.slug !== product.slug && p.category === product.category,
  );
  if (sameCategory.length >= 3) return sameCategory.slice(0, 3);
  return all.filter((p) => p.slug !== product.slug).slice(0, 3);
}

function DetailPanel({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <div className="rounded-3xl border border-slate-900/10 bg-white/75 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-sm leading-relaxed text-slate-700"
          >
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-[#62a6ff] to-[#57f0ff]"
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [productsBySlug, allProducts] = await Promise.all([
    getProductsBySlug(),
    getCatalogProducts(),
  ]);
  const product = productsBySlug.get(slug);
  if (!product) return notFound();

  const related = pickRelated(product, allProducts);
  const tagline = product.shortDescription?.trim() || product.summary;
  const story =
    product.summary.trim() !== tagline.trim()
      ? product.summary
      : null;
  const variantLabels =
    product.variants?.filter((v) => v.available).map((v) => v.label) ?? [];
  const detailPanels = [
    { title: "Size options", items: product.size ?? [] },
    { title: "Allergens", items: product.allergens ?? [] },
    { title: "Handling", items: product.handling ?? [] },
    { title: "Storage", items: product.storage ?? [] },
  ].filter((p) => p.items.length > 0);

  return (
    <div className="min-h-full">
      <SiteHeader ctaLabel="Order in app" />

      <main>
        {/* Hero */}
        <section className="border-b border-slate-900/10 bg-white/40">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 lg:pb-16 lg:pt-10">
            <nav
              className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="transition hover:text-slate-900">
                Home
              </Link>
              <span aria-hidden>/</span>
              <Link href="/shop" className="transition hover:text-slate-900">
                Collection
              </Link>
              <span aria-hidden>/</span>
              <span className="text-slate-700">{product.name}</span>
            </nav>

            <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <ProductGallery
                  images={product.images}
                  name={product.name}
                  badge={product.badge}
                />
              </div>

              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-24">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1a5f9e]">
                    {product.category}
                  </p>
                  <h1 className="font-display mt-3 text-balance text-4xl font-medium leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
                    {product.name}
                  </h1>

                  <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
                    {tagline}
                  </p>

                  {product.soldOut ? (
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Currently unavailable — browse other creations
                    </div>
                  ) : (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {["Muslim-friendly ingredients", "Made fresh to order"].map(
                        (label) => (
                          <span
                            key={label}
                            className="rounded-full border border-slate-900/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700"
                          >
                            {label}
                          </span>
                        ),
                      )}
                    </div>
                  )}

                  {variantLabels.length > 0 ? (
                    <div className="mt-8">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Available sizes
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {variantLabels.map((label) => (
                          <span
                            key={label}
                            className="rounded-2xl border border-slate-900/10 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-800"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Sizes and availability are confirmed in the Moja app.
                      </p>
                    </div>
                  ) : null}

                  {!product.soldOut ? (
                    <div className="mt-8 rounded-[1.75rem] border border-slate-900/10 bg-gradient-to-br from-white via-white to-[#eef6ff] p-6 shadow-[0_20px_60px_rgba(98,166,255,0.08)]">
                      <h2 className="text-lg font-semibold text-slate-900">
                        Order through the Moja app
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Choose your size, pickup slot, and member rewards when
                        you checkout in the app.
                      </p>
                      <div className="mt-5">
                        <OrderInAppButton
                          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#62a6ff] to-[#57f0ff] px-6 py-3.5 text-sm font-semibold text-[#050a14] shadow-[0_12px_32px_rgba(98,166,255,0.22)] transition hover:brightness-110"
                          label="Open Moja app to order"
                        />
                      </div>
                    </div>
                  ) : null}

                  {product.availabilityNote ? (
                    <p className="mt-6 rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3 text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">
                        Note:
                      </span>{" "}
                      {product.availabilityNote}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story & highlights */}
        <section className="mx-auto max-w-6xl px-4 py-14 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                The story
              </p>
              <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                Crafted for moments worth celebrating
              </h2>
              {story ? (
                <p className="mt-5 text-base leading-8 text-slate-600">
                  {story}
                </p>
              ) : (
                <p className="mt-5 text-base leading-8 text-slate-600">
                  {tagline}
                </p>
              )}

              {product.highlights?.length ? (
                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  {product.highlights.map((h) => (
                    <div
                      key={h.title}
                      className="rounded-3xl border border-slate-900/10 bg-white/80 p-5"
                    >
                      <h3 className="text-sm font-semibold text-slate-900">
                        {h.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {h.body}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {CRAFT_POINTS.map((point) => (
                    <div
                      key={point.title}
                      className="rounded-3xl border border-slate-900/10 bg-white/80 p-5"
                    >
                      <h3 className="text-sm font-semibold text-slate-900">
                        {point.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {point.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-[1.75rem] border border-slate-900/10 bg-slate-900 p-6 text-white sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9edcff]">
                  Perfect for
                </p>
                <ul className="mt-5 space-y-3">
                  {[
                    "Birthdays & milestones",
                    "Office celebrations",
                    "Family gatherings",
                    "Thoughtful gifting",
                  ].map((occasion) => (
                    <li
                      key={occasion}
                      className="flex items-center gap-3 text-sm text-slate-100"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                        ✦
                      </span>
                      {occasion}
                    </li>
                  ))}
                </ul>
              </div>

              {detailPanels.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {detailPanels.map((panel) => (
                    <DetailPanel
                      key={panel.title}
                      title={panel.title}
                      items={panel.items}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* How to order */}
        <section className="border-y border-slate-900/10 bg-white/50">
          <div className="mx-auto max-w-6xl px-4 py-14 lg:py-16">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                How to order
              </p>
              <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-slate-900">
                From browse to box in three steps
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {ORDER_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="relative rounded-3xl border border-slate-900/10 bg-white/85 p-6"
                >
                  <span className="font-display text-4xl font-medium text-[#62a6ff]/35">
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related + bottom CTA */}
        <section className="mx-auto max-w-6xl px-4 py-14 lg:pb-20">
          <RelatedProducts products={related} currentSlug={product.slug} />

          <div className="mt-16 overflow-hidden rounded-[2rem] border border-slate-900/10 bg-gradient-to-br from-[#0b1220] via-[#111827] to-[#0f2744] px-6 py-10 text-center sm:px-10 sm:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9edcff]">
              Moja Maison
            </p>
            <h2 className="font-display mx-auto mt-4 max-w-xl text-balance text-3xl font-medium tracking-tight text-white sm:text-4xl">
              Love what you see? Order {product.name} in the app.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
              Member rewards, pickup slots, and checkout — all in one place.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <OrderInAppButton
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#62a6ff] to-[#57f0ff] px-8 py-3.5 text-sm font-semibold text-[#050a14] shadow-[0_16px_48px_rgba(98,166,255,0.35)] transition hover:brightness-110"
                label="Order in app"
              />
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Browse more cakes
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

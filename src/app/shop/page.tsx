import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { OrderInAppButton } from "@/components/OrderInAppButton";
import { OrderOnWhatsAppButton } from "@/components/OrderOnWhatsAppButton";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  getCatalogSource,
  getShopSections,
  type ShopListingProduct,
} from "@/lib/products";
import { MEMBER_APP_URL, ORDERING_ENABLED } from "@/lib/appLinks";
import { breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { displayPriceLabel, pricesVisible } from "@/lib/priceDisplay";
import { SERVICE_AREAS } from "@/lib/siteConfig";

const SHOP_TITLE = "Cake Menu — Order Cakes in Johor Bahru & Iskandar Puteri";
const SHOP_DESCRIPTION =
  "Browse the full Moja Maison cake menu: burnt Basque cheesecakes, premium gateaux, loaves and cookie jars. Baked to order with pickup in Iskandar Puteri and delivery across Johor Bahru.";

export const metadata: Metadata = {
  title: SHOP_TITLE,
  description: SHOP_DESCRIPTION,
  alternates: { canonical: "/shop" },
  openGraph: {
    title: SHOP_TITLE,
    description: SHOP_DESCRIPTION,
    url: "/shop",
  },
};

function ProductCard({
  product,
  showPrices,
}: {
  product: ShopListingProduct;
  showPrices: boolean;
}) {
  const href = `/product/${product.slug}`;
  const priceLabel = displayPriceLabel(
    product.priceLabel ?? product.price,
    showPrices,
  );

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-900/10 bg-white/70 transition hover:bg-white">
      <Link href={href} className="relative block h-48">
        <Image
          src={product.imageSrc}
          alt={`${product.name} — handcrafted cake by Moja Maison`}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/0 to-white/0" />

        {product.badge ? (
          <div className="absolute left-4 top-4 rounded-full border border-slate-900/10 bg-white/75 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
            {product.badge}
          </div>
        ) : null}

        {product.soldOut ? (
          <div className="absolute right-4 top-4 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            Currently unavailable
          </div>
        ) : null}
      </Link>

      <div className="p-5">
        <Link href={href}>
          <h3 className="text-base font-semibold text-slate-900 transition group-hover:text-[#1a5f9e]">
            {product.name}
          </h3>
        </Link>
        {priceLabel ? (
          <div className="mt-1.5 text-sm font-semibold text-slate-900">
            {priceLabel}
          </div>
        ) : null}
        {product.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
            {product.description}
          </p>
        ) : null}

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={href}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
          >
            View details
          </Link>
          {!product.soldOut ? (
            <OrderInAppButton
              className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#62a6ff] to-[#57f0ff] px-4 py-2 text-sm font-semibold text-[#050a14] transition hover:brightness-110"
              label="Order in app"
            />
          ) : (
            <OrderOnWhatsAppButton
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#1f8f5f]/25 bg-[#eafaf1] px-4 py-2 text-sm font-semibold text-[#0f6b45] transition hover:bg-[#dcf5e8]"
              label="Ask us"
              productName={product.name}
              productPath={href}
            />
          )}
        </div>
      </div>
    </article>
  );
}

export const revalidate = 300;

export default async function ShopPage() {
  const [sections, catalogSource] = await Promise.all([
    getShopSections(),
    getCatalogSource(),
  ]);
  const showPrices = pricesVisible(catalogSource);

  const allProducts = sections.flatMap((section) => section.products);
  const structuredData = [
    webPageJsonLd({
      type: "CollectionPage",
      name: SHOP_TITLE,
      description: SHOP_DESCRIPTION,
      path: "/shop",
    }),
    itemListJsonLd(allProducts, { name: "Moja Maison cake menu", path: "/shop" }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Collection", path: "/shop" },
    ]),
  ];

  return (
    <div className="min-h-full">
      {structuredData.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Our cake collection
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {allProducts.length} cakes baked to order in {SERVICE_AREAS[0]},
              with pickup or delivery across {SERVICE_AREAS.slice(1, 4).join(", ")}.
              Choose your size and slot in the{" "}
              {ORDERING_ENABLED ? (
                <a
                  href={MEMBER_APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1a5f9e] hover:text-slate-900"
                >
                  Moja app
                </a>
              ) : (
                <span className="font-semibold text-slate-800">Moja app</span>
              )}
              , or message us on WhatsApp and we&apos;ll place it for you.
            </p>
            <div className="mt-4">
              <OrderOnWhatsAppButton label="Order on WhatsApp" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    {section.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.products.map((p) => (
                  <ProductCard
                    key={p.slug}
                    product={p}
                    showPrices={showPrices}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

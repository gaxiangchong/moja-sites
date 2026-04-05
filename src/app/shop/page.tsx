import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getShopSections, type ShopListingProduct } from "@/lib/products";

function ProductCard({ product }: { product: ShopListingProduct }) {
  const href = `/product/${product.slug}`;

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-900/10 bg-white/70 transition hover:bg-white">
      <div className="relative h-48">
        <Image
          src={product.imageSrc}
          alt={product.name}
          fill
          className="object-cover"
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
            Sold out
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
        {product.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
            {product.description}
          </p>
        ) : null}

        <div className="mt-3 text-sm font-semibold text-slate-900">{product.price}</div>

        <div className="mt-4 flex items-center gap-2">
          {product.soldOut ? (
            <span className="inline-flex flex-1 cursor-not-allowed items-center justify-center rounded-full bg-slate-900/5 px-4 py-2 text-sm font-semibold text-slate-400">
              Unavailable
            </span>
          ) : (
            <Link
              href={href}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-900/5 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-900/10"
            >
              Select options
            </Link>
          )}
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white"
            aria-label="Add to wishlist"
            title="Add to wishlist"
          >
            ♡
          </a>
        </div>

        {product.hasVariants ? (
          <div className="mt-2 text-xs text-slate-500">This product has multiple variants.</div>
        ) : null}
      </div>
    </article>
  );
}

export default function ShopPage() {
  const sections = getShopSections();

  return (
    <div className="min-h-full">
      <div className="border-b border-slate-900/10 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-2 text-center text-xs tracking-wide text-slate-700 sm:text-sm">
          ORDER BEFORE 1PM FOR SAME DAY / NEXT DAY PICK UP & DELIVERY{" "}
          <span className="text-slate-400">•</span>{" "}
          <span className="font-semibold text-slate-800">EXCEPT SUNDAY</span>
        </div>
      </div>

      <SiteHeader ctaHref="#premium-cake" ctaLabel="Browse" />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Shop</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Products, prices, photos, and descriptions are loaded from{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">
                config/products.catalog.json
              </code>
              . Edit that file and restart the dev server to update the storefront.
            </p>
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
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{section.description}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.products.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-900/10 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              © {new Date().getFullYear()} Moja Maison Sdn Bhd. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <a className="hover:text-slate-900" href="#">
                Privacy Policy
              </a>
              <a className="hover:text-slate-900" href="#">
                Terms of Service
              </a>
              <a className="hover:text-slate-900" href="#">
                Refund Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

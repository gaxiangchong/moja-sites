import Image from "next/image";
import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getShopSections, type ShopListingProduct } from "@/lib/products";
import { MEMBER_APP_URL, ORDERING_ENABLED } from "@/lib/appLinks";

function ProductCard({ product }: { product: ShopListingProduct }) {
  const href = `/product/${product.slug}`;

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-900/10 bg-white/70 transition hover:bg-white">
      <Link href={href} className="relative block h-48">
        <Image
          src={product.imageSrc}
          alt={product.name}
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
        {product.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
            {product.description}
          </p>
        ) : null}

        <div className="mt-4">
          <Link
            href={href}
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

export const revalidate = 300;

export default async function ShopPage() {
  const sections = await getShopSections();

  return (
    <div className="min-h-full">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Our collection
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Browse what we bake at Moja Maison. When you&apos;re ready to
              order, choose your size and pickup slot in the{" "}
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
              .
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
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    {section.description}
                  </p>
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

        <section className="mt-14 rounded-[2rem] border border-slate-900/10 bg-gradient-to-br from-[#f8fbff] via-white to-[#eef6ff] p-6 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1a5f9e]">
                Ready to order?
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Continue your order in the app
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                Explore the collection here, then continue in the app to choose your size, pickup slot, and delivery details.
              </p>
            </div>

            <a
              href={MEMBER_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#62a6ff] to-[#57f0ff] px-6 py-3 text-sm font-semibold text-[#050a14] shadow-[0_16px_44px_rgba(98,166,255,0.25)] transition hover:brightness-110"
            >
              Visit app
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

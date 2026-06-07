import Image from "next/image";
import Link from "next/link";
import type { ProductDetail } from "@/lib/productTypes";

export function RelatedProducts({
  products,
  currentSlug,
}: {
  products: ProductDetail[];
  currentSlug: string;
}) {
  const related = products
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            You may also like
          </p>
          <h2
            id="related-heading"
            className="font-display mt-2 text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl"
          >
            More from the collection
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-sm font-semibold text-[#1a5f9e] transition hover:text-slate-900"
        >
          View full collection →
        </Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((p) => (
          <Link
            key={p.slug}
            href={`/product/${p.slug}`}
            className="group overflow-hidden rounded-3xl border border-slate-900/10 bg-white/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              <Image
                src={p.images[0]?.src ?? "/images/demo/shop/display-case.jpg"}
                alt={p.images[0]?.alt ?? p.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                sizes="(min-width: 1024px) 360px, 50vw"
              />
            </div>
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {p.category}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900 transition group-hover:text-[#1a5f9e]">
                {p.name}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                {p.shortDescription ?? p.summary}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

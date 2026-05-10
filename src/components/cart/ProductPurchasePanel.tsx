"use client";

import { useMemo, useState } from "react";
import type { ProductVariant } from "@/lib/products";
import { useCart } from "./CartProvider";

type Props = {
  slug: string;
  name: string;
  /** Used when the product has no variants. */
  basePriceLabel: string;
  variants?: ProductVariant[];
  imageSrc?: string;
};

function parseRm(label: string | null | undefined): number {
  if (!label) return 0;
  const n = Number.parseFloat(label.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function ProductPurchasePanel({
  slug,
  name,
  basePriceLabel,
  variants,
  imageSrc,
}: Props) {
  const hasVariants = Boolean(variants?.length);
  const firstAvailableIdx = useMemo(
    () => (variants ? variants.findIndex((v) => v.available) : -1),
    [variants],
  );
  const [selectedIdx, setSelectedIdx] = useState(
    firstAvailableIdx >= 0 ? firstAvailableIdx : 0,
  );
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();

  const selected = hasVariants ? variants![selectedIdx] : null;
  const purchasable =
    !hasVariants || (selected !== null && selected.available && !!selected.price);

  const displayPrice = hasVariants
    ? selected?.available && selected.price
      ? selected.price
      : "Not available"
    : basePriceLabel;

  const cartUnitPrice = hasVariants
    ? selected?.available && selected.price
      ? parseRm(selected.price)
      : 0
    : parseRm(basePriceLabel);

  const cartSlug =
    hasVariants && selected
      ? `${slug}__${selected.label.toLowerCase().replace(/\s+/g, "-")}`
      : slug;
  const cartName = hasVariants && selected ? `${name} (${selected.label})` : name;

  return (
    <>
      {hasVariants ? (
        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <div className="text-sm font-semibold text-slate-900">Size</div>
            <div className="text-xs text-slate-500">
              Price updates with selection
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {variants!.map((v, i) => {
              const isSelected = i === selectedIdx;
              const baseClasses =
                "flex flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-3 text-sm transition";
              if (!v.available) {
                return (
                  <button
                    key={v.label}
                    type="button"
                    disabled
                    aria-disabled="true"
                    title="Currently not available"
                    className={`${baseClasses} cursor-not-allowed border-dashed border-slate-300 bg-slate-50 text-slate-400`}
                  >
                    <span className="font-semibold">{v.label}</span>
                    <span className="text-xs uppercase tracking-wide">
                      Not available
                    </span>
                  </button>
                );
              }
              return (
                <button
                  key={v.label}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedIdx(i)}
                  className={
                    isSelected
                      ? `${baseClasses} border-slate-900 bg-slate-900 text-white`
                      : `${baseClasses} border-slate-900/15 bg-white text-slate-800 hover:border-slate-900/30`
                  }
                >
                  <span className="font-semibold">{v.label}</span>
                  <span
                    className={
                      isSelected
                        ? "text-xs text-white/80"
                        : "text-xs text-slate-500"
                    }
                  >
                    {v.price}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-4 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{displayPrice}</span>
        {hasVariants && selected ? (
          <span className="ml-2 text-slate-500">· {selected.label}</span>
        ) : null}
      </div>

      <div className="mt-5 flex items-center gap-3">
        {purchasable ? (
          <button
            type="button"
            onClick={() => {
              addItem(
                {
                  slug: cartSlug,
                  name: cartName,
                  priceLabel: displayPrice,
                  unitPriceRm: cartUnitPrice,
                  imageSrc,
                },
                1,
              );
              setAdded(true);
              window.setTimeout(() => setAdded(false), 900);
            }}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#62a6ff] to-[#57f0ff] px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_12px_32px_rgba(98,166,255,0.22)] transition hover:brightness-110"
          >
            {added ? "Added" : "Add to cart"}
          </button>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex flex-1 cursor-not-allowed items-center justify-center rounded-full bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-500"
          >
            Currently not available
          </button>
        )}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
          aria-label="Add to wishlist"
          title="Add to wishlist"
        >
          ♡
        </button>
      </div>
    </>
  );
}

import type { ProductDetail, ProductVariant } from "./productTypes";

/**
 * Prices are already synced to the storefront: they arrive from the member
 * catalog API (`basePriceCents` / `variants[].priceCents`) and are snapshotted
 * into `config/products.catalog.json` by `npm run catalog:pull`. This flag only
 * controls whether the storefront *renders* them.
 *
 * Set NEXT_PUBLIC_SHOW_PRICES=false to hide prices site-wide again. Note that
 * Google only shows price/availability rich results for prices that are
 * visible on the page, so hiding them also removes those search features.
 */
export const SHOW_PRICES =
  process.env.NEXT_PUBLIC_SHOW_PRICES?.trim().toLowerCase() !== "false";

/**
 * Allow prices to render even when the catalog came from the fallback
 * snapshot instead of the admin API. Off in production by design: a snapshot
 * price can be one the admin has already changed, and a wrong price is a
 * promise to the customer and a mismatch against the Offer structured data.
 * Development defaults to on so `CATALOG_SOURCE=local` is still workable.
 */
const ALLOW_SNAPSHOT_PRICES =
  process.env.NEXT_PUBLIC_ALLOW_SNAPSHOT_PRICES?.trim().toLowerCase() ===
  "true" || process.env.NODE_ENV === "development";

/**
 * Whether prices may be shown for a catalog that came from `source`.
 * Pages pass the result down instead of reading SHOW_PRICES directly, so a
 * silent fallback to the snapshot degrades the page (no price) rather than
 * publishing a stale one.
 */
export function pricesVisible(
  source: "member-api" | "snapshot",
): boolean {
  if (!SHOW_PRICES) return false;
  return source === "member-api" || ALLOW_SNAPSHOT_PRICES;
}

export const PRICE_CURRENCY = "MYR";

/** "RM149.00" / "RM 1,208" -> 149 / 1208. Returns null for unusable input. */
export function parsePriceValue(label: string | null | undefined): number | null {
  if (!label) return null;
  const digits = label.replace(/[^0-9.]/g, "");
  if (!digits) return null;
  const value = Number.parseFloat(digits);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function formatRm(value: number): string {
  return `RM${value.toFixed(2)}`;
}

/**
 * Every purchasable price for a cake, ascending: variant prices when the cake
 * has sizes, otherwise its base price. A slice at RM22 alongside an 8" at
 * RM208 is why we never assume the base price is the lowest one.
 */
export function priceValuesFrom(
  basePrice: string | null | undefined,
  variants?: Pick<ProductVariant, "price" | "available">[] | null,
): number[] {
  const variantPrices = (variants ?? [])
    .filter((v) => v.available)
    .map((v) => parsePriceValue(v.price))
    .filter((v): v is number => v !== null);

  if (variantPrices.length > 0) {
    return [...variantPrices].sort((a, b) => a - b);
  }

  const base = parsePriceValue(basePrice);
  return base === null ? [] : [base];
}

export function availablePriceValues(product: ProductDetail): number[] {
  return priceValuesFrom(product.price, product.variants);
}

export function lowestPriceValue(product: ProductDetail): number | null {
  return availablePriceValues(product)[0] ?? null;
}

/**
 * Listing/detail label: "From RM22.00" when a cake has several sizes, a plain
 * price when it has one. Returns null when the price is unknown so callers can
 * skip the element entirely rather than render "RM0.00".
 *
 * This deliberately ignores SHOW_PRICES — the catalog mappers call it to
 * precompute a label, and the components decide whether to render it.
 */
export function priceLabelFrom(
  basePrice: string | null | undefined,
  variants?: Pick<ProductVariant, "price" | "available">[] | null,
): string | undefined {
  const prices = priceValuesFrom(basePrice, variants);
  if (prices.length === 0) return undefined;
  const lowest = prices[0]!;
  const highest = prices[prices.length - 1]!;
  return highest > lowest ? `From ${formatRm(lowest)}` : formatRm(lowest);
}

/**
 * The label a component should actually render. `enabled` comes from
 * `pricesVisible(source)` so the caller controls both the env flag and the
 * freshness check in one place.
 */
export function displayPriceLabel(
  label: string | null | undefined,
  enabled: boolean,
): string | null {
  if (!enabled) return null;
  return label?.trim() || null;
}

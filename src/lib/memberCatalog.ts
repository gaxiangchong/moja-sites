export type MemberCatalogVariant = {
  id: string;
  label: string;
  priceCents: number;
  available?: boolean;
  priceDisplay?: string | null;
};

export type MemberCatalogProduct = {
  id: string;
  category: "whole_cakes" | "cake_slices" | "drinks" | "specials";
  categoryLabel?: string;
  name: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  images?: Array<{ src: string; alt: string }>;
  basePriceCents: number;
  priceDisplay?: string;
  variants?: MemberCatalogVariant[];
  badge?: string;
  soldOut?: boolean;
  isActive: boolean;
  sortOrder: number;
};

import { fetchWithTimeout } from "./fetchWithTimeout";
import { resolveProductImageSrc } from "./assetUrl";

export type MemberCatalogLayout = {
  homeFeaturedProductIds: string[];
  shopSections: Array<{
    id: string;
    title: string;
    description: string;
    productIds: string[];
  }>;
};

function memberApiBase(): string {
  const base =
    process.env.MEMBER_API_BASE_URL?.trim() ||
    (process.env.NODE_ENV === "development" ? "http://127.0.0.1:3000" : "");
  if (!base) {
    throw new Error(
      "MEMBER_API_BASE_URL is not set. Add MEMBER_API_BASE_URL=http://127.0.0.1:3000 to .env.local (see checkout-handoff.env.example).",
    );
  }
  return base.replace(/\/$/, "");
}

/** How long Next.js Data Cache keeps catalog API responses (seconds). */
export function catalogFetchRevalidate(): number {
  const raw = process.env.CATALOG_CACHE_SECONDS?.trim();
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 300;
}

export type MemberCatalogBundle = {
  products: MemberCatalogProduct[];
  layout: MemberCatalogLayout;
};

async function fetchJson<T>(path: string): Promise<T> {
  const base = memberApiBase();
  const url = `${base}${path}`;
  let res: Response;
  try {
    res = await fetchWithTimeout(url, {
      next: { revalidate: catalogFetchRevalidate() },
    });
  } catch (cause) {
    const hint =
      base.includes(":5193")
        ? " MEMBER_API_BASE_URL looks like the member web app (5193). Use the Nest API (PORT from moja-member-app .env)."
        : "";
    throw new Error(
      `Could not reach member API at ${url}.${hint} Is moja-member-app running? (npm run start:dev)`,
      { cause },
    );
  }
  if (!res.ok) {
    throw new Error(
      `Member catalog request failed (${res.status}) for ${url}. Check MEMBER_API_BASE_URL points at the Nest API, not the member web app.`,
    );
  }
  return (await res.json()) as T;
}

export async function fetchMemberCatalogProducts(): Promise<MemberCatalogProduct[]> {
  const data = await fetchJson<MemberCatalogProduct[]>("/shop/catalog/products");
  return Array.isArray(data) ? data : [];
}

export async function fetchMemberCatalogLayout(): Promise<MemberCatalogLayout> {
  const data = await fetchJson<MemberCatalogLayout>("/shop/catalog/layout");
  return {
    homeFeaturedProductIds: Array.isArray(data.homeFeaturedProductIds)
      ? data.homeFeaturedProductIds
      : [],
    shopSections: Array.isArray(data.shopSections) ? data.shopSections : [],
  };
}

/** Preferred: one HTTP request for products + layout (faster on slow hosts). */
export async function fetchMemberCatalogBundle(): Promise<MemberCatalogBundle> {
  try {
    const data = await fetchJson<MemberCatalogBundle>("/shop/catalog/bundle");
    const layout = data.layout ?? ({} as MemberCatalogLayout);
    return {
      products: Array.isArray(data.products) ? data.products : [],
      layout: {
        homeFeaturedProductIds: Array.isArray(layout.homeFeaturedProductIds)
          ? layout.homeFeaturedProductIds
          : [],
        shopSections: Array.isArray(layout.shopSections)
          ? layout.shopSections
          : [],
      },
    };
  } catch {
    const [products, layout] = await Promise.all([
      fetchMemberCatalogProducts(),
      fetchMemberCatalogLayout(),
    ]);
    return { products, layout };
  }
}

export function formatRmFromCents(cents: number): string {
  return `RM${(cents / 100).toFixed(2)}`;
}

export function productPriceLabel(product: MemberCatalogProduct): string {
  if (product.priceDisplay?.trim()) return product.priceDisplay.trim();
  return formatRmFromCents(product.basePriceCents);
}

export function variantPriceLabel(variant: MemberCatalogVariant): string | null {
  if (variant.priceDisplay?.trim()) return variant.priceDisplay.trim();
  if (variant.available === false || variant.priceCents <= 0) return null;
  return formatRmFromCents(variant.priceCents);
}

export function productHasVariants(product: MemberCatalogProduct): boolean {
  return Boolean(product.variants?.length);
}

export function productIsSoldOut(product: MemberCatalogProduct): boolean {
  if (product.soldOut) return true;
  if (!product.variants?.length) return false;
  return !product.variants.some((v) => v.available !== false && variantPriceLabel(v));
}

export function toStorefrontVariants(
  product: MemberCatalogProduct,
): Array<{ label: string; price: string | null; available: boolean }> | undefined {
  if (!product.variants?.length) return undefined;
  return product.variants.map((v) => ({
    label: v.label,
    price: variantPriceLabel(v),
    available: v.available !== false && Boolean(variantPriceLabel(v)),
  }));
}

export function productImages(
  product: MemberCatalogProduct,
): Array<{ src: string; alt: string }> {
  if (product.images?.length) {
    return product.images.map((img) => ({
      src: resolveProductImageSrc(img.src),
      alt: img.alt,
    }));
  }
  if (product.imageUrl?.trim()) {
    return [{ src: resolveProductImageSrc(product.imageUrl), alt: product.name }];
  }
  return [];
}

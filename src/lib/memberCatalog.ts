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
    (process.env.NODE_ENV === "development" ? "http://127.0.0.1:3153" : "");
  if (!base) {
    throw new Error(
      "MEMBER_API_BASE_URL is not set. Add MEMBER_API_BASE_URL=http://localhost:3153 to .env.local (see checkout-handoff.env.example).",
    );
  }
  return base.replace(/\/$/, "");
}

async function fetchJson<T>(path: string): Promise<T> {
  const base = memberApiBase();
  const url = `${base}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      next: { revalidate: 60 },
    });
  } catch (cause) {
    const hint =
      base.includes(":5193")
        ? " MEMBER_API_BASE_URL looks like the member web app (5193). Use the Nest API (3153)."
        : "";
    throw new Error(
      `Could not reach member API at ${url}.${hint} Is moja-member-app running? (npm run start:dev, default port 3153)`,
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
  if (product.images?.length) return product.images;
  if (product.imageUrl?.trim()) {
    return [{ src: product.imageUrl, alt: product.name }];
  }
  return [];
}

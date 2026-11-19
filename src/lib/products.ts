import { cache } from "react";
import { unstable_cache } from "next/cache";
import { priceLabelFrom } from "./priceDisplay";
import {
  getLocalCatalogProducts,
  getLocalHomeFeaturedProducts,
  getLocalShopSections,
} from "./localCatalog";
import {
  catalogFetchRevalidate,
  fetchMemberCatalogBundle,
  productHasVariants,
  productImages,
  productIsSoldOut,
  productPriceLabel,
  toStorefrontVariants,
  type MemberCatalogProduct,
} from "./memberCatalog";

export type {
  ProductCategory,
  ProductDetail,
  ProductVariant,
  ShopListingProduct,
  ShopSection,
} from "./productTypes";

import type { ProductCategory, ProductDetail, ShopListingProduct, ShopSection } from "./productTypes";

type CatalogBundle = {
  products: ProductDetail[];
  shopSections: ShopSection[];
  homeFeatured: ProductDetail[];
};

function assertCategory(c: string | undefined): ProductCategory {
  if (
    c === "Premium Cake" ||
    c === "Collection Cake" ||
    c === "Festive Cake" ||
    c === "Box Edition"
  ) {
    return c;
  }
  return "Premium Cake";
}

function toProductDetail(p: MemberCatalogProduct): ProductDetail {
  const variants = toStorefrontVariants(p);
  return {
    slug: p.id,
    name: p.name,
    price: productPriceLabel(p),
    badge: p.badge,
    category: assertCategory(p.categoryLabel),
    images: productImages(p),
    summary: p.description || p.shortDescription,
    shortDescription: p.shortDescription,
    soldOut: productIsSoldOut(p),
    hasVariants: productHasVariants(p),
    variants,
  };
}

function toShopListing(p: MemberCatalogProduct): ShopListingProduct {
  const images = productImages(p);
  const variants = toStorefrontVariants(p);
  return {
    slug: p.id,
    name: p.name,
    description: (p.shortDescription || p.description).trim(),
    badge: p.badge,
    price: productPriceLabel(p),
    priceLabel: priceLabelFrom(productPriceLabel(p), variants),
    imageSrc: images[0]?.src ?? "/images/demo/shop/display-case.jpg",
    soldOut: productIsSoldOut(p),
    hasVariants: productHasVariants(p),
  };
}

function memberBundleFromApi(
  memberProducts: MemberCatalogProduct[],
  layout: Awaited<ReturnType<typeof fetchMemberCatalogBundle>>["layout"],
): CatalogBundle {
  const active = memberProducts.filter((p) => p.isActive !== false);
  const byId = new Map(active.map((p) => [p.id, p]));
  const products = active.map(toProductDetail);
  const shopSections = layout.shopSections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    products: section.productIds
      .map((id) => byId.get(id))
      .filter((p): p is MemberCatalogProduct => Boolean(p))
      .map(toShopListing),
  }));
  const homeFeatured = layout.homeFeaturedProductIds
    .map((id) => byId.get(id))
    .filter((p): p is MemberCatalogProduct => Boolean(p))
    .map(toProductDetail);
  return { products, shopSections, homeFeatured };
}

function localCatalogBundle(): CatalogBundle {
  return {
    products: getLocalCatalogProducts(),
    shopSections: getLocalShopSections(),
    homeFeatured: getLocalHomeFeaturedProducts(),
  };
}

/**
 * Option B: member-app catalog API is the primary source when configured.
 * Set CATALOG_SOURCE=local only to force the JSON fallback file.
 */
function shouldTryMemberCatalog(): boolean {
  const source =
    process.env.CATALOG_SOURCE?.trim().toLowerCase() ?? "member";
  if (source === "local") return false;

  const base = process.env.MEMBER_API_BASE_URL?.trim();
  if (!base) {
    return process.env.NODE_ENV === "development";
  }

  if (process.env.NODE_ENV === "production") {
    try {
      const host = new URL(base).hostname;
      if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
        console.warn(
          "[catalog] MEMBER_API_BASE_URL is localhost in production; using products.catalog.json fallback.",
        );
        return false;
      }
    } catch {
      console.warn(
        "[catalog] MEMBER_API_BASE_URL is invalid; using products.catalog.json fallback.",
      );
      return false;
    }
  }

  return true;
}

async function loadCatalogBundle(): Promise<CatalogBundle> {
  if (!shouldTryMemberCatalog()) {
    return localCatalogBundle();
  }
  try {
    const { products: memberProducts, layout } =
      await fetchMemberCatalogBundle();
    return memberBundleFromApi(memberProducts, layout);
  } catch (err) {
    console.warn(
      "[catalog] Member API unavailable; using config/products.catalog.json.",
      err instanceof Error ? err.message : err,
    );
    return localCatalogBundle();
  }
}

/** Persists across requests on the server (Hostinger) for CATALOG_CACHE_SECONDS. */
const getCatalogBundleCached = unstable_cache(
  loadCatalogBundle,
  [
    "moja-catalog-bundle",
    process.env.CATALOG_SOURCE?.trim().toLowerCase() ?? "member",
    process.env.MEMBER_API_BASE_URL?.trim().replace(/\/$/, "") ?? "default",
  ],
  { revalidate: catalogFetchRevalidate() },
);

/** Per-request dedupe within a single render. */
const getCatalogBundle = cache(getCatalogBundleCached);

export const getCatalogProducts = cache(async (): Promise<ProductDetail[]> => {
  const { products } = await getCatalogBundle();
  return products;
});

export const getProductsBySlug = cache(async (): Promise<Map<string, ProductDetail>> => {
  const products = await getCatalogProducts();
  return new Map(products.map((p) => [p.slug, p]));
});

export const getShopSections = cache(async (): Promise<ShopSection[]> => {
  const { shopSections } = await getCatalogBundle();
  return shopSections;
});

export const getHomeFeaturedProducts = cache(async (): Promise<ProductDetail[]> => {
  const { homeFeatured } = await getCatalogBundle();
  return homeFeatured;
});

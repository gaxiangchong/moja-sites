import { cache } from "react";
import catalogFile from "../../config/products.catalog.json";
import type { ProductCategory, ProductDetail, ShopListingProduct, ShopSection } from "./productTypes";

type CatalogJson = {
  homeFeaturedSlugs: string[];
  shopSections: {
    id: string;
    title: string;
    description: string;
    productSlugs: string[];
  }[];
  products: ProductDetail[];
};

const catalog = catalogFile as CatalogJson;

function assertCategory(c: string): c is ProductCategory {
  return (
    c === "Premium Cake" ||
    c === "Collection Cake" ||
    c === "Festive Cake" ||
    c === "Box Edition"
  );
}

function normalizeProduct(p: ProductDetail): ProductDetail {
  if (!assertCategory(p.category)) {
    throw new Error(
      `Invalid category for product "${p.slug}": ${JSON.stringify(p.category)}`,
    );
  }
  if (!p.images?.length) {
    throw new Error(`Product "${p.slug}" needs at least one image`);
  }
  if (p.variants?.length) {
    for (const v of p.variants) {
      if (!v.label?.trim()) {
        throw new Error(`Product "${p.slug}" has a variant without a label`);
      }
      if (v.available && !v.price?.trim()) {
        throw new Error(
          `Product "${p.slug}" variant "${v.label}" is marked available but has no price`,
        );
      }
    }
  }
  if (p.hasVariants === undefined && p.variants?.length) {
    return { ...p, hasVariants: true };
  }
  return p;
}

const products = catalog.products.map(normalizeProduct);
const productsBySlug = new Map(products.map((p) => [p.slug, p]));

function toShopListing(p: ProductDetail): ShopListingProduct {
  return {
    slug: p.slug,
    name: p.name,
    description: (p.shortDescription ?? p.summary).trim(),
    badge: p.badge,
    price: p.price,
    imageSrc: p.images[0]!.src,
    soldOut: p.soldOut,
    hasVariants: p.hasVariants,
  };
}

export const getLocalCatalogProducts = cache((): ProductDetail[] => products);

export const getLocalProductsBySlug = cache(
  (): Map<string, ProductDetail> => productsBySlug,
);

export const getLocalShopSections = cache((): ShopSection[] =>
  catalog.shopSections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    products: section.productSlugs
      .map((slug) => productsBySlug.get(slug))
      .filter((p): p is ProductDetail => Boolean(p))
      .map(toShopListing),
  })),
);

export const getLocalHomeFeaturedProducts = cache((): ProductDetail[] =>
  catalog.homeFeaturedSlugs
    .map((slug) => productsBySlug.get(slug))
    .filter((p): p is ProductDetail => Boolean(p)),
);

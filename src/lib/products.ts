import { cache } from "react";
import catalogFile from "../../config/products.catalog.json";

export type ProductCategory =
  | "Premium Cake"
  | "Collection Cake"
  | "Festive Cake"
  | "Box Edition";

export type ProductDetail = {
  slug: string;
  name: string;
  price: string;
  badge?: string;
  category: ProductCategory;
  images: { src: string; alt: string }[];
  summary: string;
  /** Shorter blurb for shop listing cards; falls back to `summary` if omitted */
  shortDescription?: string;
  highlights?: { title: string; body: string }[];
  availabilityNote?: string;
  size?: string[];
  allergens?: string[];
  handling?: string[];
  storage?: string[];
  /** Shop grid: show sold-out state */
  soldOut?: boolean;
  /** Shop grid: hint for variant picker */
  hasVariants?: boolean;
};

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
  return p;
}

export const products: ProductDetail[] = catalog.products.map(normalizeProduct);

export const productsBySlug = new Map(products.map((p) => [p.slug, p]));

export type ShopListingProduct = {
  slug: string;
  name: string;
  description: string;
  badge?: string;
  price: string;
  imageSrc: string;
  soldOut?: boolean;
  hasVariants?: boolean;
};

export type ShopSection = {
  id: string;
  title: string;
  description: string;
  products: ShopListingProduct[];
};

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

export const getShopSections = cache((): ShopSection[] =>
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

export const getHomeFeaturedProducts = cache((): ProductDetail[] =>
  catalog.homeFeaturedSlugs
    .map((slug) => productsBySlug.get(slug))
    .filter((p): p is ProductDetail => Boolean(p)),
);

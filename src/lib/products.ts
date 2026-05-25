import { cache } from "react";
import {
  fetchMemberCatalogLayout,
  fetchMemberCatalogProducts,
  productHasVariants,
  productImages,
  productIsSoldOut,
  productPriceLabel,
  toStorefrontVariants,
  type MemberCatalogProduct,
} from "./memberCatalog";

export type ProductCategory =
  | "Premium Cake"
  | "Collection Cake"
  | "Festive Cake"
  | "Box Edition";

export type ProductVariant = {
  label: string;
  price: string | null;
  available: boolean;
};

export type ProductDetail = {
  slug: string;
  name: string;
  price: string;
  badge?: string;
  category: ProductCategory;
  images: { src: string; alt: string }[];
  summary: string;
  shortDescription?: string;
  highlights?: { title: string; body: string }[];
  availabilityNote?: string;
  size?: string[];
  allergens?: string[];
  handling?: string[];
  storage?: string[];
  soldOut?: boolean;
  hasVariants?: boolean;
  variants?: ProductVariant[];
};

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
  return {
    slug: p.id,
    name: p.name,
    description: (p.shortDescription || p.description).trim(),
    badge: p.badge,
    price: productPriceLabel(p),
    imageSrc: images[0]?.src ?? "/images/demo/shop/display-case.jpg",
    soldOut: productIsSoldOut(p),
    hasVariants: productHasVariants(p),
  };
}

export const getCatalogProducts = cache(async (): Promise<ProductDetail[]> => {
  const items = await fetchMemberCatalogProducts();
  return items.map(toProductDetail);
});

export const getProductsBySlug = cache(async (): Promise<Map<string, ProductDetail>> => {
  const products = await getCatalogProducts();
  return new Map(products.map((p) => [p.slug, p]));
});

export const getShopSections = cache(async (): Promise<ShopSection[]> => {
  const [layout, products] = await Promise.all([
    fetchMemberCatalogLayout(),
    fetchMemberCatalogProducts(),
  ]);
  const byId = new Map(products.map((p) => [p.id, p]));
  return layout.shopSections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    products: section.productIds
      .map((id) => byId.get(id))
      .filter((p): p is MemberCatalogProduct => Boolean(p))
      .map(toShopListing),
  }));
});

export const getHomeFeaturedProducts = cache(async (): Promise<ProductDetail[]> => {
  const [layout, products] = await Promise.all([
    fetchMemberCatalogLayout(),
    fetchMemberCatalogProducts(),
  ]);
  const byId = new Map(products.map((p) => [p.id, p]));
  return layout.homeFeaturedProductIds
    .map((id) => byId.get(id))
    .filter((p): p is MemberCatalogProduct => Boolean(p))
    .map(toProductDetail);
});

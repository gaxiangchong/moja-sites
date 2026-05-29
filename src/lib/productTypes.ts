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

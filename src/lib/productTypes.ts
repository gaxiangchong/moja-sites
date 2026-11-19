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
  /**
   * Pre-rendered "From RM22.00" style label covering every available variant,
   * computed by the catalog mappers so listing cards don't have to carry the
   * full variant list. Undefined when no usable price exists.
   */
  priceLabel?: string;
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

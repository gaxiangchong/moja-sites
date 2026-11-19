import { cache } from "react";
import { unstable_cache } from "next/cache";
import { priceLabelFrom } from "./priceDisplay";
import { applyCatalogSections, getCatalogSectionsConfig } from "./catalogSections";
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

/**
 * Where the catalog in hand actually came from.
 *
 * "member-api" = live from the admin (api.mojamaison.com), so prices are
 * current. "snapshot" = config/products.catalog.json, which is only as fresh
 * as the last `npm run catalog:pull` and can therefore show a price the admin
 * has since changed.
 */
export type CatalogSource = "member-api" | "snapshot";

type CatalogBundle = {
  products: ProductDetail[];
  shopSections: ShopSection[];
  homeFeatured: ProductDetail[];
  source: CatalogSource;
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
  return { products, shopSections, homeFeatured, source: "member-api" };
}

function localCatalogBundle(): CatalogBundle {
  return {
    products: getLocalCatalogProducts(),
    shopSections: getLocalShopSections(),
    homeFeatured: getLocalHomeFeaturedProducts(),
    source: "snapshot",
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

function detailToShopListing(p: ProductDetail): ShopListingProduct {
  return {
    slug: p.slug,
    name: p.name,
    description: (p.shortDescription ?? p.summary ?? "").trim(),
    badge: p.badge,
    price: p.price,
    imageSrc: p.images[0]?.src ?? "/images/demo/shop/display-case.jpg",
    soldOut: p.soldOut,
    hasVariants: p.hasVariants,
  };
}

/**
 * Puts active products the shop layout never placed back on the shelf.
 *
 * The member app's layout is a curation list of product ids per section, and
 * a product only reaches the storefront if an admin added it to one. Creating
 * a product does not do that, so a perfectly sellable cake (its own page
 * built, priced, in stock) could be missing from /shop and the homepage with
 * nothing to show anyone it was wrong. `isActive` is the real "hide this"
 * switch, so anything still active belongs somewhere: we file it under the
 * section matching its category, or start that category's section if the
 * layout has none.
 */
function placeUnlistedProducts(bundle: CatalogBundle): CatalogBundle {
  const placed = new Set(
    bundle.shopSections.flatMap((s) => s.products.map((p) => p.slug)),
  );
  const unlisted = bundle.products.filter((p) => !placed.has(p.slug));
  if (unlisted.length === 0) return bundle;

  const shopSections = bundle.shopSections.map((s) => ({
    ...s,
    products: [...s.products],
  }));

  for (const product of unlisted) {
    let section = shopSections.find((s) => s.title === product.category);
    if (!section) {
      section = {
        id: product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: product.category,
        description: "",
        products: [],
      };
      shopSections.push(section);
    }
    section.products.push(detailToShopListing(product));
  }

  console.warn(
    `[catalog] ${unlisted.length} active product(s) are missing from the shop layout; ` +
      `showing them under their category. Add them in the member app ` +
      `(Admin → Shop Layout) to control where they appear: ` +
      unlisted.map((p) => p.slug).join(", "),
  );

  return { ...bundle, shopSections };
}

/**
 * Everything between the raw catalog and the storefront: put back products
 * the layout forgot, then regroup sections the way the website presents them
 * (config/catalog-sections.json). Applied to both the API and the snapshot so
 * the two can never disagree.
 */
function finalizeBundle(bundle: CatalogBundle): CatalogBundle {
  const placed = placeUnlistedProducts(bundle);
  return {
    ...placed,
    shopSections: applyCatalogSections(
      placed.shopSections,
      getCatalogSectionsConfig(),
    ),
  };
}

async function loadCatalogBundle(): Promise<CatalogBundle> {
  if (!shouldTryMemberCatalog()) {
    return finalizeBundle(localCatalogBundle());
  }
  try {
    const { products: memberProducts, layout } =
      await fetchMemberCatalogBundle();
    return finalizeBundle(memberBundleFromApi(memberProducts, layout));
  } catch (err) {
    console.warn(
      "[catalog] Member API unavailable; using config/products.catalog.json.",
      err instanceof Error ? err.message : err,
    );
    return finalizeBundle(localCatalogBundle());
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

/**
 * Lets pages decide whether the prices they are about to render are live from
 * the admin or came from the fallback snapshot.
 */
export const getCatalogSource = cache(async (): Promise<CatalogSource> => {
  const { source } = await getCatalogBundle();
  return source;
});

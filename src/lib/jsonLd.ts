import { getCompanyConfig } from "./companyConfig";
import {
  PRICE_CURRENCY,
  SHOW_PRICES,
  availablePriceValues,
} from "./priceDisplay";
import type { ProductDetail, ShopListingProduct } from "./productTypes";
import {
  BUSINESS_ADDRESS,
  OPENING_HOURS,
  SERVICE_AREAS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_URL,
  SOCIAL_PROFILES,
  absoluteUrl,
} from "./siteConfig";

/**
 * Stable @id values so every graph node on every page refers to the same
 * entities. Without these, each page would describe a *different* anonymous
 * bakery and the signals would not consolidate.
 */
export const ORGANIZATION_ID = `${SITE_URL}/#bakery`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Phone in E.164, which is what schema.org consumers expect. */
function telephone(): string {
  const raw = getCompanyConfig().contactPhone;
  const digits = raw.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : `+${digits}`;
}

/**
 * Bakery is a subtype of LocalBusiness + Organization, so one node covers the
 * brand entity, local-pack eligibility and the knowledge-panel style facts
 * answer engines quote ("where is it", "when is it open", "what does it sell").
 */
export function bakeryJsonLd() {
  const company = getCompanyConfig();

  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    legalName: company.legalName,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    image: absoluteUrl(SITE_OG_IMAGE),
    logo: absoluteUrl("/images/moja-logo.png"),
    telephone: telephone(),
    email: company.contactEmail,
    priceRange: "RM22–RM250",
    currenciesAccepted: PRICE_CURRENCY,
    paymentAccepted: "Online payment, Bank transfer",
    servesCuisine: "Cakes, Cheesecakes, Pastries, Cookies",
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_ADDRESS.streetAddress,
      addressLocality: BUSINESS_ADDRESS.addressLocality,
      addressRegion: BUSINESS_ADDRESS.addressRegion,
      postalCode: BUSINESS_ADDRESS.postalCode,
      addressCountry: BUSINESS_ADDRESS.addressCountry,
    },
    areaServed: SERVICE_AREAS.map((area) => ({
      "@type": "City",
      name: area,
    })),
    openingHoursSpecification: OPENING_HOURS.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    })),
    sameAs: [...SOCIAL_PROFILES],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: telephone(),
        email: company.contactEmail,
        areaServed: "MY",
        availableLanguage: ["en", "ms", "zh"],
      },
    ],
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "en-MY",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * Product + Offer. The offer block is what makes price and availability
 * eligible to appear directly in search results, so it is only emitted when
 * prices are actually visible on the page — advertising a price in structured
 * data that a shopper cannot see is a rich-results policy violation.
 */
export function productJsonLd(product: ProductDetail) {
  const url = absoluteUrl(`/product/${product.slug}`);
  const prices = availablePriceValues(product);
  const availability = product.soldOut
    ? "https://schema.org/SoldOut"
    : "https://schema.org/InStock";

  const offers = (() => {
    if (!SHOW_PRICES || prices.length === 0) return undefined;

    const lowest = prices[0]!;
    const highest = prices[prices.length - 1]!;
    const shared = {
      priceCurrency: PRICE_CURRENCY,
      availability,
      url,
      seller: { "@id": ORGANIZATION_ID },
    };

    // Several sizes -> AggregateOffer carrying the full range; one price ->
    // a single Offer, which is what Google prefers for a lone SKU.
    if (highest > lowest) {
      return {
        "@type": "AggregateOffer",
        lowPrice: lowest.toFixed(2),
        highPrice: highest.toFixed(2),
        offerCount: prices.length,
        ...shared,
      };
    }

    return {
      "@type": "Offer",
      price: lowest.toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      ...shared,
    };
  })();

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.shortDescription?.trim() || product.summary,
    // Product images may be member-API absolute URLs or site-relative paths;
    // structured data requires absolute URLs either way.
    image: product.images.map((img) => absoluteUrl(img.src)),
    url,
    category: product.category,
    brand: { "@type": "Brand", name: SITE_NAME },
    // Sizes are expressed through the AggregateOffer price range rather than
    // `hasVariant`: Google's variant support expects per-variant offers and
    // SKUs, which the catalog does not carry, and half-filled variant nodes
    // only produce validation warnings.
    ...(product.variants?.length
      ? {
          size: product.variants
            .filter((v) => v.available)
            .map((v) => v.label),
        }
      : {}),
    ...(offers ? { offers } : {}),
  };
}

/** Collection pages: tells crawlers what the list contains and in what order. */
export function itemListJsonLd(
  products: ShopListingProduct[],
  { name, path }: { name: string; path: string },
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: absoluteUrl(path),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/product/${product.slug}`),
      name: product.name,
    })),
  };
}

/**
 * FAQPage is the highest-leverage AEO markup on this site: it hands assistants
 * ready-made question/answer pairs about delivery, halal status, storage and
 * cancellations — exactly the questions buyers ask before ordering a cake.
 */
export function faqPageJsonLd(
  items: { q: string; a: string }[],
  page: { name: string; description: string; path: string },
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: page.name,
    description: page.description,
    url: absoluteUrl(page.path),
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    inLanguage: "en-MY",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function webPageJsonLd({
  type = "WebPage",
  name,
  description,
  path,
}: {
  type?: string;
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    inLanguage: "en-MY",
  };
}

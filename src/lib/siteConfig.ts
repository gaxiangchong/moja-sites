/**
 * Single source of truth for SEO/AEO-facing site facts: canonical origin,
 * brand naming, service area, and opening hours.
 *
 * Canonical origin drives `metadataBase`, canonical tags, sitemap.xml,
 * robots.txt and every absolute URL inside JSON-LD, so it must be the exact
 * host visitors land on (no trailing slash, no "www" unless that is the real
 * host). Override per environment with NEXT_PUBLIC_SITE_URL.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
  "https://mojamaison.com";

export const SITE_NAME = "Moja Maison";

/**
 * Appears as the `<title>` suffix and in OG tags. Keep the city in it: most
 * cake searches in this market are local ("birthday cake johor bahru"), and
 * the title tag is still the strongest on-page signal for those queries.
 */
export const SITE_TAGLINE =
  "Handcrafted Cakes in Johor Bahru & Iskandar Puteri";

export const SITE_DESCRIPTION =
  "Moja Maison bakes less-sweet, texture-forward cakes to order in Iskandar Puteri — burnt Basque cheesecakes, gateaux and cookie jars with pickup or delivery across Johor Bahru.";

/** Default social-share image (1200x630-ish crop of the hero photo). */
export const SITE_OG_IMAGE = "/images/hero-chef-burnt-cheesecake.png";

export const SITE_LOCALE = "en_MY";

/**
 * Primary delivery/pickup areas — rendered in page copy and emitted as
 * schema.org `areaServed`.
 *
 * ACTION REQUIRED: these are the townships around the Iskandar Puteri kitchen,
 * not a confirmed delivery list. Trim or extend this array to match where you
 * actually deliver — the names appear verbatim to customers and crawlers, so
 * an area listed here is effectively a promise.
 */
export const SERVICE_AREAS = [
  "Iskandar Puteri",
  "Johor Bahru",
  "Nusajaya",
  "Bukit Indah",
  "Gelang Patah",
  "Medini",
] as const;

/**
 * Postal address broken out for schema.org PostalAddress. `config/company.json`
 * keeps the same address as one display string for the footer and legal pages;
 * these parts exist because structured data needs the fields separately.
 */
export const BUSINESS_ADDRESS = {
  streetAddress: "43, Jalan Eko Botani 2F, Taman Eko Botani 2",
  addressLocality: "Iskandar Puteri",
  addressRegion: "Johor",
  postalCode: "79100",
  addressCountry: "MY",
} as const;

/**
 * Mirrors the hours shown on the homepage. Tuesday is closed, so it is simply
 * absent — schema.org treats a missing day as closed.
 */
export const OPENING_HOURS = [
  { days: ["Monday"], opens: "11:00", closes: "20:00" },
  {
    days: ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "10:00",
    closes: "18:00",
  },
] as const;

export const SOCIAL_PROFILES = [
  "https://www.facebook.com/mojamaison",
  "https://www.instagram.com/mojamaison",
] as const;

/** Resolve a site-relative path to an absolute, canonical URL. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

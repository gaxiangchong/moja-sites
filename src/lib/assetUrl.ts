/**
 * Product images live in moja-member-app and are served from the Member API
 * (e.g. https://api.mojamaison.com/images/products/foo.png). The catalog only
 * stores relative paths like "/images/products/foo.png"; we prefix them with
 * the API origin so both apps render from the same source.
 *
 * Non-product assets (logo, demo images, etc.) stay local to moja-sites.
 */
export const MEMBER_ASSET_BASE =
  process.env.NEXT_PUBLIC_MEMBER_ASSET_BASE?.trim().replace(/\/$/, "") ||
  "https://api.mojamaison.com";

/** Only product images are migrated to the member app; keep the rest local. */
export function resolveProductImageSrc(src: string | null | undefined): string {
  const value = src?.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || /^data:/i.test(value)) return value;
  if (value.startsWith("/images/products/")) {
    return `${MEMBER_ASSET_BASE}${value}`;
  }
  return value;
}

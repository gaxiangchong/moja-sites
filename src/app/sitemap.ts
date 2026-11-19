import type { MetadataRoute } from "next";
import { getCatalogProducts } from "@/lib/products";
import { absoluteUrl } from "@/lib/siteConfig";

/** Rebuild the sitemap on the same cadence as the catalog cache. */
export const revalidate = 300;

type StaticEntry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

const STATIC_PAGES: StaticEntry[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/refund-policy", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // A failed catalog load must not take the whole sitemap down with it — the
  // static pages are still worth serving to crawlers.
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await getCatalogProducts();
    productEntries = products
      // Sold-out cakes stay indexable (the page is still useful and can come
      // back in stock) but rank below the evergreen pages.
      .map((product) => ({
        url: absoluteUrl(`/product/${product.slug}`),
        lastModified,
        changeFrequency: "weekly" as const,
        priority: product.soldOut ? 0.5 : 0.8,
      }));
  } catch (err) {
    console.warn(
      "[sitemap] Could not load catalog products; serving static pages only.",
      err instanceof Error ? err.message : err,
    );
  }

  return [...staticEntries, ...productEntries];
}

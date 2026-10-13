import { cache } from "react";
import configFile from "../../config/catalog-sections.json";
import type { ShopListingProduct, ShopSection } from "./productTypes";

/**
 * Splits one catalog section into several website sections — today the
 * member app's single "Premium Cake" becomes "Cheesecake" and "Cream Cake".
 *
 * This is presentation only. The catalog and its layout belong to the member
 * app (see config/PRODUCTS-CONFIG.txt), and `npm run catalog:pull` overwrites
 * the snapshot, so the regrouping lives here instead and is shared by every
 * page that lists products.
 */
export type CatalogGroup = {
  id: string;
  title: string;
  description: string;
  /** Product id, or a product name; see resolveGroupItems. */
  items: string[];
};

export type CatalogSectionsConfig = {
  /** Catalog section these groups stand in for, e.g. "premium-cake". */
  replacesSectionId: string;
  groups: CatalogGroup[];
};

type Unknown = Record<string, unknown>;

/** Loose match so "Citron Blossom Basque" finds "citron blossom basque". */
export function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export const getCatalogSectionsConfig = cache((): CatalogSectionsConfig => {
  const raw = (configFile ?? {}) as Unknown;
  const groups = Array.isArray(raw.groups) ? raw.groups : [];

  return {
    replacesSectionId:
      typeof raw.replacesSectionId === "string" ? raw.replacesSectionId.trim() : "",
    groups: groups
      .filter((g): g is Unknown => Boolean(g) && typeof g === "object")
      .map((g) => {
        const title = typeof g.title === "string" ? g.title.trim() : "";
        const items = Array.isArray(g.items)
          ? g.items.filter((i): i is string => typeof i === "string" && Boolean(i.trim()))
          : [];
        return {
          id:
            typeof g.id === "string" && g.id.trim()
              ? g.id.trim()
              : normalizeName(title),
          title,
          description: typeof g.description === "string" ? g.description.trim() : "",
          items: items.map((i) => i.trim()),
        };
      })
      .filter((g) => g.title && g.items.length > 0),
  };
});

/**
 * Looks each configured item up among the products the catalog actually has.
 * Returns the matches in configured order, plus the entries that matched
 * nothing — those are products the kitchen sells that the catalog has not
 * caught up with, which the shop cannot render (no photo or price) but the
 * B2B menu still lists by name.
 */
export function resolveGroupItems<T extends { slug: string; name: string }>(
  items: string[],
  bySlug: Map<string, T>,
  byName: Map<string, T>,
  claimed?: Set<string>,
): { matched: T[]; unmatched: string[] } {
  const matched: T[] = [];
  const unmatched: string[] = [];

  for (const entry of items) {
    const product = bySlug.get(entry) ?? byName.get(normalizeName(entry));

    if (product) {
      if (claimed?.has(product.slug)) continue;
      claimed?.add(product.slug);
      matched.push(product);
      continue;
    }

    // A value with a space is a product name; one without is almost certainly
    // a mistyped id, which we drop rather than print on the page.
    if (/\s/.test(entry)) unmatched.push(entry);
  }

  return { matched, unmatched };
}

/**
 * Rebuilds the shop sections with the configured groups in place of the
 * section they replace. Products a group claims are pulled out of whatever
 * section they were in, and anything left over stays under its original
 * heading so a newly added product can never silently disappear.
 */
export function applyCatalogSections(
  sections: ShopSection[],
  config: CatalogSectionsConfig,
): ShopSection[] {
  if (config.groups.length === 0) return sections;

  const all = sections.flatMap((s) => s.products);
  const bySlug = new Map<string, ShopListingProduct>(all.map((p) => [p.slug, p]));
  const byName = new Map<string, ShopListingProduct>(
    all.map((p) => [normalizeName(p.name), p]),
  );

  const claimed = new Set<string>();
  const grouped: ShopSection[] = config.groups.map((group) => ({
    id: group.id,
    title: group.title,
    description: group.description,
    products: resolveGroupItems(group.items, bySlug, byName, claimed).matched,
  }));

  const result: ShopSection[] = [];
  let replaced = false;

  for (const section of sections) {
    if (section.id === config.replacesSectionId) {
      replaced = true;
      result.push(...grouped.filter((g) => g.products.length > 0));
    }

    const remaining = section.products.filter((p) => !claimed.has(p.slug));
    if (remaining.length === 0) continue;

    // A group may reuse the id of the section it replaces (keeping
    // "premium-cake" as one tier among the new ones). Leftovers then belong
    // in that group rather than in a second section with the same heading.
    const sameId = grouped.find((g) => g.id === section.id);
    if (sameId) {
      sameId.products.push(...remaining);
      if (!result.includes(sameId) && sameId.products.length > 0) {
        result.push(sameId);
      }
      continue;
    }

    result.push({ ...section, products: remaining });
  }

  if (!replaced) {
    result.unshift(...grouped.filter((g) => g.products.length > 0));
  }

  return result;
}

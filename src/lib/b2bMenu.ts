import {
  getCatalogSectionsConfig,
  normalizeName,
  resolveGroupItems,
} from "./catalogSections";
import type { ShopListingProduct, ShopSection } from "./productTypes";

export type B2bMenuItem = {
  key: string;
  name: string;
  badge?: string;
  /** Absent when the product is not in the catalog, so the row has no link. */
  slug?: string;
};

export type B2bMenuGroup = {
  id: string;
  title: string;
  description: string;
  items: B2bMenuItem[];
};

function toItem(product: ShopListingProduct): B2bMenuItem {
  return {
    key: product.slug,
    name: product.name,
    badge: product.badge,
    slug: product.slug,
  };
}

/**
 * Builds the menu under "The range".
 *
 * The sections themselves (Cheesecake, Cream Cake, …) already come grouped
 * from the catalog layer, so all this adds is the trade-only part: a product
 * the kitchen sells that the catalog has not caught up with is still listed,
 * by name and in its configured position, with no link. The shop cannot show
 * those — there is no photo or price for a card — but a trade buyer only
 * needs the name and the enquiry link.
 */
export function buildB2bMenu(sections: ShopSection[]): B2bMenuGroup[] {
  const config = getCatalogSectionsConfig();

  return sections.map((section) => {
    const group = config.groups.find((g) => g.id === section.id);
    if (!group) {
      return {
        id: section.id,
        title: section.title,
        description: section.description,
        items: section.products.map(toItem),
      };
    }

    // Rebuild from the configured order so unmatched names land in the
    // position they were written in, not appended at the end.
    const bySlug = new Map(section.products.map((p) => [p.slug, p]));
    const byName = new Map(section.products.map((p) => [normalizeName(p.name), p]));
    const listed = new Set<string>();
    const items: B2bMenuItem[] = [];

    for (const entry of group.items) {
      const { matched, unmatched } = resolveGroupItems([entry], bySlug, byName);
      if (matched[0]) {
        listed.add(matched[0].slug);
        items.push(toItem(matched[0]));
      } else if (unmatched[0]) {
        items.push({ key: `unlisted:${unmatched[0]}`, name: unmatched[0] });
      }
    }

    // Anything in the section the config does not name still gets listed.
    for (const product of section.products) {
      if (!listed.has(product.slug)) items.push(toItem(product));
    }

    return {
      id: section.id,
      title: section.title,
      description: section.description,
      items,
    };
  });
}

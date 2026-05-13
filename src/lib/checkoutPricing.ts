import type { ProductDetail, ProductVariant } from "@/lib/products";
import { productsBySlug } from "@/lib/products";

export type CheckoutCartLineInput = {
  slug: string;
  qty: number;
};

export type PricedOrderLine = {
  productSlug: string;
  productName: string;
  variantLabel: string | null;
  quantity: number;
  unitPriceCents: number;
  taxCents: number;
  lineTotalCents: number;
};

function parseRmToCents(label: string | null | undefined): number | null {
  if (!label?.trim()) return null;
  const n = Number.parseFloat(label.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

function variantKeyFromLabel(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

function findVariantForCartToken(
  product: ProductDetail,
  token: string,
): ProductVariant | null {
  if (!product.variants?.length) return null;
  const v = product.variants.find(
    (x) => variantKeyFromLabel(x.label) === token,
  );
  return v ?? null;
}

export function priceCheckoutLines(
  lines: CheckoutCartLineInput[],
): { ok: true; priced: PricedOrderLine[] } | { ok: false; error: string } {
  const priced: PricedOrderLine[] = [];

  for (const line of lines) {
    if (!Number.isFinite(line.qty) || line.qty < 1 || line.qty > 99) {
      return { ok: false, error: "Invalid quantity" };
    }

    const sep = line.slug.indexOf("__");
    const baseSlug = sep === -1 ? line.slug : line.slug.slice(0, sep);
    const variantToken = sep === -1 ? null : line.slug.slice(sep + 2);

    const product = productsBySlug.get(baseSlug);
    if (!product || product.soldOut) {
      return { ok: false, error: `Unknown or unavailable product: ${baseSlug}` };
    }

    let unitCents: number | null = null;
    let variantLabel: string | null = null;

    if (variantToken) {
      const v = findVariantForCartToken(product, variantToken);
      if (!v || !v.available || !v.price) {
        return {
          ok: false,
          error: `Invalid variant for ${product.name}`,
        };
      }
      unitCents = parseRmToCents(v.price);
      variantLabel = v.label;
    } else {
      if (product.variants?.length) {
        return {
          ok: false,
          error: `Product ${product.name} requires a size selection`,
        };
      }
      unitCents = parseRmToCents(product.price);
    }

    if (unitCents === null || unitCents < 1) {
      return { ok: false, error: `Could not price: ${product.name}` };
    }

    const taxCents = 0;
    const lineTotalCents = unitCents * line.qty + taxCents;
    priced.push({
      productSlug: baseSlug,
      productName: product.name,
      variantLabel,
      quantity: line.qty,
      unitPriceCents: unitCents,
      taxCents,
      lineTotalCents,
    });
  }

  return { ok: true, priced };
}

export function orderTotalsFromLines(priced: PricedOrderLine[]): {
  subtotalCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
} {
  const subtotalCents = priced.reduce(
    (s, l) => s + l.unitPriceCents * l.quantity,
    0,
  );
  const taxCents = priced.reduce((s, l) => s + l.taxCents, 0);
  const discountCents = 0;
  const totalCents = subtotalCents + taxCents - discountCents;
  return { subtotalCents, taxCents, discountCents, totalCents };
}

import type { CartItem } from "@/components/cart/CartProvider";

export type MemberCartHandoffLine = {
  productId: string;
  name: string;
  qty: number;
  unitPriceCents: number;
  variantLabel?: string | null;
  imageUrl?: string | null;
};

function variantFromCartName(name: string): string | null {
  const match = name.match(/\(([^)]+)\)\s*$/);
  return match?.[1]?.trim() || null;
}

function absoluteImageUrl(imageSrc: string | undefined, origin: string): string | null {
  if (!imageSrc?.trim()) return null;
  if (/^https?:\/\//i.test(imageSrc)) return imageSrc;
  const base = origin.replace(/\/$/, "");
  return `${base}${imageSrc.startsWith("/") ? "" : "/"}${imageSrc}`;
}

export function cartItemsToHandoffLines(
  items: CartItem[],
  origin: string,
): MemberCartHandoffLine[] {
  return items.map((item) => ({
    productId: item.slug,
    name: item.name,
    qty: item.qty,
    unitPriceCents: Math.round(item.unitPriceRm * 100),
    variantLabel: variantFromCartName(item.name),
    imageUrl: absoluteImageUrl(item.imageSrc, origin),
  }));
}

export async function requestMemberCheckoutRedirect(
  items: CartItem[],
  sourceUrl: string,
): Promise<string> {
  const res = await fetch("/api/checkout/handoff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lines: cartItemsToHandoffLines(items, window.location.origin),
      sourceUrl,
    }),
  });
  const data = (await res.json()) as {
    redirectUrl?: string;
    message?: string;
  };
  if (!res.ok || !data.redirectUrl) {
    throw new Error(data.message || "Could not start member checkout");
  }
  return data.redirectUrl;
}

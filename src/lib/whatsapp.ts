import { getContactConfig } from "./contactConfig";
import { SITE_NAME, absoluteUrl } from "./siteConfig";

/**
 * WhatsApp is the default ordering channel for this market, and it converts
 * the visitors who will not install an app just to ask about a cake. The
 * number comes from config/contact.json so there is one place to change it.
 */
export function whatsappNumber(): string | null {
  const channel = getContactConfig().channels.find((c) => c.key === "whatsapp");
  if (!channel) return null;
  const digits = channel.href.replace(/^https?:\/\/(?:wa\.me|api\.whatsapp\.com)\/(?:send\?phone=)?/i, "")
    .replace(/[^\d]/g, "");
  return digits || null;
}

/**
 * Deep link with the enquiry pre-written, so the customer only has to hit
 * send. Including the product name and URL also means the order lands with
 * enough context to quote immediately — fewer round trips, higher close rate.
 */
export function whatsappOrderUrl(options?: {
  productName?: string;
  productPath?: string;
}): string | null {
  const number = whatsappNumber();
  if (!number) return null;

  const message = options?.productName
    ? `Hi ${SITE_NAME}! I'd like to order the ${options.productName}. Could you share the available sizes, price and delivery slots?${
        options.productPath ? `\n${absoluteUrl(options.productPath)}` : ""
      }`
    : `Hi ${SITE_NAME}! I'd like to place a cake order. Could you help me with the available cakes and delivery slots?`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

import { cache } from "react";
import { getCompanyConfig, isPresent } from "./companyConfig";
import { getContactConfig } from "./contactConfig";

/**
 * B2B leads arrive over WhatsApp or email rather than the member app, so the
 * CTAs are plain deep links with the enquiry prefilled. Numbers/addresses are
 * reused from config/contact.json (with config/company.json as the email
 * fallback) so there is still only one place to edit them.
 */
export type B2bContactTargets = {
  /** Bare wa.me link, no message attached. */
  whatsappUrl: string | null;
  emailAddress: string | null;
};

export const getB2bContactTargets = cache((): B2bContactTargets => {
  const { channels } = getContactConfig();

  const whatsapp = channels.find((c) => c.key === "whatsapp");
  const emailChannel = channels.find((c) => c.key === "email");

  const emailFromContact = emailChannel?.href.replace(/^mailto:/i, "").trim();
  const emailFromCompany = getCompanyConfig().contactEmail;

  const emailAddress =
    emailFromContact ||
    (isPresent(emailFromCompany) ? emailFromCompany : "") ||
    null;

  return {
    whatsappUrl: whatsapp?.href || null,
    emailAddress,
  };
});

/**
 * Attaches a prefilled message to a wa.me link.
 *
 * Built by hand rather than with URLSearchParams: that encodes spaces as "+",
 * which some WhatsApp clients show literally in the message box.
 * encodeURIComponent gives %20 (and %0A for the line breaks), which they all
 * read correctly.
 */
export function whatsAppHref(url: string | null, message: string): string | null {
  if (!url) return null;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}text=${encodeURIComponent(message)}`;
}

export function mailtoHref(
  address: string | null,
  subject: string,
  body: string,
): string | null {
  if (!address) return null;
  const query = new URLSearchParams({ subject, body }).toString();
  // URLSearchParams encodes spaces as "+", which mail clients show literally
  // in the subject line; %20 is read correctly by all of them.
  return `mailto:${address}?${query.replace(/\+/g, "%20")}`;
}

export function productEnquiryMessage(template: string, product: string): string {
  return template.includes("{product}")
    ? template.replace("{product}", product)
    : `${template} ${product}`.trim();
}

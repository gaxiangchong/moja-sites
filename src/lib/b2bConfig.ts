import { cache } from "react";
import b2bFile from "../../config/b2b.json";

export type B2bFeature = { title: string; body: string };
export type B2bSegment = B2bFeature & {
  examples: string[];
  /** Empty string renders the card without a photo. */
  image: string;
  imageAlt: string;
  /** CSS object-position, for photos whose subject is not centred. */
  imagePosition: string;
};
export type B2bStep = B2bFeature;
/** `icon` is a key in the FactIcon registry; unknown keys fall back to a dot. */
export type B2bFact = { icon: string; label: string; value: string };
export type B2bFaq = { q: string; a: string };

export type B2bEnquiryCopy = {
  whatsappMessage: string;
  emailSubject: string;
  emailBody: string;
  /** "{product}" is replaced with the product name. */
  productMessageTemplate: string;
  priceListMessage: string;
  responseNote: string;
};

export type B2bConfig = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  heroImage: string;
  heroImageAlt: string;
  heroHighlights: string[];
  segmentsTitle: string;
  segmentsIntro: string;
  segments: B2bSegment[];
  potentialTitle: string;
  potentialIntro: string;
  potential: B2bFeature[];
  productsTitle: string;
  productsIntro: string;
  productsCtaLabel: string;
  factsTitle: string;
  factsNote: string;
  facts: B2bFact[];
  processTitle: string;
  processIntro: string;
  process: B2bStep[];
  faqTitle: string;
  faqs: B2bFaq[];
  ctaTitle: string;
  ctaBody: string;
  ctaChecklist: string[];
  enquiry: B2bEnquiryCopy;
};

type Unknown = Record<string, unknown>;

function str(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

/** Keeps newlines (enquiry templates rely on them) but drops padding. */
function multiline(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.replace(/^\n+|\n+$/g, "") : fallback;
}

function strList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && Boolean(v.trim())).map((v) => v.trim());
}

/**
 * Drops any entry missing its required text instead of rendering an empty
 * card, so a half-finished edit to b2b.json degrades quietly.
 */
function objList<T>(value: unknown, map: (raw: Unknown) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((raw): raw is Unknown => Boolean(raw) && typeof raw === "object")
    .map(map)
    .filter((entry): entry is T => entry !== null);
}

function toFeature(raw: Unknown): B2bFeature | null {
  const title = str(raw.title, "");
  const body = str(raw.body, "");
  return title && body ? { title, body } : null;
}

const DEFAULT_ENQUIRY: B2bEnquiryCopy = {
  whatsappMessage: "Hi Moja Maison, I would like to enquire about wholesale / corporate orders.",
  emailSubject: "Wholesale / corporate enquiry",
  emailBody: "Hi Moja Maison,\n\nWe would like to enquire about wholesale / corporate orders.",
  productMessageTemplate: "Hi Moja Maison, I would like wholesale pricing for: {product}.",
  priceListMessage: "Hi Moja Maison, please send me your wholesale price list.",
  responseNote: "",
};

function toEnquiry(raw: unknown): B2bEnquiryCopy {
  const e = (raw && typeof raw === "object" ? raw : {}) as Unknown;
  return {
    whatsappMessage: multiline(e.whatsappMessage, DEFAULT_ENQUIRY.whatsappMessage),
    emailSubject: str(e.emailSubject, DEFAULT_ENQUIRY.emailSubject),
    emailBody: multiline(e.emailBody, DEFAULT_ENQUIRY.emailBody),
    productMessageTemplate: str(e.productMessageTemplate, DEFAULT_ENQUIRY.productMessageTemplate),
    priceListMessage: str(e.priceListMessage, DEFAULT_ENQUIRY.priceListMessage),
    responseNote: str(e.responseNote, DEFAULT_ENQUIRY.responseNote),
  };
}

export const getB2bConfig = cache((): B2bConfig => {
  const raw = b2bFile as Unknown;

  return {
    eyebrow: str(raw.eyebrow, "For business"),
    headline: str(raw.headline, "Wholesale & corporate orders"),
    subheadline: str(
      raw.subheadline,
      "We supply cafés, hotels, offices and retail partners with small-batch cakes and cookie jars.",
    ),
    heroImage: str(raw.heroImage, "/images/hero-chef-burnt-cheesecake_2.png"),
    heroImageAlt: str(raw.heroImageAlt, "Moja Maison pastry kitchen"),
    heroHighlights: strList(raw.heroHighlights),

    segmentsTitle: str(raw.segmentsTitle, "Who we supply"),
    segmentsIntro: str(raw.segmentsIntro, ""),
    segments: objList(raw.segments, (entry) => {
      const feature = toFeature(entry);
      if (!feature) return null;
      const image = str(entry.image, "");
      return {
        ...feature,
        examples: strList(entry.examples),
        image,
        // Falling back to the title would read the photo out twice to a
        // screen reader, so an unlabelled photo stays decorative instead.
        imageAlt: image ? str(entry.imageAlt, "") : "",
        imagePosition: str(entry.imagePosition, "center"),
      };
    }),

    potentialTitle: str(raw.potentialTitle, "Why these products work commercially"),
    potentialIntro: str(raw.potentialIntro, ""),
    potential: objList(raw.potential, toFeature),

    productsTitle: str(raw.productsTitle, "The range"),
    productsIntro: str(raw.productsIntro, ""),
    productsCtaLabel: str(raw.productsCtaLabel, "Request the wholesale price list"),

    factsTitle: str(raw.factsTitle, "At a glance"),
    factsNote: str(raw.factsNote, ""),
    facts: objList(raw.facts, (entry) => {
      const label = str(entry.label, "");
      const value = str(entry.value, "");
      return label && value ? { icon: str(entry.icon, ""), label, value } : null;
    }),

    processTitle: str(raw.processTitle, "How it works"),
    processIntro: str(raw.processIntro, ""),
    process: objList(raw.process, toFeature),

    faqTitle: str(raw.faqTitle, "Questions businesses ask"),
    faqs: objList(raw.faqs, (entry) => {
      const q = str(entry.q, "");
      const a = str(entry.a, "");
      return q && a ? { q, a } : null;
    }),

    ctaTitle: str(raw.ctaTitle, "Tell us what you need"),
    ctaBody: str(raw.ctaBody, ""),
    ctaChecklist: strList(raw.ctaChecklist),

    enquiry: toEnquiry(raw.enquiry),
  };
});

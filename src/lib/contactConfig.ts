import { cache } from "react";
import contactFile from "../../config/contact.json";

export type ContactChannelKey = "whatsapp" | "email" | "facebook" | "instagram";

type ChannelFile = {
  enabled?: boolean;
  label?: string;
  hint?: string;
  url?: string;
  address?: string;
};

export type ContactFileJson = {
  pageTitle?: string;
  pageIntro?: string;
  whatsapp?: ChannelFile;
  email?: ChannelFile;
  facebook?: ChannelFile;
  instagram?: ChannelFile;
};

export type ContactChannel = {
  key: ContactChannelKey;
  label: string;
  hint?: string;
  href: string;
  enabled: boolean;
};

export type ContactConfig = {
  pageTitle: string;
  pageIntro: string;
  channels: ContactChannel[];
};

function toMailto(address: string) {
  const t = address.trim();
  if (!t) return "";
  if (t.toLowerCase().startsWith("mailto:")) return t;
  return `mailto:${t}`;
}

function normalizeChannel(
  key: ContactChannelKey,
  raw: ChannelFile | undefined,
  defaults: { label: string; hint: string },
): ContactChannel {
  const wantsEnabled = raw?.enabled !== false;
  const label = (raw?.label ?? defaults.label).trim() || defaults.label;
  const hint = (raw?.hint ?? defaults.hint).trim() || defaults.hint;

  if (key === "email") {
    const addr = raw?.address?.trim() ?? "";
    const href = addr ? toMailto(addr) : "";
    return {
      key,
      label,
      hint,
      href,
      enabled: wantsEnabled && Boolean(addr),
    };
  }

  const href = raw?.url?.trim() ?? "";
  const hasUrl = Boolean(href && href !== "#");
  return {
    key,
    label,
    hint,
    href,
    enabled: wantsEnabled && hasUrl,
  };
}

const DEFAULT_INTRO =
  "Pick the channel you prefer — we’re happy to help with orders, delivery questions, or custom requests.";

function buildConfig(parsed: ContactFileJson): ContactConfig {
  const channels: ContactChannel[] = [
    normalizeChannel("whatsapp", parsed.whatsapp, {
      label: "WhatsApp",
      hint: "Message us for quick replies",
    }),
    normalizeChannel("email", parsed.email, {
      label: "Email",
      hint: "We reply within 1–2 business days",
    }),
    normalizeChannel("facebook", parsed.facebook, {
      label: "Facebook",
      hint: "Visit our Facebook page",
    }),
    normalizeChannel("instagram", parsed.instagram, {
      label: "Instagram",
      hint: "Follow us for updates",
    }),
  ];

  return {
    pageTitle: (parsed.pageTitle ?? "Contact us").trim() || "Contact us",
    pageIntro: (parsed.pageIntro ?? DEFAULT_INTRO).trim() || DEFAULT_INTRO,
    channels: channels.filter((c) => c.enabled),
  };
}

export const getContactConfig = cache((): ContactConfig =>
  buildConfig(contactFile as ContactFileJson),
);

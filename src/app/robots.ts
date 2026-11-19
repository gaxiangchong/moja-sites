import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/siteConfig";

/**
 * `/cart` and `/checkout` are server redirects into the member app, and
 * `/sso/consume` + `/api/*` are machine endpoints — none of them should be
 * crawled or indexed.
 *
 * Answer engines (ChatGPT, Perplexity, Claude, Gemini grounding) are allowed
 * explicitly: AEO traffic depends on those crawlers being able to read the
 * product and FAQ pages, and an explicit Allow makes that intent unambiguous
 * even if a wildcard rule is tightened later.
 */
const DISALLOW = ["/api/", "/cart", "/checkout", "/sso/"];

const ANSWER_ENGINE_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "Amazonbot",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: ANSWER_ENGINE_BOTS,
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}

import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { bakeryJsonLd, webSiteJsonLd } from "@/lib/jsonLd";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/siteConfig";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  // Required for relative canonical/OG URLs to resolve, and the base for
  // every per-page `alternates.canonical`.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    // Page titles render as "Matcha Marmalade Gateau | Moja Maison".
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  keywords: [
    "cake delivery Johor Bahru",
    "birthday cake Iskandar Puteri",
    "burnt Basque cheesecake Johor",
    "halal-friendly cake JB",
    "cake shop Bukit Indah",
    "Moja Maison",
  ],
  category: "food",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_MY",
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "A pastry chef finishing a burnt Basque cheesecake at Moja Maison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let Google use full-size image previews and untruncated snippets —
      // both help cake queries, which are highly visual.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-MY"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        {/* Product images and the catalog API live on another origin; warming
            the connection shaves latency off the largest image on the page. */}
        <link rel="preconnect" href="https://api.mojamaison.com" />
        <link rel="dns-prefetch" href="https://api.mojamaison.com" />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Site-wide brand graph: emitted once here so every page (including
            product pages) resolves the same Bakery/WebSite entities. */}
        <JsonLd data={bakeryJsonLd()} />
        <JsonLd data={webSiteJsonLd()} />
        {children}
      </body>
    </html>
  );
}

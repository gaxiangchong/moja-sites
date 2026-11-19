import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { OrderOnWhatsAppButton } from "@/components/OrderOnWhatsAppButton";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonLd";

const FAQ_TITLE = "Cake Ordering FAQ — Delivery, Halal, Storage & Changes";
const FAQ_DESCRIPTION =
  "Answers to the questions customers ask before ordering: same-day delivery in Johor Bahru, coverage areas, halal-friendly ingredients, allergens, cake storage, and how to change or cancel an order.";

export const metadata: Metadata = {
  title: FAQ_TITLE,
  description: FAQ_DESCRIPTION,
  alternates: { canonical: "/faq" },
  openGraph: {
    title: FAQ_TITLE,
    description: FAQ_DESCRIPTION,
    url: "/faq",
  },
};

type FaqItem = {
  q: string;
  a: string;
};

type FaqSection = {
  title: string;
  items: FaqItem[];
};

const sections: FaqSection[] = [
  {
    title: "General",
    items: [
      {
        q: "How does your delivery service work and what is the collection hours? Do you accept walk-ins?",
        a: "Yes — we accept walk-ins during our operating hours. For pre-orders, you can choose pickup/collection within our available time window. If you’re unsure what’s available for walk-in, feel free to contact us before coming over.",
      },
      {
        q: "What payment method do you accept?",
        a: "We accept online payments via our payment gateway. If you need online banking or alternative payment methods, please contact us for details.",
      },
      {
        q: "What if I want to cancel/change my order?",
        a: "Please inform us as early as possible (ideally at least 48 hours before your collection/delivery date). We’ll help you reschedule or advise on the available options.",
      },
      {
        q: "Can I request wordings on the cake?",
        a: "We can support simple message options depending on the cake. If you need a specific style, contact us before ordering so we can confirm what’s possible.",
      },
      {
        q: "Do you sell slice cake?",
        a: "Yes — we sell slice cakes (subject to daily availability).",
      },
      {
        q: "Can I order a cake and have same day / next day delivery?",
        a: "Yes. Selected items may be available for same-day / next-day delivery. For same-day orders, please place your order before 1PM (Mon–Sat).",
      },
    ],
  },
  {
    title: "Delivery / Pickup",
    items: [
      {
        q: "Do you have delivery service and which location do you cover?",
        a: "Yes, we offer delivery within selected coverage areas. Delivery charges depend on distance and driver availability.",
      },
      {
        q: "Who will be delivering my cake?",
        a: "We may use third-party delivery partners to ensure safe handling and reliable delivery.",
      },
      {
        q: "What time can I receive my cakes when using delivery service?",
        a: "Delivery is arranged by time slots. If you need a specific time, we’ll try our best to accommodate, but exact delivery time cannot be guaranteed due to traffic and driver routes.",
      },
      {
        q: "Am I able to change delivery time, address and recipient info after I placed my order?",
        a: "Yes — please contact us as early as possible. Late changes may be subject to driver availability and additional charges.",
      },
      {
        q: "What if the receiver is not present at the delivery time?",
        a: "You may request redelivery to a different address (subject to availability and extra charges). If the cake is returned, additional return fees may apply and product quality may be affected depending on temperature and time.",
      },
      {
        q: "What if the cake that I received turns up damaged?",
        a: "Please check upon receiving. If there is damage at delivery, inform the delivery person immediately and contact us so we can assist with next steps.",
      },
    ],
  },
  {
    title: "Handling & Storage",
    items: [
      {
        q: "How do I handle my cake if I do self-collection?",
        a: "Keep the cake box on a flat surface, away from direct sunlight, and avoid sudden braking/turns. For chilled cakes, keep them cool and limit time outside refrigeration.",
      },
      {
        q: "How long can cakes last at room temperature?",
        a: "Chilled cakes should be kept cool and are best served after returning to the refrigerator. For best quality, we recommend consuming within 1–2 days and avoiding freezing unless stated otherwise.",
      },
    ],
  },
  {
    title: "Dietary / Allergy",
    items: [
      {
        q: "Is your cake halal-certified?",
        a: "We use Muslim-friendly ingredients and follow careful handling practices. If you need confirmation for a specific item, please contact us and we’ll advise based on the current menu.",
      },
      {
        q: "Is your cake suitable for vegetarian, egg-free, gluten free, diabetes or keto diet?",
        a: "Most products may contain eggs, dairy, and sugar. We offer selected options for gluten-free or low-carb preferences. Please check individual product details.",
      },
      {
        q: "Is your cake sweet?",
        a: "Our cakes are designed to be balanced and generally on the less-sweet side.",
      },
      {
        q: "Do you have any nut-free/dairy-free options?",
        a: "Some items may be nut-free, but our kitchen may handle nuts and dairy. If you have allergies, please contact us before ordering so we can advise.",
      },
    ],
  },
];

function FaqCard({ q, a }: FaqItem) {
  return (
    <details className="group rounded-2xl border border-slate-900/10 bg-white/70 p-4 open:bg-white">
      <summary className="cursor-pointer list-none select-none">
        <div className="flex items-start justify-between gap-4">
          <div className="text-sm font-semibold text-slate-900">{q}</div>
          <div className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/5 text-slate-700 transition group-open:rotate-45">
            +
          </div>
        </div>
      </summary>
      <div className="mt-3 text-sm leading-6 text-slate-600">{a}</div>
    </details>
  );
}

export default function FaqPage() {
  // Every visible Q&A is mirrored into FAQPage markup, so search engines and
  // AI assistants answer from our own wording instead of guessing.
  const allItems = sections.flatMap((section) => section.items);
  const structuredData = [
    faqPageJsonLd(allItems, {
      name: FAQ_TITLE,
      description: FAQ_DESCRIPTION,
      path: "/faq",
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "FAQ", path: "/faq" },
    ]),
  ];

  return (
    <div className="min-h-full">
      {structuredData.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-6 sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Ordering, delivery &amp; cake care questions
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Quick answers about ordering, delivery across Johor Bahru, halal
            handling, allergens and keeping your cake at its best.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  {section.title}
                </h2>
              </div>
              <div className="mt-4 grid gap-3">
                {section.items.map((item) => (
                  <FaqCard key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-slate-900/10 bg-white/60 p-6">
          <div className="text-sm font-semibold text-slate-900">
            Need assistance?
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Message us and we’ll help you pick the right cake for the occasion.
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <OrderOnWhatsAppButton label="WhatsApp our team" />
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-slate-900/5 px-5 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-900/10"
            >
              All contact channels
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-white/70 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Browse the shop
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}


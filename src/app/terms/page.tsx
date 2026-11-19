import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getCompanyConfig, isPresent } from "@/lib/companyConfig";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that govern your use of mojamaison.com and any orders placed with Moja Maison.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const company = getCompanyConfig();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader ctaHref="/shop" ctaLabel="Shop & order" />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
          <p className="text-sm font-medium text-[#1a5f9e]">Legal</p>
          <h1 className="font-display mt-2 text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
            Terms &amp; Conditions
          </h1>
          {company.termsLastUpdated ? (
            <p className="mt-3 text-sm text-slate-500">
              Last updated: {company.termsLastUpdated}
            </p>
          ) : null}

          <div className="mt-8 space-y-8 text-[15px] leading-7 text-slate-700">
            <p>
              These terms govern your use of mojamaison.com (the
              &quot;Site&quot;) and any orders you place with{" "}
              {company.legalName} (&quot;we&quot;, &quot;us&quot;,
              &quot;our&quot;). By using the Site or placing an order, you
              agree to these terms.
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                1. Orders
              </h2>
              <p>
                Placing an order is an offer to buy. We confirm acceptance of
                your order by sending you an order confirmation. We reserve the
                right to refuse or cancel orders for reasons including stock
                availability, errors in pricing or product information, or
                suspected fraud.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                2. Pricing
              </h2>
              <p>
                All prices are in Malaysian Ringgit (RM) and are inclusive of
                applicable taxes unless stated otherwise. Prices, product
                specifications, and availability may change without notice
                prior to confirmation of an order.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                3. Payment
              </h2>
              <p>
                Payment is required at checkout. We accept the payment methods
                listed on the Site. Orders are not confirmed until payment is
                received.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                4. Delivery and pickup
              </h2>
              <p>
                We provide same-day or next-day options when ordered before our
                cut-off time. Delivery times are best efforts and may be
                affected by weather, traffic, and third-party logistics.
                Please ensure your delivery address and contact number are
                accurate.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                5. Quality and freshness
              </h2>
              <p>
                Our products are handcrafted in small batches. Slight
                variations in appearance, decoration, and texture from photos
                are part of the handcrafted nature of our work and are not
                considered defects.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                6. Refunds
              </h2>
              <p>
                Our refund eligibility and process are set out in the{" "}
                <Link
                  href="/refund-policy"
                  className="text-[#1a5f9e] hover:text-slate-900"
                >
                  Refund Policy
                </Link>
                .
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                7. Privacy
              </h2>
              <p>
                Your personal data is handled in accordance with our{" "}
                <Link
                  href="/privacy-policy"
                  className="text-[#1a5f9e] hover:text-slate-900"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                8. Limitation of liability
              </h2>
              <p>
                To the extent permitted by Malaysian law, our liability in
                connection with any product or service is limited to the
                amount you paid for that product or service. We are not liable
                for indirect or consequential losses.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                9. Intellectual property
              </h2>
              <p>
                All content on the Site — including images, text, recipes, and
                product names — is owned by us or our licensors. You may not
                reproduce or use it commercially without prior written consent.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                10. Governing law
              </h2>
              <p>
                These terms are governed by the laws of {company.jurisdiction}.
                Any disputes are subject to the exclusive jurisdiction of the{" "}
                {company.jurisdiction} courts.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                11. Contact
              </h2>
              <p>For questions about these terms:</p>
              <ul className="list-none space-y-1 text-slate-700">
                {isPresent(company.contactEmail) ? (
                  <li>
                    Email:{" "}
                    <a
                      className="text-[#1a5f9e] hover:text-slate-900"
                      href={`mailto:${company.contactEmail}`}
                    >
                      {company.contactEmail}
                    </a>
                  </li>
                ) : null}
                {isPresent(company.contactPhone) ? (
                  <li>Phone / WhatsApp: {company.contactPhone}</li>
                ) : null}
                {isPresent(company.registrationNumber) ? (
                  <li>Company No.: {company.registrationNumber}</li>
                ) : null}
                {isPresent(company.registeredAddress) ? (
                  <li>Registered office: {company.registeredAddress}</li>
                ) : null}
              </ul>
            </section>
          </div>

          <p className="mt-12 text-center text-sm text-slate-500">
            <Link
              href="/"
              className="font-medium text-slate-700 hover:text-slate-900"
            >
              ← Back to home
            </Link>
            <span className="mx-2 text-slate-300">·</span>
            <Link
              href="/privacy-policy"
              className="font-medium text-slate-700 hover:text-slate-900"
            >
              Privacy Policy
            </Link>
            <span className="mx-2 text-slate-300">·</span>
            <Link
              href="/refund-policy"
              className="font-medium text-slate-700 hover:text-slate-900"
            >
              Refund Policy
            </Link>
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

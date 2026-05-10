import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getCompanyConfig, isPresent } from "@/lib/companyConfig";

export const metadata: Metadata = {
  title: "Refund Policy — Moja Maison",
  description:
    "When and how Moja Maison issues refunds or replacements for orders.",
};

export default function RefundPolicyPage() {
  const company = getCompanyConfig();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader ctaHref="/shop" ctaLabel="Shop & order" />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
          <p className="text-sm font-medium text-[#1a5f9e]">Legal</p>
          <h1 className="font-display mt-2 text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
            Refund Policy
          </h1>
          {company.refundLastUpdated ? (
            <p className="mt-3 text-sm text-slate-500">
              Last updated: {company.refundLastUpdated}
            </p>
          ) : null}

          <div className="mt-8 space-y-8 text-[15px] leading-7 text-slate-700">
            <p>
              Our cakes and pastries are made fresh to order. Because of that,
              we have a limited refund window — but we&apos;ll always make
              things right when something goes wrong.
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                1. Eligibility for refund or replacement
              </h2>
              <p>You may request a refund or replacement if:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>You receive a different item from what you ordered.</li>
                <li>
                  The product has a clear quality defect (e.g. spoilage or
                  foreign object).
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                2. How to report
              </h2>
              <p>
                Report the issue within{" "}
                <span className="font-medium text-slate-900">24 hours</span> of
                pickup or delivery. Please include:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Your order number</li>
                <li>Clear photos of the issue</li>
                <li>A short description of what went wrong</li>
              </ul>
              {isPresent(company.contactEmail) || isPresent(company.contactPhone) ? (
                <p>
                  Reach us at{" "}
                  {isPresent(company.contactEmail) ? (
                    <a
                      className="text-[#1a5f9e] hover:text-slate-900"
                      href={`mailto:${company.contactEmail}`}
                    >
                      {company.contactEmail}
                    </a>
                  ) : null}
                  {isPresent(company.contactEmail) && isPresent(company.contactPhone)
                    ? " or WhatsApp "
                    : null}
                  {isPresent(company.contactPhone) ? company.contactPhone : null}
                  .
                </p>
              ) : null}
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                3. Resolution
              </h2>
              <p>Once verified, we will either:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Replace the affected item on the next available baking day, or</li>
                <li>
                  Refund the affected portion of your order to your original
                  payment method within 7–14 working days.
                </li>
              </ul>
              <p>
                You may choose either option, subject to product availability
                for replacements.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                4. What we cannot refund
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>Change of mind after the order has been baked.</li>
                <li>
                  Custom-decorated cakes prepared exactly to your
                  specifications.
                </li>
                <li>Issues reported more than 24 hours after delivery or pickup.</li>
                <li>
                  The cakes that are damaged on delivery or pickup by the recipient.
                </li>
                <li>
                  Cosmetic variations from photos — small differences in
                  decoration are part of handcrafted work.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                5. Cancellations
              </h2>
              <p>
                Order cancellations are accepted up to{" "}
                <span className="font-medium text-slate-900">24 hours</span>{" "}
                before your scheduled pickup or delivery. After that, we may
                have already started preparing your order and refunds will
                not be possible.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                6. Contact
              </h2>
              <p>For all refund matters:</p>
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
              href="/terms"
              className="font-medium text-slate-700 hover:text-slate-900"
            >
              Terms &amp; Conditions
            </Link>
            <span className="mx-2 text-slate-300">·</span>
            <Link
              href="/privacy-policy"
              className="font-medium text-slate-700 hover:text-slate-900"
            >
              Privacy Policy
            </Link>
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

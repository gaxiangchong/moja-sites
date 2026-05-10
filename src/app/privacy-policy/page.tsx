import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getCompanyConfig, isPresent } from "@/lib/companyConfig";

export const metadata: Metadata = {
  title: "Privacy Policy — Moja Maison",
  description:
    "How Moja Maison collects, uses, and protects your personal data, in line with the Personal Data Protection Act 2010 (Malaysia).",
};

export default function PrivacyPolicyPage() {
  const company = getCompanyConfig();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader ctaHref="/shop" ctaLabel="Shop & order" />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
          <p className="text-sm font-medium text-[#1a5f9e]">Legal</p>
          <h1 className="font-display mt-2 text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
            Privacy Policy
          </h1>
          {company.privacyLastUpdated ? (
            <p className="mt-3 text-sm text-slate-500">
              Last updated: {company.privacyLastUpdated}
            </p>
          ) : null}

          <div className="mt-8 space-y-8 text-[15px] leading-7 text-slate-700">
            <p>
              {company.legalName} (&quot;we&quot;, &quot;us&quot;,
              &quot;our&quot;) respects your privacy. This Privacy Policy
              explains what personal data we collect, how we use it, and the
              rights you have under the Personal Data Protection Act 2010 of
              Malaysia (&quot;PDPA&quot;).
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                1. Information we collect
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <span className="font-medium text-slate-900">
                    Order information:
                  </span>{" "}
                  name, contact number, delivery address, payment confirmation,
                  and order history.
                </li>
                <li>
                  <span className="font-medium text-slate-900">
                    Communications:
                  </span>{" "}
                  messages, complaints, and reviews you send us.
                </li>
                <li>
                  <span className="font-medium text-slate-900">
                    Marketing preferences:
                  </span>{" "}
                  opt-ins for promotions and newsletters.
                </li>
                <li>
                  <span className="font-medium text-slate-900">
                    Website usage:
                  </span>{" "}
                  cookies, IP address, device and browser data, used to keep
                  the site reliable and improve it.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                2. How we use your data
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>To process and fulfill your orders, including pickup and delivery.</li>
                <li>
                  To communicate with you about your order and provide customer
                  support.
                </li>
                <li>To send marketing messages, only if you have opted in.</li>
                <li>To improve our products, services, and website.</li>
                <li>To comply with our legal and tax obligations.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                3. Sharing your data
              </h2>
              <p>
                We share data only with parties needed to fulfill your orders
                or operate our business — such as delivery partners, payment
                processors, and IT service providers — and only for the
                purposes we share it for.
              </p>
              <p>We do not sell your personal data.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                4. Retention
              </h2>
              <p>
                We keep your data only as long as we need to for the purposes
                described above, and as required by Malaysian law (e.g.,
                accounting and tax records). After that, we delete or
                anonymize it.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                5. Your rights under the PDPA
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>Access and obtain a copy of the personal data we hold about you.</li>
                <li>Correct inaccurate or incomplete data.</li>
                <li>Withdraw consent for marketing communications at any time.</li>
                <li>
                  Lodge a complaint with the Personal Data Protection
                  Commissioner (Pesuruhjaya Perlindungan Data Peribadi).
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                6. Cookies
              </h2>
              <p>
                We use cookies to keep you signed in, remember your
                preferences, and measure how the site is used. You can
                disable cookies in your browser settings; some features may
                not work as expected without them.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                7. Contact
              </h2>
              <p>For privacy questions or data subject access requests:</p>
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
                {isPresent(company.registeredAddress) ? (
                  <li>Address: {company.registeredAddress}</li>
                ) : null}
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                8. Changes to this policy
              </h2>
              <p>
                We may update this policy from time to time. Material changes
                will be posted on this page with a new &quot;Last updated&quot;
                date.
              </p>
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

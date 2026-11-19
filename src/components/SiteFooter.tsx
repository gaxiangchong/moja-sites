import Link from "next/link";
import { getCompanyConfig, isPresent } from "@/lib/companyConfig";
import { getContactConfig } from "@/lib/contactConfig";
import { SERVICE_AREAS } from "@/lib/siteConfig";

/**
 * The footer carries the site-wide NAP (name, address, phone) plus hours and
 * social profiles. Consistent NAP on every page is a baseline local-search
 * signal, and the extra internal links spread crawl equity to the shop, FAQ
 * and contact pages from everywhere on the site.
 */
export function SiteFooter() {
  const company = getCompanyConfig();
  const contact = getContactConfig();
  const showRegNo = isPresent(company.registrationNumber);
  const showAddress = isPresent(company.registeredAddress);
  const telHref = company.contactPhone.replace(/[^\d+]/g, "");
  const socials = contact.channels.filter(
    (c) => c.key === "facebook" || c.key === "instagram",
  );

  return (
    <footer className="mt-auto border-t border-slate-900/10 bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* NAP */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-900">
              {company.legalName}
            </div>
            {showAddress ? (
              <address className="not-italic text-xs leading-5 text-slate-500">
                {company.registeredAddress}
              </address>
            ) : null}
            {isPresent(company.contactPhone) ? (
              <div className="text-xs text-slate-500">
                <a
                  className="hover:text-slate-900"
                  href={`tel:${telHref}`}
                >
                  {company.contactPhone}
                </a>
              </div>
            ) : null}
            {isPresent(company.contactEmail) ? (
              <div className="text-xs text-slate-500">
                <a
                  className="hover:text-slate-900"
                  href={`mailto:${company.contactEmail}`}
                >
                  {company.contactEmail}
                </a>
              </div>
            ) : null}
          </div>

          {/* Hours */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-900">
              Opening hours
            </div>
            <div className="space-y-1 text-xs leading-5 text-slate-500">
              <div>Monday: 11:00 AM – 8:00 PM</div>
              <div>Wed – Sun: 10:00 AM – 6:00 PM</div>
              <div>Tuesday: Closed</div>
            </div>
          </div>

          {/* Delivery areas — plain-text local relevance for crawlers and AI */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-900">
              Delivery &amp; pickup
            </div>
            <div className="text-xs leading-5 text-slate-500">
              {SERVICE_AREAS.join(" · ")}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-900">Explore</div>
            <nav className="grid gap-1 text-xs text-slate-500">
              <Link className="hover:text-slate-900" href="/shop">
                Cake menu
              </Link>
              <Link className="hover:text-slate-900" href="/about">
                About us
              </Link>
              <Link className="hover:text-slate-900" href="/faq">
                Ordering FAQ
              </Link>
              <Link className="hover:text-slate-900" href="/contact">
                Contact
              </Link>
            </nav>
            {socials.length > 0 ? (
              <div className="flex flex-wrap gap-3 pt-1 text-xs text-slate-500">
                {socials.map((social) => (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-900/10 pt-6 sm:flex-row sm:items-start sm:justify-between">
          <div
            className="space-y-1 text-sm text-slate-600"
            suppressHydrationWarning
          >
            <div>
              © {new Date().getFullYear()} {company.legalName}. All rights
              reserved.
            </div>
            {showRegNo ? (
              <div className="text-xs text-slate-500">
                Company No.: {company.registrationNumber}
              </div>
            ) : null}
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            <Link className="hover:text-slate-900" href="/privacy-policy">
              Privacy Policy
            </Link>
            <Link className="hover:text-slate-900" href="/terms">
              Terms &amp; Conditions
            </Link>
            <Link className="hover:text-slate-900" href="/refund-policy">
              Refund Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

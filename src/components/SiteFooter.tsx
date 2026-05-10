import Link from "next/link";
import { getCompanyConfig, isPresent } from "@/lib/companyConfig";

export function SiteFooter() {
  const company = getCompanyConfig();
  const showRegNo = isPresent(company.registrationNumber);
  const showAddress = isPresent(company.registeredAddress);

  return (
    <footer className="mt-auto border-t border-slate-900/10 bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1 text-sm text-slate-600" suppressHydrationWarning>
            <div>
              © {new Date().getFullYear()} {company.legalName}. All rights reserved.
            </div>
            {showRegNo ? (
              <div className="text-xs text-slate-500">
                Company No.: {company.registrationNumber}
              </div>
            ) : null}
            {showAddress ? (
              <div className="max-w-md text-xs text-slate-500">
                Registered office: {company.registeredAddress}
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

import { cache } from "react";
import companyFile from "../../config/company.json";

export type CompanyConfig = {
  legalName: string;
  registrationNumber: string;
  registeredAddress: string;
  contactEmail: string;
  contactPhone: string;
  jurisdiction: string;
  termsLastUpdated: string;
  refundLastUpdated: string;
  privacyLastUpdated: string;
};

type CompanyFileJson = Partial<CompanyConfig> & {
  $schemaNote?: string;
};

function trim(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() || fallback : fallback;
}

export const getCompanyConfig = cache((): CompanyConfig => {
  const raw = companyFile as CompanyFileJson;
  return {
    legalName: trim(raw.legalName, "Moja Maison Sdn Bhd"),
    registrationNumber: trim(raw.registrationNumber),
    registeredAddress: trim(raw.registeredAddress),
    contactEmail: trim(raw.contactEmail),
    contactPhone: trim(raw.contactPhone),
    jurisdiction: trim(raw.jurisdiction, "Malaysia"),
    termsLastUpdated: trim(raw.termsLastUpdated),
    refundLastUpdated: trim(raw.refundLastUpdated),
    privacyLastUpdated: trim(raw.privacyLastUpdated),
  };
});

/**
 * Treat placeholders that still contain "TBD" as missing, so the UI can
 * hide them until the real value is filled in.
 */
export function isPresent(value: string): boolean {
  if (!value) return false;
  if (/^tbd\b/i.test(value)) return false;
  return true;
}

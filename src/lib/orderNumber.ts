import { randomBytes } from "node:crypto";

/** Human-readable reference: MM-XXXXXXXX (8 hex chars, upper). Month uses Asia/Kuala_Lumpur. */
export function newOrderNumber(now = new Date()): string {
  const monthPart = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    month: "2-digit",
  })
    .formatToParts(now)
    .find((p) => p.type === "month");
  const mm = monthPart?.value ?? "01";
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `${mm}-${suffix}`;
}

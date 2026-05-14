/**
 * Parse SalesPlay `total_points` / similar string fields into an integer.
 */
export function parseSalesPlayPoints(raw: string | undefined | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseInt(String(raw).replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

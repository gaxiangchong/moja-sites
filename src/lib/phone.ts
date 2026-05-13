/**
 * Normalise Malaysian mobile numbers to E.164 (+60…).
 * Accepts common local formats: 01xxxxxxxxx, 60xxxxxxxxx, +60…
 */
export function normalizeMalaysiaPhone(input: string): string | null {
  const raw = input.trim().replace(/[\s-]/g, "");
  if (!raw) return null;

  let digits = raw;
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("60")) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length >= 10) {
    return `+60${digits.slice(1)}`;
  }
  if (digits.length >= 9 && !digits.startsWith("0")) {
    return `+60${digits}`;
  }
  return null;
}

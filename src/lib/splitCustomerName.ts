/** Split a display name into SalesPlay first / last name fields. */
export function splitCustomerName(full: string): { firstName: string; lastName: string } {
  const t = full.trim();
  if (!t) return { firstName: "Customer", lastName: "." };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0]!, lastName: "." };
  const lastName = parts.pop()!;
  const firstName = parts.join(" ");
  return { firstName: firstName || lastName, lastName };
}

import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { normalizeMalaysiaPhone } from "@/lib/phone";
import { parseSalesPlayPoints } from "@/lib/salesplay/points";

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return null;
}

function normEventType(type: unknown): string {
  return String(type ?? "unknown").trim().toLowerCase();
}

/**
 * Stable idempotency key for `webhook_events` (source = salesplay).
 * @see https://help.salesplay.com/help/webhook
 */
export function buildSalesPlayWebhookExternalId(payload: Record<string, unknown>): string {
  const merchant = String(payload.merchant_id ?? "");
  const type = normEventType(payload.type);
  const created = String(payload.created_at ?? "");
  const parts: string[] = [merchant, type, created];

  if (type === "customers.update") {
    const arr = Array.isArray(payload.customers) ? payload.customers : [];
    const ids = arr
      .map((c) => String(asRecord(c)?.id ?? "").trim())
      .filter(Boolean)
      .sort()
      .join(",");
    parts.push(ids || "empty");
  } else if (type === "receipts.update") {
    const arr = Array.isArray(payload.receipts) ? payload.receipts : [];
    const keys = arr
      .map((r) => {
        const o = asRecord(r);
        if (!o) return "";
        return `${String(o.receipt_number ?? "")}|${String(o.order_reference_id ?? "")}|${String(o.order_reference_number ?? "")}`;
      })
      .filter(Boolean)
      .sort()
      .join(";");
    parts.push(keys || "empty");
  } else {
    parts.push(createHash("sha256").update(JSON.stringify(payload)).digest("hex"));
  }

  const raw = parts.join("|");
  if (raw.length <= 480) return raw;
  return createHash("sha256").update(raw).digest("hex");
}

function pointsFromCustomerPayload(c: Record<string, unknown>): number | null {
  return parseSalesPlayPoints(
    typeof c.total_points === "string" ? c.total_points : undefined,
  );
}

async function applyCustomerPointsUpdate(
  salesplayCustomerId: string | null,
  customerCode: string | null,
  phoneRaw: string | null,
  points: number | null,
): Promise<void> {
  const now = new Date();
  const or: { salesplayCustomerId?: string; phone?: string; id?: string }[] = [];

  if (salesplayCustomerId) {
    or.push({ salesplayCustomerId });
  }
  if (customerCode?.startsWith("moja_")) {
    const localId = customerCode.slice("moja_".length).trim();
    if (localId) or.push({ id: localId });
  }
  const phone = phoneRaw ? normalizeMalaysiaPhone(phoneRaw) : null;
  if (phone) {
    or.push({ phone });
  }

  if (!or.length) return;
  if (points === null && !salesplayCustomerId) return;

  const data: {
    loyaltyPointsBalance?: number;
    loyaltyPointsSyncedAt?: Date;
    salesplayCustomerId?: string;
  } = {
    ...(points !== null
      ? { loyaltyPointsBalance: points, loyaltyPointsSyncedAt: now }
      : {}),
    ...(salesplayCustomerId ? { salesplayCustomerId } : {}),
  };

  if (Object.keys(data).length === 0) return;

  await prisma.customer.updateMany({
    where: { OR: or },
    data,
  });
}

export async function handleSalesPlayCustomersUpdate(
  payload: Record<string, unknown>,
): Promise<void> {
  const arr = Array.isArray(payload.customers) ? payload.customers : [];
  for (const raw of arr) {
    const c = asRecord(raw);
    if (!c) continue;
    const spId = typeof c.id === "string" ? c.id.trim() : null;
    const code =
      typeof c.customer_code === "string" ? c.customer_code.trim() : null;
    const phone =
      typeof c.phone_number === "string" ? c.phone_number.trim() : null;
    const pts = pointsFromCustomerPayload(c);
    await applyCustomerPointsUpdate(spId || null, code, phone, pts);
  }
}

async function applyReceiptCustomerPoints(
  receipt: Record<string, unknown>,
): Promise<void> {
  const nested = Array.isArray(receipt.customer) ? receipt.customer : [];
  const first = nested.length ? asRecord(nested[0]) : null;
  const points = first ? pointsFromCustomerPayload(first) : null;
  const spId =
    typeof receipt.customer_id === "string"
      ? receipt.customer_id.trim()
      : typeof first?.id === "string"
        ? first.id.trim()
        : null;
  const code =
    typeof first?.customer_code === "string"
      ? first.customer_code.trim()
      : null;
  const phone =
    typeof first?.phone_number === "string"
      ? first.phone_number.trim()
      : null;

  await applyCustomerPointsUpdate(spId, code, phone, points);
}

export async function handleSalesPlayReceiptsUpdate(
  payload: Record<string, unknown>,
): Promise<void> {
  const arr = Array.isArray(payload.receipts) ? payload.receipts : [];
  for (const raw of arr) {
    const r = asRecord(raw);
    if (!r) continue;
    await applyReceiptCustomerPoints(r);
  }
}

export async function dispatchSalesPlayWebhook(
  payload: Record<string, unknown>,
): Promise<{ ignored: boolean; detail?: string }> {
  const type = normEventType(payload.type);

  if (type === "customers.update") {
    await handleSalesPlayCustomersUpdate(payload);
    return { ignored: false };
  }
  if (type === "receipts.update") {
    await handleSalesPlayReceiptsUpdate(payload);
    return { ignored: false };
  }

  return { ignored: true, detail: type };
}

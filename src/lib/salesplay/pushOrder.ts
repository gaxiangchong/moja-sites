import type { Customer, Order, OrderLine } from "@/generated/prisma/client";
import { parseSalesPlayPoints } from "@/lib/salesplay/points";
import { splitCustomerName } from "@/lib/splitCustomerName";
import { SalesPlayClient } from "./client";
import { formatDateKl, formatDateTimeKl } from "./dateFormat";
import type {
  SalesPlayCreateCustomerRequest,
  SalesPlayCreateOnlineOrderRequest,
  SalesPlayOnlineOrderItem,
} from "./types";

function centsToMyr(cents: number): number {
  return Math.round(cents) / 100;
}

function normalizePhoneForSalesPlay(e164: string): string {
  const t = e164.trim();
  if (t.startsWith("+60")) return t.slice(1);
  if (t.startsWith("+")) return t.replace(/^\+/, "");
  return t;
}

export type OrderWithRelations = Order & {
  customer: Customer;
  lines: OrderLine[];
};

function buildPickupComment(order: OrderWithRelations): string {
  const start = formatDateTimeKl(new Date(order.pickupStartAt));
  const end = formatDateTimeKl(new Date(order.pickupEndAt));
  const notes = order.pickupNotes?.trim();
  const base = `Pickup ${start}–${end} MYT. Ref ${order.orderNumber}.`;
  return notes ? `${base} Notes: ${notes.slice(0, 400)}` : base;
}

function lineToItem(
  line: OrderLine,
  fallbackProductCode: string,
): SalesPlayOnlineOrderItem {
  const code =
    line.salesplayProductId?.trim() || fallbackProductCode.trim() || "";
  if (!code) {
    throw new Error(
      "Missing SalesPlay product mapping: set order line salesplayProductId or SALESPLAY_FALLBACK_PRODUCT_CODE",
    );
  }
  const unit = centsToMyr(line.unitPriceCents);
  const total = centsToMyr(line.lineTotalCents);
  const remarkParts = [line.productSlug];
  if (line.variantLabel) remarkParts.push(line.variantLabel);
  return {
    product_code: code,
    product_name: line.productName,
    product_qty: line.quantity,
    product_unit_price: unit,
    product_price: total,
    product_cost: 0,
    product_remark: remarkParts.join(" · ").slice(0, 500),
    product_modifiers: [],
    product_taxes: [],
    product_discounts: [],
  };
}

async function resolveSalesPlayCustomerId(
  client: SalesPlayClient,
  customer: Customer,
): Promise<string | null> {
  if (customer.salesplayCustomerId?.trim()) {
    return customer.salesplayCustomerId.trim();
  }
  const email = customer.email?.trim();
  if (!email) return null;
  const res = await client.listCustomers({ email, limit: 50 });
  if (!res.ok) return null;
  const list = res.body.customers ?? [];
  const phoneNorm = normalizePhoneForSalesPlay(customer.phone);
  const byPhone = list.find(
    (c) =>
      c.phone_number &&
      normalizePhoneForSalesPlay(c.phone_number) === phoneNorm,
  );
  const pick = byPhone ?? list[0];
  return pick?.id?.trim() ?? null;
}

export async function refreshCustomerPointsCache(
  client: SalesPlayClient,
  salesplayCustomerId: string,
): Promise<number | null> {
  const res = await client.listCustomers({
    customerIds: [salesplayCustomerId],
    limit: 1,
  });
  if (!res.ok) return null;
  const c = res.body.customers?.[0];
  return parseSalesPlayPoints(c?.total_points);
}

export async function pushCustomerToSalesPlay(
  client: SalesPlayClient,
  customer: Customer,
): Promise<{ salesplayCustomerId: string | null; points: number | null }> {
  const { firstName, lastName } = splitCustomerName(customer.name);
  const body: SalesPlayCreateCustomerRequest = {
    first_name: firstName,
    last_name: lastName,
    phone: normalizePhoneForSalesPlay(customer.phone),
    customer_code: `moja_${customer.id}`,
    country_code: "MY",
    description: "Synced from moja-sites web checkout",
  };
  const em = customer.email?.trim();
  if (em) body.email = em;

  const created = await client.createOrUpdateCustomer(body);
  if (!created.ok) {
    throw new Error(
      `SalesPlay customer sync failed (${created.status}): ${created.text.slice(0, 500)}`,
    );
  }

  const id = await resolveSalesPlayCustomerId(client, {
    ...customer,
    salesplayCustomerId: customer.salesplayCustomerId,
  });
  let points: number | null = null;
  if (id) {
    points = await refreshCustomerPointsCache(client, id);
  }
  return { salesplayCustomerId: id, points };
}

export async function pushPaidOrderToSalesPlay(
  client: SalesPlayClient,
  order: OrderWithRelations,
): Promise<{ systemUniqueId: string }> {
  const shopId = process.env.SALESPLAY_SHOP_ID?.trim();
  if (!shopId) {
    throw new Error("SALESPLAY_SHOP_ID is not configured");
  }

  const fallbackCode = process.env.SALESPLAY_FALLBACK_PRODUCT_CODE?.trim() ?? "";

  const { firstName, lastName } = splitCustomerName(order.customer.name);
  const paidAt = order.paidAt ? new Date(order.paidAt) : new Date();

  const channelStatusId = Number(
    process.env.SALESPLAY_CHANNEL_ORDER_STATUS_ID ?? "0",
  );
  const channelStatusName =
    process.env.SALESPLAY_CHANNEL_ORDER_STATUS_NAME?.trim() ?? "pending";
  const orderType = process.env.SALESPLAY_ORDER_TYPE?.trim() ?? "Delivery";
  const targetTerminal = process.env.SALESPLAY_TARGET_TERMINAL?.trim() ?? "";
  const paymentType =
    process.env.SALESPLAY_ORDER_PAYMENT_TYPE?.trim() ?? "Card";

  const items: SalesPlayOnlineOrderItem[] = order.lines.map((l: OrderLine) =>
    lineToItem(l, fallbackCode),
  );

  const orderTotal = centsToMyr(order.totalCents);

  const payload: SalesPlayCreateOnlineOrderRequest = {
    shop_id: shopId,
    order_date: formatDateKl(paidAt),
    order_reference_number: order.orderNumber,
    order_reference_id: order.id,
    order_total: orderTotal,
    channel_order_status_id: Number.isFinite(channelStatusId)
      ? channelStatusId
      : 0,
    channel_order_status_name: channelStatusName,
    order_comment: buildPickupComment(order).slice(0, 1500),
    table_code: " ",
    order_type: orderType,
    target_terminal: targetTerminal,
    customer_first_name: firstName,
    customer_last_name: lastName,
    customer_phone: normalizePhoneForSalesPlay(order.customer.phone),
    customer_email: order.customer.email?.trim() ?? "",
    order_date_time: formatDateTimeKl(paidAt),
    order_items: items,
    fixed_charges: [],
    order_total_discounts: [],
    order_payments: [
      {
        payment_type: paymentType,
        payment_amount: orderTotal,
        payment_reference: order.id,
        is_advance: 0,
      },
    ],
  };

  const res = await client.createOnlineOrder(payload);
  if (!res.ok) {
    throw new Error(
      `SalesPlay online_orders failed (${res.status}): ${res.text.slice(0, 800)}`,
    );
  }

  const systemUniqueId = res.body.success?.system_unique_id?.trim();
  if (!systemUniqueId) {
    throw new Error(
      "SalesPlay online_orders succeeded but system_unique_id was missing",
    );
  }

  return { systemUniqueId };
}

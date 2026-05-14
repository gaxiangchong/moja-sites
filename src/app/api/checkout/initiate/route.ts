import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  orderTotalsFromLines,
  priceCheckoutLines,
  type CheckoutCartLineInput,
} from "@/lib/checkoutPricing";
import { newOrderNumber } from "@/lib/orderNumber";
import { normalizeMalaysiaPhone } from "@/lib/phone";
import {
  pickupWindowFromDateAndSlot,
  type PickupSlotId,
} from "@/lib/pickupSlots";
import { splitCustomerName } from "@/lib/splitCustomerName";
import { createXenditPaymentSession } from "@/lib/xenditSession";

export const runtime = "nodejs";

type Body = {
  lines: CheckoutCartLineInput[];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupDate: string;
  pickupSlot: PickupSlotId;
  pickupNotes?: string;
};

function publicBaseUrl(req: Request): string {
  const env = process.env.XENDIT_PUBLIC_BASE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

export async function POST(req: Request) {
  const secret = process.env.XENDIT_SECRET_KEY?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Payments are not configured (missing XENDIT_SECRET_KEY)." },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const lines = Array.isArray(body.lines) ? body.lines : [];
  if (!lines.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const phone = normalizeMalaysiaPhone(body.customerPhone ?? "");
  if (!phone) {
    return NextResponse.json(
      { error: "Enter a valid Malaysian mobile number" },
      { status: 400 },
    );
  }

  const name = (body.customerName ?? "").trim();
  if (name.length < 2) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const priced = priceCheckoutLines(lines);
  if (!priced.ok) {
    return NextResponse.json({ error: priced.error }, { status: 400 });
  }

  const allowedSlots: PickupSlotId[] = [
    "12-14",
    "14-16",
    "16-18",
    "sun-10-1230",
  ];
  if (!allowedSlots.includes(body.pickupSlot)) {
    return NextResponse.json({ error: "Invalid pickup slot" }, { status: 400 });
  }

  const pickup = pickupWindowFromDateAndSlot(
    body.pickupDate ?? "",
    body.pickupSlot,
  );
  if (!pickup.ok) {
    return NextResponse.json({ error: pickup.error }, { status: 400 });
  }

  const totals = orderTotalsFromLines(priced.priced);
  if (totals.totalCents < 100) {
    return NextResponse.json({ error: "Order total is too small" }, { status: 400 });
  }

  const orderId = randomUUID();
  const orderNumber = newOrderNumber();
  const base = publicBaseUrl(req);
  const successReturnUrl = `${base}/checkout/return?orderId=${encodeURIComponent(orderId)}&status=success`;
  const cancelReturnUrl = `${base}/checkout/return?orderId=${encodeURIComponent(orderId)}&status=cancel`;

  const { firstName: given, lastName: surname } = splitCustomerName(name);
  const email = (body.customerEmail ?? "").trim() || undefined;

  const x = await createXenditPaymentSession({
    secretKey: secret,
    referenceId: orderId,
    amountSen: totals.totalCents,
    description: `Moja Maison order ${orderNumber}`,
    customer: {
      givenNames: given,
      surname,
      email,
      mobileNumber: phone,
    },
    successReturnUrl,
    cancelReturnUrl,
    metadata: { order_number: orderNumber },
  });

  if (!x.ok) {
    return NextResponse.json(
      {
        error: "Could not start payment with Xendit",
        detail: x.body,
        status: x.status,
      },
      { status: 502 },
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { phone },
        create: {
          phone,
          name,
          email: email ?? null,
        },
        update: {
          name,
          ...(email ? { email } : {}),
        },
      });

      await tx.order.create({
        data: {
          id: orderId,
          orderNumber,
          customerId: customer.id,
          status: OrderStatus.pending,
          subtotalCents: totals.subtotalCents,
          taxCents: totals.taxCents,
          discountCents: totals.discountCents,
          totalCents: totals.totalCents,
          pickupStartAt: pickup.start,
          pickupEndAt: pickup.end,
          pickupNotes: (body.pickupNotes ?? "").trim().slice(0, 500) || null,
          lines: {
            create: priced.priced.map((l) => ({
              productSlug: l.productSlug,
              productName: l.productName,
              variantLabel: l.variantLabel,
              quantity: l.quantity,
              unitPriceCents: l.unitPriceCents,
              taxCents: l.taxCents,
              lineTotalCents: l.lineTotalCents,
            })),
          },
        },
      });

      await tx.paymentIntent.create({
        data: {
          orderId,
          providerPaymentRequestId: x.paymentSessionId,
          providerStatus: x.status || "ACTIVE",
          amountCents: totals.totalCents,
          currency: "MYR",
          rawCreateResponse: x.raw as Prisma.InputJsonValue,
        },
      });
    });
  } catch (e) {
    console.error("[checkout/initiate] db error", e);
    return NextResponse.json(
      {
        error: "Order could not be saved after starting payment. Contact support with your payment session.",
        orderId,
        paymentSessionId: x.paymentSessionId,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    redirectUrl: x.paymentLinkUrl,
    orderId,
    orderNumber,
  });
}

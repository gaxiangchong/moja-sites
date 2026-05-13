import { NextResponse } from "next/server";
import { OrderStatus, WebhookSource } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function readCallbackToken(req: Request): string | null {
  return (
    req.headers.get("x-callback-token") ??
    req.headers.get("X-CALLBACK-TOKEN") ??
    null
  );
}

function extractNested(obj: unknown): Record<string, unknown> | null {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    return obj as Record<string, unknown>;
  }
  return null;
}

function parseXenditWebhook(payload: Record<string, unknown>): {
  event: string;
  referenceId: string | null;
  paymentSessionId: string | null;
  paymentId: string | null;
  dedupeKey: string;
} {
  const event = String(payload.event ?? payload.type ?? "unknown");
  const data = extractNested(payload.data) ?? {};

  const referenceId =
    (typeof data.reference_id === "string" && data.reference_id) ||
    (typeof payload.reference_id === "string" && payload.reference_id) ||
    null;

  const paymentSessionId =
    (typeof data.payment_session_id === "string" && data.payment_session_id) ||
    (typeof payload.payment_session_id === "string" &&
      payload.payment_session_id) ||
    null;

  const paymentId =
    (typeof data.payment_id === "string" && data.payment_id) ||
    (typeof payload.payment_id === "string" && payload.payment_id) ||
    null;

  const id =
    (typeof payload.id === "string" && payload.id) ||
    (typeof data.id === "string" && data.id) ||
    null;

  const dedupeKey =
    id ??
    `${event}:${paymentSessionId ?? ""}:${paymentId ?? ""}:${referenceId ?? ""}:${String(payload.created ?? "")}`;

  return { event, referenceId, paymentSessionId, paymentId, dedupeKey };
}

function parsePaymentCapturePaid(payload: Record<string, unknown>): boolean {
  if (String(payload.event) !== "payment.capture") return false;
  const data = extractNested(payload.data);
  if (!data) return false;
  return String(data.status ?? "").toUpperCase() === "SUCCEEDED";
}

export async function POST(req: Request) {
  const expected = process.env.XENDIT_WEBHOOK_TOKEN?.trim();
  const incoming = readCallbackToken(req);
  if (expected) {
    if (!incoming || incoming !== expected) {
      return NextResponse.json({ error: "Invalid callback token" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Webhook token not configured" },
      { status: 503 },
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseXenditWebhook(payload);
  const paid =
    parsed.event === "payment_session.completed" || parsePaymentCapturePaid(payload);

  if (!paid) {
    return NextResponse.json({ received: true, ignored: parsed.event });
  }

  const orderId =
    parsed.referenceId ??
    (await findOrderIdByPaymentSession(parsed.paymentSessionId));

  if (!orderId) {
    return NextResponse.json(
      { error: "No order reference in webhook" },
      { status: 400 },
    );
  }

  const externalId = parsed.dedupeKey.slice(0, 512);

  try {
    await prisma.$transaction(async (tx) => {
      const inserted = await tx.webhookEvent.createMany({
        data: [
          {
            source: WebhookSource.xendit,
            externalId,
            eventType: parsed.event,
            payload: payload as object,
            processedAt: null,
          },
        ],
        skipDuplicates: true,
      });

      if (inserted.count === 0) {
        return;
      }

      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) {
        await tx.webhookEvent.update({
          where: {
            source_externalId: {
              source: WebhookSource.xendit,
              externalId,
            },
          },
          data: {
            lastError: "Order not found for reference",
            processedAt: new Date(),
          },
        });
        return;
      }

      if (order.status === OrderStatus.paid) {
        await tx.webhookEvent.update({
          where: {
            source_externalId: {
              source: WebhookSource.xendit,
              externalId,
            },
          },
          data: { processedAt: new Date() },
        });
        return;
      }

      const now = new Date();
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.paid,
          paidAt: now,
        },
      });

      await tx.paymentIntent.updateMany({
        where: { orderId },
        data: {
          providerStatus: "SUCCEEDED",
          rawLatestEvent: payload as object,
        },
      });

      await tx.salesPlayOutbox.create({
        data: {
          kind: "create_receipt",
          orderId,
          customerId: order.customerId,
          payload: { orderId, orderNumber: order.orderNumber },
          status: "pending",
        },
      });

      await tx.webhookEvent.update({
        where: {
          source_externalId: {
            source: WebhookSource.xendit,
            externalId,
          },
        },
        data: { processedAt: now },
      });
    });
  } catch (e) {
    console.error("[webhooks/xendit]", e);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function findOrderIdByPaymentSession(
  sessionId: string | null,
): Promise<string | null> {
  if (!sessionId) return null;
  const pi = await prisma.paymentIntent.findFirst({
    where: { providerPaymentRequestId: sessionId },
    select: { orderId: true },
  });
  return pi?.orderId ?? null;
}

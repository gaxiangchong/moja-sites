import { NextResponse } from "next/server";
import { WebhookSource } from "@/generated/prisma/client";
import {
  buildSalesPlayWebhookExternalId,
  dispatchSalesPlayWebhook,
} from "@/lib/salesplay/inboundWebhook";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function readWebhookSecret(req: Request): string | null {
  return (
    req.headers.get("x-salesplay-webhook-secret") ??
    req.headers.get("X-Salesplay-Webhook-Secret") ??
    req.headers.get("x-webhook-secret") ??
    req.headers.get("X-Webhook-Secret") ??
    null
  );
}

function readBearer(req: Request): string | null {
  const h = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice("Bearer ".length).trim() || null;
}

function authorizeSalesPlayWebhook(req: Request): boolean {
  const expected = process.env.SALESPLAY_WEBHOOK_SECRET?.trim();
  if (!expected) {
    return process.env.NODE_ENV !== "production";
  }
  const secret = readWebhookSecret(req) ?? readBearer(req);
  return Boolean(secret && secret === expected);
}

function validateMerchant(payload: Record<string, unknown>): boolean {
  const expected = process.env.SALESPLAY_MERCHANT_ID?.trim();
  if (!expected) return true;
  const got = String(payload.merchant_id ?? "").trim();
  return got === expected;
}

export async function POST(req: Request) {
  if (!authorizeSalesPlayWebhook(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!validateMerchant(payload)) {
    return NextResponse.json({ error: "merchant_id mismatch" }, { status: 403 });
  }

  const eventType = String(payload.type ?? "unknown").slice(0, 200);
  const externalId = buildSalesPlayWebhookExternalId(payload).slice(0, 512);

  let inserted = 0;
  try {
    const res = await prisma.webhookEvent.createMany({
      data: [
        {
          source: WebhookSource.salesplay,
          externalId,
          eventType,
          payload: payload as object,
          processedAt: null,
        },
      ],
      skipDuplicates: true,
    });
    inserted = res.count;
  } catch (e) {
    console.error("[webhooks/salesplay] createMany", e);
    return NextResponse.json({ error: "Storage failed" }, { status: 500 });
  }

  if (inserted === 0) {
    const existing = await prisma.webhookEvent.findUnique({
      where: {
        source_externalId: {
          source: WebhookSource.salesplay,
          externalId,
        },
      },
    });
    if (existing?.processedAt) {
      return NextResponse.json({ received: true, duplicate: true });
    }
  }

  let lastError: string | null = null;
  let ignored = false;
  let detail: string | undefined;

  try {
    const out = await dispatchSalesPlayWebhook(payload);
    ignored = out.ignored;
    detail = out.detail;
  } catch (e) {
    lastError = e instanceof Error ? e.message : String(e);
    console.error("[webhooks/salesplay] handler", e);
  }

  const now = new Date();
  try {
    await prisma.webhookEvent.update({
      where: {
        source_externalId: {
          source: WebhookSource.salesplay,
          externalId,
        },
      },
      data: {
        processedAt: now,
        lastError: lastError,
      },
    });
  } catch (e) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2025"
    ) {
      return NextResponse.json({ received: true, race: true });
    }
    console.error("[webhooks/salesplay] finalize", e);
    return NextResponse.json({ error: "Finalize failed" }, { status: 500 });
  }

  return NextResponse.json({
    received: true,
    duplicate: inserted === 0,
    ignored,
    detail,
  });
}

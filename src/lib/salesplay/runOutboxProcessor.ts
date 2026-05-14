import type { SalesPlayOutbox } from "@/generated/prisma/client";
import { OutboxStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { SalesPlayClient } from "@/lib/salesplay/client";
import {
  pushCustomerToSalesPlay,
  pushPaidOrderToSalesPlay,
  refreshCustomerPointsCache,
  type OrderWithRelations,
} from "@/lib/salesplay/pushOrder";

const MAX_FAILURE_ATTEMPTS = 24;

function backoffAfterFailure(attempts: number): Date {
  const stepMs = 60_000 * Math.min(64, Math.pow(2, Math.max(0, attempts - 1)));
  return new Date(Date.now() + stepMs);
}

function readCustomerIdFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const id = (payload as { customerId?: unknown }).customerId;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

async function handleCreateCustomer(
  client: SalesPlayClient,
  row: SalesPlayOutbox,
): Promise<void> {
  const customerId = readCustomerIdFromPayload(row.payload);
  if (!customerId) {
    throw new Error("Outbox payload missing customerId");
  }
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    throw new Error(`Customer not found: ${customerId}`);
  }
  const { salesplayCustomerId, points } = await pushCustomerToSalesPlay(client, customer);
  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      ...(salesplayCustomerId ? { salesplayCustomerId } : {}),
      ...(points !== null
        ? { loyaltyPointsBalance: points, loyaltyPointsSyncedAt: new Date() }
        : {}),
    },
  });
}

async function handleCreateReceipt(
  client: SalesPlayClient,
  row: SalesPlayOutbox,
): Promise<void> {
  const orderId = row.orderId?.trim();
  if (!orderId) {
    throw new Error("Outbox row missing orderId for create_receipt");
  }
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, lines: true },
  });
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  if (order.salesplayReceiptId) {
    return;
  }

  const o = order as OrderWithRelations;

  const { salesplayCustomerId, points } = await pushCustomerToSalesPlay(client, o.customer);
  await prisma.customer.update({
    where: { id: o.customer.id },
    data: {
      ...(salesplayCustomerId ? { salesplayCustomerId } : {}),
      ...(points !== null
        ? { loyaltyPointsBalance: points, loyaltyPointsSyncedAt: new Date() }
        : {}),
    },
  });

  const orderAfterCustomer = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, lines: true },
  });
  if (!orderAfterCustomer) {
    throw new Error(`Order disappeared mid-sync: ${orderId}`);
  }
  if (orderAfterCustomer.salesplayReceiptId) {
    return;
  }

  const { systemUniqueId } = await pushPaidOrderToSalesPlay(
    client,
    orderAfterCustomer as OrderWithRelations,
  );

  await prisma.order.update({
    where: { id: orderId },
    data: { salesplayReceiptId: systemUniqueId },
  });

  const linked = await prisma.customer.findUnique({
    where: { id: orderAfterCustomer.customerId },
    select: { salesplayCustomerId: true },
  });
  const spId = linked?.salesplayCustomerId?.trim();
  if (spId) {
    const pts = await refreshCustomerPointsCache(client, spId);
    if (pts !== null) {
      await prisma.customer.update({
        where: { id: orderAfterCustomer.customerId },
        data: { loyaltyPointsBalance: pts, loyaltyPointsSyncedAt: new Date() },
      });
    }
  }
}

async function handleUpdateCustomer(
  client: SalesPlayClient,
  row: SalesPlayOutbox,
): Promise<void> {
  await handleCreateCustomer(client, row);
}

export async function processSalesPlayOutboxRow(row: SalesPlayOutbox): Promise<void> {
  const client = new SalesPlayClient();
  switch (row.kind) {
    case "create_customer":
      await handleCreateCustomer(client, row);
      break;
    case "update_customer":
      await handleUpdateCustomer(client, row);
      break;
    case "create_receipt":
      await handleCreateReceipt(client, row);
      break;
    default:
      throw new Error(`Unknown outbox kind: ${String(row.kind)}`);
  }
}

export type ProcessOutboxSummary = {
  claimed: number;
  completed: number;
  failed: number;
  errors: string[];
};

export async function runSalesPlayOutboxBatch(opts: {
  limit: number;
}): Promise<ProcessOutboxSummary> {
  const summary: ProcessOutboxSummary = {
    claimed: 0,
    completed: 0,
    failed: 0,
    errors: [],
  };

  if (!process.env.SALESPLAY_ACCESS_TOKEN?.trim()) {
    summary.errors.push("SALESPLAY_ACCESS_TOKEN not configured; skipping outbox");
    return summary;
  }

  const now = new Date();
  const candidates = await prisma.salesPlayOutbox.findMany({
    where: {
      status: OutboxStatus.pending,
      nextAttemptAt: { lte: now },
      OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
    },
    orderBy: [{ nextAttemptAt: "asc" }, { createdAt: "asc" }],
    take: opts.limit,
  });

  for (const row of candidates) {
    const lockUntil = new Date(Date.now() + 5 * 60 * 1000);
    const claimed = await prisma.salesPlayOutbox.updateMany({
      where: {
        id: row.id,
        status: OutboxStatus.pending,
        OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
      },
      data: {
        status: OutboxStatus.in_progress,
        lockedUntil: lockUntil,
      },
    });
    if (claimed.count === 0) continue;
    summary.claimed += 1;

    try {
      await processSalesPlayOutboxRow(row);
      await prisma.salesPlayOutbox.update({
        where: { id: row.id },
        data: {
          status: OutboxStatus.done,
          lockedUntil: null,
          lastError: null,
        },
      });
      summary.completed += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const attempts = row.attempts + 1;
      const terminal = attempts >= MAX_FAILURE_ATTEMPTS;
      await prisma.salesPlayOutbox.update({
        where: { id: row.id },
        data: {
          status: terminal ? OutboxStatus.failed : OutboxStatus.pending,
          lockedUntil: null,
          attempts,
          nextAttemptAt: terminal ? row.nextAttemptAt : backoffAfterFailure(attempts),
          lastError: msg.slice(0, 2000),
        },
      });
      summary.failed += 1;
      summary.errors.push(`${row.id}: ${msg}`);
    }
  }

  return summary;
}

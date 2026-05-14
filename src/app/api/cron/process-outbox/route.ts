import { NextRequest, NextResponse } from "next/server";
import { runSalesPlayOutboxBatch } from "@/lib/salesplay/runOutboxProcessor";

export const runtime = "nodejs";

function authorizeCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  const bearer = req.headers.get("authorization");
  if (bearer === `Bearer ${secret}`) return true;
  const header = req.headers.get("x-cron-secret");
  if (header === secret) return true;
  return false;
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = req.nextUrl.searchParams.get("limit");
  const parsed = raw ? Number.parseInt(raw, 10) : 10;
  const limit =
    Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 50) : 10;

  const summary = await runSalesPlayOutboxBatch({ limit });
  return NextResponse.json(summary);
}

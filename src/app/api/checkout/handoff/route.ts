import { NextRequest, NextResponse } from "next/server";

type HandoffLine = {
  productId: string;
  name: string;
  qty: number;
  unitPriceCents: number;
  variantLabel?: string | null;
  imageUrl?: string | null;
};

export async function POST(req: NextRequest) {
  const memberApiBase = process.env.MEMBER_API_BASE_URL?.trim();
  if (!memberApiBase) {
    return NextResponse.json(
      { message: "Member checkout is not configured (MEMBER_API_BASE_URL)." },
      { status: 503 },
    );
  }

  let body: { lines?: HandoffLine[]; sourceUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
  }

  const apiUrl = `${memberApiBase.replace(/\/$/, "")}/shop/cart-handoff`;
  const upstream = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lines: body.lines,
      sourceUrl: body.sourceUrl,
    }),
  });

  const data = (await upstream.json()) as {
    redirectUrl?: string;
    message?: string | string[];
    code?: string;
  };

  if (!upstream.ok) {
    const raw = data.message;
    const message =
      typeof raw === "string"
        ? raw
        : Array.isArray(raw)
          ? raw.join(", ")
          : "Member checkout handoff failed";
    return NextResponse.json({ message }, { status: upstream.status });
  }

  if (!data.redirectUrl) {
    return NextResponse.json(
      { message: "Member API did not return a redirect URL" },
      { status: 502 },
    );
  }

  return NextResponse.json({ redirectUrl: data.redirectUrl });
}

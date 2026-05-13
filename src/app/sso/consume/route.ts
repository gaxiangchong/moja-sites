import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function failRedirect(req: NextRequest) {
  const path = process.env.SHOP_AFTER_SSO_FAIL_PATH ?? "/shop";
  return NextResponse.redirect(new URL(`${path}?reason=sso_failed`, req.url));
}

function successRedirect(req: NextRequest) {
  const path = process.env.SHOP_AFTER_SSO_PATH ?? "/shop";
  return NextResponse.redirect(new URL(path, req.url));
}

// Replay protection: a JTI may only be consumed once. Concurrent or repeated
// consumption attempts race on the unique constraint and lose with P2002.
async function markJtiConsumedOnce(jti: string): Promise<boolean> {
  try {
    await prisma.shopHandoffConsume.create({ data: { jti } });
    return true;
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return false;
    }
    throw e;
  }
}

export async function GET(req: NextRequest) {
  const handoff = req.nextUrl.searchParams.get("handoff");
  if (!handoff?.trim()) {
    return failRedirect(req);
  }

  const secretRaw = process.env.SHOP_HANDOFF_JWT_SECRET?.trim();
  const issuer = process.env.SHOP_HANDOFF_ISSUER?.trim();
  const audience = process.env.SHOP_HANDOFF_AUDIENCE?.trim() || "shop";

  if (!secretRaw || !issuer) {
    return failRedirect(req);
  }

  try {
    const secret = new TextEncoder().encode(secretRaw);
    const { payload } = await jwtVerify(handoff, secret, {
      issuer,
      audience,
    });

    const jti = typeof payload.jti === "string" ? payload.jti : "";
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    if (!jti || !sub) {
      return failRedirect(req);
    }

    const firstConsume = await markJtiConsumedOnce(jti);
    if (!firstConsume) {
      return failRedirect(req);
    }

    const res = successRedirect(req);
    const cookieName =
      process.env.SHOP_MEMBER_SESSION_COOKIE?.trim() || "moja_member_customer_id";
    res.cookies.set(cookieName, sub, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return failRedirect(req);
  }
}

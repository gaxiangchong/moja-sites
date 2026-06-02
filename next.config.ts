import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

/**
 * The member app serves product images from two roots: /images/** (migrated
 * static catalog images) and /uploads/** (admin-uploaded images). Allow both
 * so next/image can optimize either.
 */
const MEMBER_ASSET_PATHNAMES = ["/images/**", "/uploads/**"];

function patternsForHost(
  host: { protocol: "http" | "https"; hostname: string; port?: string },
): RemotePattern[] {
  return MEMBER_ASSET_PATHNAMES.map((pathname) => ({
    protocol: host.protocol,
    hostname: host.hostname,
    ...(host.port ? { port: host.port } : {}),
    pathname,
  }));
}

/**
 * Production host is overridable via NEXT_PUBLIC_MEMBER_ASSET_BASE;
 * localhost:3153 covers dev.
 */
function memberAssetHostFromEnv() {
  const base = process.env.NEXT_PUBLIC_MEMBER_ASSET_BASE?.trim();
  if (!base) return null;
  try {
    const url = new URL(base);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
    };
  } catch {
    return null;
  }
}

const hosts = [
  { protocol: "https" as const, hostname: "api.mojamaison.com" },
  { protocol: "http" as const, hostname: "localhost", port: "3153" },
  memberAssetHostFromEnv(),
].filter(Boolean) as Array<{
  protocol: "http" | "https";
  hostname: string;
  port?: string;
}>;

const remotePatterns = hosts.flatMap(patternsForHost);

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  images: {
    remotePatterns,
  },
};

export default nextConfig;

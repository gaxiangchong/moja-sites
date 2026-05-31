import type { NextConfig } from "next";

/**
 * Product images are served by moja-member-app (the Member API). Allow that
 * origin so next/image can optimize remote product photos. The production host
 * is overridable via NEXT_PUBLIC_MEMBER_ASSET_BASE; localhost:3153 covers dev.
 */
function memberAssetRemotePattern() {
  const base = process.env.NEXT_PUBLIC_MEMBER_ASSET_BASE?.trim();
  if (!base) return null;
  try {
    const url = new URL(base);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/images/**",
    };
  } catch {
    return null;
  }
}

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

const remotePatterns = [
  { protocol: "https", hostname: "api.mojamaison.com", pathname: "/images/**" },
  {
    protocol: "http",
    hostname: "localhost",
    port: "3153",
    pathname: "/images/**",
  },
  memberAssetRemotePattern(),
].filter(Boolean) as RemotePattern[];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  images: {
    remotePatterns,
  },
};

export default nextConfig;

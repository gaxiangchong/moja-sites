import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Prisma runtime and its Postgres driver out of the bundle.
  // Required so Next.js doesn't try to webpack-bundle native bits of `pg`.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
  ],
};

export default nextConfig;

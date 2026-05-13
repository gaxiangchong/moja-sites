// Prisma 7 configuration.
// Loaded by the Prisma CLI for `generate`, `migrate dev`, `migrate deploy`,
// `db push`, and `studio`. Connection URL lives here (no longer in schema.prisma).
//
// Env loading order (matches Next.js convention):
//   1. .env.local   — developer overrides, gitignored
//   2. .env         — committed defaults (we don't currently have one)
//   3. process.env  — already populated on Render and other hosts
//
// `override: true` ensures .env.local wins over any stale env var that may
// be set in the developer's shell (a common foot-gun on Windows/PowerShell
// where DATABASE_URL can linger from a previous session). On Render, none of
// these files exist; the platform-injected process.env stays intact.

import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

loadEnv({ path: ".env.local", override: true });
loadEnv({ override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});

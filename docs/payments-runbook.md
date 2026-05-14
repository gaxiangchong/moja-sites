# Payments runbook

Phase-by-phase setup and operational notes for the moja-sites payment system.
This document grows as we ship later phases.

---

## Phase 1 — Postgres + schema foundation (Prisma 7)

What this phase ships:

- Prisma upgraded from 5.22 → 7.x. Required because the local CLI is
  already on v7 and v5 schema syntax fails validation.
- Driver adapter pattern: `@prisma/adapter-pg` + `pg` are now used by
  `PrismaClient` (v7 no longer supports the bare `new PrismaClient()`).
- Connection URL moved from `schema.prisma` to `prisma.config.ts` (v7
  requirement).
- Generated client moved out of `node_modules` and into
  `src/generated/prisma/` (v7 default). Imported from
  `@/generated/prisma/client`.
- Prisma datasource switched from SQLite to Postgres.
- New models: `Customer`, `Order`, `OrderLine`, `PaymentIntent`,
  `WebhookEvent`, `SalesPlayOutbox`.
- Existing `ShopHandoffConsume` migrated to Postgres.
- `src/app/sso/consume/route.ts` no longer falls back to in-memory replay
  storage (was a dev-only crutch).
- Build script now runs `prisma migrate deploy` on every Render build.

Nothing user-visible changes in this phase.

### 1a. Local dev setup (one-time per developer)

```powershell
# 1. Install dependencies (Prisma 7 + adapter-pg + pg + dotenv).
#    This is required because package.json now pins prisma@^7.8.0.
npm install

# 2. Start local Postgres
docker compose up -d

# 3. Wait for it to be healthy (a few seconds)
docker compose ps

# 4. Copy env example
Copy-Item .env.example .env.local

# 5. Generate the initial migration. Prisma will:
#    - load DATABASE_URL from prisma.config.ts (which reads .env.local)
#    - create the migration file at prisma/migrations/<ts>_init_payments_and_outbox/
#    - create prisma/migrations/migration_lock.toml (provider = postgresql)
#    - generate the runtime client at src/generated/prisma/
#    - apply the migration to the local DB
npx prisma migrate dev --name init_payments_and_outbox

# 6. Verify
npx prisma studio
# (browse the empty tables to confirm)

# 7. Commit the generated migration files (NOT src/generated/, which is gitignored)
git add prisma/migrations
git status   # should show migration_lock.toml + the new migration folder
```

> **Why `src/generated/` is gitignored:** Prisma 7 regenerates the client
> on every `prisma generate`. Committing it would create constant noise
> and merge conflicts. It's produced at build time on Render too.

### 1b. Render production setup (one-time)

**Step 1 — Create the database on the existing Postgres instance.**

Open a psql shell against your existing Render Postgres instance (the one
moja-member-app uses). Render dashboard → your Postgres instance →
**Connect** button → copy the external connection string for psql.

```sql
CREATE DATABASE moja_sites;
```

**Step 2 — Add `DATABASE_URL` to the moja-sites web service.**

Render dashboard → moja-sites web service → **Environment** tab → add:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/moja_sites?sslmode=require
```

Where `USER`, `PASSWORD`, `HOST` are the same as moja-member-app's
existing connection. Only the database name changes (`moja_sites`).

> **SSL mode**: Render's managed Postgres requires SSL. Use
> `?sslmode=require` (not `?sslmode=disable`). If you hit certificate
> issues, try `?sslmode=no-verify` (less strict but still TLS-encrypted).

**Step 3 — Deploy.**

Push the branch. Render builds it. The build command now runs:

```
prisma generate && prisma migrate deploy && next build
```

`prisma migrate deploy` is idempotent — it applies pending migrations and
no-ops if none exist. First deploy creates all tables; subsequent deploys
add only new migrations.

**Step 4 — Verify.**

After deploy, confirm:

- `/sso/consume?handoff=...` from moja-member-app still works
  (replay protection now uses the new Postgres table).
- Render logs show no Prisma errors on startup.

Optional sanity check via Render shell:

```bash
# In Render dashboard → moja-sites web service → Shell
npx prisma db pull --print | head -50
# Should list the new tables (customers, orders, ...).
```

### 1c. Rollback plan

If something goes wrong on Render:

1. Revert the deploy in Render (one-click via the Deploys tab).
2. The `moja_sites` database stays — it's empty in Phase 1, no data loss.
3. The previous SQLite-based SSO replay store is gone; replay protection
   for any in-flight handoff tokens is briefly bypassed. Acceptable —
   handoff tokens have short TTLs.

### 1d. Schema invariants to know

- **Money in sen** (Int). Don't introduce floats.
- **Order total invariant**:
  `total_cents = subtotal_cents + tax_cents - discount_cents`.
  Enforced in application code at order creation time; not a DB constraint.
- **Phone is E.164** for `Customer.phone`. Normalise at the API boundary;
  never store raw national-format strings.
- **OrderLine snapshots** (`product_name`, `unit_price_cents`) freeze the
  order against future catalog edits.
- **Tax columns** default to 0. Phase 1 does not compute SST. Future SST
  enablement is a code change, not a schema change.

---

## Phase 2 — SalesPlay HTTP client

Shipped files:

- `src/lib/salesplay/types.ts` — Request/response shapes for customers and online orders.
- `src/lib/salesplay/client.ts` — `SalesPlayClient` with Bearer auth against
  `https://api.salesplaypos.com/v1.0` ([API reference](https://developer.salesplay.com/)).
- `src/lib/salesplay/dateFormat.ts` — `Asia/Kuala_Lumpur` timestamps for SalesPlay fields.
- `src/lib/salesplay/pushOrder.ts` — Maps paid `Order` rows to **`POST /online_orders`**
  (SalesPlay’s channel for external web orders) and **`POST /customers`** for upsert.

Environment:

| Variable | Required | Purpose |
| --- | --- | --- |
| `SALESPLAY_ACCESS_TOKEN` | Yes (for sync) | Bearer token from SalesPlay Backoffice |
| `SALESPLAY_SHOP_ID` | Yes | Target shop id (from `GET /shops`) |
| `SALESPLAY_FALLBACK_PRODUCT_CODE` | Yes* | `product_code` on each line when `order_lines.salesplay_product_id` is null |
| `SALESPLAY_API_BASE_URL` | No | Default `https://api.salesplaypos.com/v1.0` |
| `SALESPLAY_ORDER_TYPE` | No | Default `Delivery` |
| `SALESPLAY_ORDER_PAYMENT_TYPE` | No | Default `Card` — must match an enabled payment type name in SalesPlay |
| `SALESPLAY_TARGET_TERMINAL` | No | Optional terminal id |
| `SALESPLAY_CHANNEL_ORDER_STATUS_ID` / `NAME` | No | Defaults `0` / `pending` per SalesPlay online-order docs; adjust if your channel uses different values |

\*Required unless every order line has `salesplay_product_id` populated (future catalog mapping).

---

## Phase 5 — Outbox processor (cron)

Endpoint: **`GET` or `POST` `/api/cron/process-outbox`**

Query: `limit` (1–50, default 10) — max outbox rows attempted per invocation.

Auth:

- `Authorization: Bearer <CRON_SECRET>` **or**
- Header `x-cron-secret: <CRON_SECRET>`

In **production**, `CRON_SECRET` must be set; otherwise the endpoint returns **401**.
In development, if `CRON_SECRET` is unset, requests are allowed (local testing only).

Behaviour:

- Claims `SalesPlayOutbox` rows in `pending` state (optimistic lock via `locked_until`).
- **`create_receipt`**: upsert customer, push **`/online_orders`**, save `orders.salesplay_receipt_id`
  from `success.system_unique_id`, refresh cached loyalty points when `salesplay_customer_id` is known.
- **`create_customer`** / **`update_customer`**: payload `{ "customerId": "<cuid>" }` — same customer upsert path.
- Failures: exponential backoff on `next_attempt_at` (up to 24 tries), then `failed` status with `last_error`.

Render: add a **Cron Job** service that curls the URL every 1–5 minutes with the bearer secret.

---

## Phase 4 — Xendit (reference)

Checkout: `POST /api/checkout/initiate`. Webhook: `POST /api/webhooks/xendit` (header `x-callback-token`).

---

## Phase 6 — Inbound SalesPlay webhooks

Endpoint: **`POST /api/webhooks/salesplay`**

SalesPlay sends JSON payloads with `merchant_id`, `type`, `created_at`, and an
event-specific array (`customers`, `receipts`, …). See
[SalesPlay webhook help](https://help.salesplay.com/help/webhook).

Auth (recommended in production):

- Shared secret in env **`SALESPLAY_WEBHOOK_SECRET`**, sent as
  **`x-salesplay-webhook-secret`** (or `x-webhook-secret`, or `Authorization: Bearer …`).

If the secret is unset, the handler accepts requests only outside production
(for local testing). **`SALESPLAY_MERCHANT_ID`** is optional; when set, the
handler rejects payloads whose `merchant_id` does not match (spoof protection).

Processing:

- Inserts into **`webhook_events`** with `source = salesplay` and a stable
  `external_id` for idempotency (retries are no-ops once `processed_at` is set).
- **`customers.update`**: updates `customers.loyalty_points_balance` /
  `loyalty_points_synced_at` when `total_points` is present; matches rows by
  `salesplay_customer_id`, **`moja_<localCustomerId>`** customer_code, or
  normalised Malaysian phone.
- **`receipts.update`**: reads nested customer data when present and applies the
  same loyalty cache refresh (receipts often follow a sale that changed points).

Other event types (`inventory_levels.update`, `products.update`, …) are stored
and marked processed without side effects.

Register two webhook URLs in SalesPlay (one per event type), both pointing to
`https://<your-domain>/api/webhooks/salesplay`.

---

## Phase 7+ (still to ship)

- Admin UI + transactional emails.

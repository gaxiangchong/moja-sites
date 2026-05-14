# moja-sites architecture

A 1-page summary of how this app fits together and why.

## Scope

moja-sites is a **standalone storefront** for pre-booked whole cakes (24h+
lead time). Customers browse the catalog, pick a pickup date + 2-hour slot,
pay online via Xendit, and receive a confirmation. In-store / walk-in sales
are handled by SalesPlay's own web store and POS — not by this app.

A separate app, **moja-member-app**, exists alongside but is out of scope
for storefront payment flow. SSO from moja-member-app into moja-sites is
preserved via `/sso/consume`. A future lean member app for read-only
loyalty checking is enabled by the cached points columns on `Customer`.

## Systems

```
              ┌─────────────────────────────────────┐
              │  SalesPlay  (POS + Web Store)       │
              │  - master customer DB               │
              │  - master loyalty (point-based)     │
              │  - in-store sales                   │
              │  - product catalog + inventory      │
              └────────────┬────────────────────────┘
                           │  REST: api.salesplaypos.com/v1.0
                           │  Webhooks: 5 event types
                           ▼
              ┌─────────────────────────────────────┐
              │  moja-sites  (Next.js, Render)      │
              │  ─────────────────────────────────  │
              │  Public storefront:                 │
              │    catalog, cart (LS), checkout     │
              │  Server:                            │
              │    Route handlers under /api/*      │
              │    Postgres via Prisma              │
              │    Outbox for SalesPlay pushes      │
              │    Cron worker (Render Cron Job)    │
              └─────────────────────────────────────┘
```

## Source of truth

| Data | Source of truth | Local representation |
| --- | --- | --- |
| Customer identity (phone, name) | moja-sites | `customers` |
| Loyalty points + tier | SalesPlay | `customers.loyalty_points_balance` (cache) |
| Product catalog | moja-sites JSON (Phase 1) → SalesPlay (Phase 3) | `config/products.catalog.json` |
| Orders / receipts | moja-sites (we initiate, then notify SalesPlay) | `orders` |
| Payments | Xendit | `payment_intents` |

## Order lifecycle

1. **Customer** selects products, fills name/phone/email, picks pickup
   date + 2-hour slot, submits.
2. **`POST /api/checkout/initiate`** (Phase 4) re-prices server-side,
   creates `Order` (status `pending`) + `PaymentIntent`, calls Xendit,
   returns redirect URL.
3. **Xendit hosted page** captures payment.
4. **`POST /api/webhooks/xendit`** receives `payment.succeeded`. Inserts a
   `WebhookEvent` row (idempotency). Marks `Order.status = paid`. Inserts
   a `SalesPlayOutbox` row (`kind = create_receipt`).
5. **Cron worker** (Render Cron Job pinging **`GET` or `POST`
   `/api/cron/process-outbox`**, with `Authorization: Bearer $CRON_SECRET` or
   header `x-cron-secret`) claims pending outbox rows with `locked_until`,
   calls SalesPlay (`POST /customers` then **`POST /online_orders`** per
   [SalesPlay API](https://developer.salesplay.com/)), stores
   `orders.salesplay_receipt_id` (`system_unique_id`) and best-effort
   refreshes `customers.loyalty_points_balance` via `GET /customers`.
6. **SalesPlay webhooks** (`POST /api/webhooks/salesplay`) receive
   `customers.update` / `receipts.update` ([webhook overview](https://help.salesplay.com/help/webhook)),
   dedupe via `webhook_events`, and refresh cached loyalty points when payloads
   include `total_points` (and link `salesplay_customer_id` when known).
7. **Customer** receives confirmation email; bakery receives internal
   alert; `/admin/orders` shows pending fulfillment.
8. **Bakery** marks `Order.fulfilled` on pickup.

## Checkout → payment → SalesPlay (sequence)

End-to-end view for a **first-time** shopper (new row in our `customers`, then
SalesPlay is notified after pay). **Loyalty points** are awarded by **SalesPlay’s
rules** when the online order is accepted; moja-sites **syncs** IDs and a
**cached** `loyalty_points_balance`. **Receipt layout** (including whether points
print on the slip) is **SalesPlay’s** template, not this app.

```mermaid
sequenceDiagram
  autonumber
  actor Shopper
  participant Browser
  participant Moja as moja-sites
  participant DB as Postgres
  participant X as Xendit
  participant SP as SalesPlay API
  participant Cron as Cron job

  Shopper->>Browser: Cart, name, phone, email, pickup slot
  Browser->>Moja: POST /api/checkout/initiate
  Moja->>DB: Upsert Customer, insert Order pending, PaymentIntent
  Moja->>X: Create payment session
  X-->>Browser: Redirect URL
  Shopper->>X: Pay on hosted page
  X->>Moja: POST /api/webhooks/xendit paid event
  Moja->>DB: WebhookEvent dedupe, Order paid, enqueue SalesPlayOutbox

  Note over Shopper,Moja: Shopper can return immediately; SalesPlay push is async

  Cron->>Moja: GET or POST /api/cron/process-outbox
  Moja->>SP: POST /customers upsert
  Moja->>SP: POST /online_orders
  SP-->>Moja: success.system_unique_id
  Moja->>DB: orders.salesplay_receipt_id, cache points if resolvable

  SP->>Moja: POST /api/webhooks/salesplay optional
  Moja->>DB: webhook_events dedupe, refresh loyalty cache
```

Steps 7–8 in **Order lifecycle** (confirmation email, admin, fulfilment) are
not shown above; they are the next phase of product work.

## Design rules

- **Money** is always `Int` in sen. Invariant on `Order`:
  `total_cents = subtotal_cents + tax_cents - discount_cents`.
- **Order line snapshots**: `product_name`, `unit_price_cents` are frozen
  at order creation. Catalog edits don't rewrite history.
- **Webhook idempotency**: every inbound webhook is recorded by
  `(source, external_id)` before processing. Retries become no-ops.
- **Async to SalesPlay**: never block a user request on SalesPlay. All
  outbound calls go through `SalesPlayOutbox`. Customer's checkout
  succeeds even when SalesPlay is down.
- **Server re-prices everything**: never trust client-sent prices or
  pickup dates. UI is a hint; server is the gate.
- **Phone is the loyalty key**: customer is keyed on E.164 phone (unique).
  SalesPlay matches the same way.

## Stack notes

- **Prisma 7** with the `prisma-client` generator. Connection URL lives in
  `prisma.config.ts`. Runtime client imported from
  `@/generated/prisma/client` (regenerated by `prisma generate`).
- **Postgres driver**: `@prisma/adapter-pg` wrapping `pg` (node-postgres).
  Required by Prisma 7's `PrismaClient` constructor.
- **Externals**: `pg`, `@prisma/adapter-pg`, `@prisma/client` are in
  `serverExternalPackages` so Next.js doesn't try to bundle them.

## Phases

| Phase | Status | Deliverable |
| --- | --- | --- |
| 1 | shipped here | Postgres schema, outbox, SSO migration off SQLite, Prisma 7 upgrade |
| 2 | shipped here | SalesPlay HTTP client + types (`src/lib/salesplay/*`) |
| 3 | optional | Catalog pulled from SalesPlay |
| 4 | shipped here | Checkout API + Xendit webhooks |
| 5 | shipped here | Outbox processor cron (`/api/cron/process-outbox`) |
| 6 | shipped here | Inbound SalesPlay webhooks (`/api/webhooks/salesplay`) |
| 7 | next | Admin orders + transactional emails |
| 8 | last | Hardening: Sentry, rate limits, integration tests |

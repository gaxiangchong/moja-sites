# Run moja-sites on Render (web + PostgreSQL)

Step-by-step checklist to deploy this Next.js app on [Render](https://render.com/) with **Render PostgreSQL**, including payments (Xendit), SalesPlay sync, and the outbox cron.

For deeper payment and SalesPlay behaviour, see [`payments-runbook.md`](payments-runbook.md) and [`architecture.md`](architecture.md).

---

## 1. Prerequisites

- A Render account and a Git repository Render can pull from (GitHub/GitLab/Bitbucket).
- **Xendit** account: secret key + webhook verification token ([Xendit Dashboard](https://dashboard.xendit.co/), API keys and webhook settings).
- **SalesPlay** account: REST access token, shop id, a fallback product code for online orders, and (recommended) webhook secret + merchant id from payloads ([SalesPlay](https://developer.salesplay.com/), [webhook help](https://help.salesplay.com/help/webhook)).
- A **public HTTPS URL** for your Render service (Render gives you `*.onrender.com` or your custom domain). Xendit and SalesPlay must reach your webhooks over the internet.

---

## 2. Create PostgreSQL on Render

1. In the Render dashboard: **New +** → **PostgreSQL**.
2. Choose a name, region, and plan. Create the database.
3. After it is ready, open the Postgres **Info** (or **Connect**) tab.
4. Copy the **Internal Database URL** if your **Web Service** will run in the **same region** (recommended). Otherwise use the **External** URL.
5. Ensure the URL works with TLS. Render URLs usually include `sslmode=require`. Keep the full string as provided.

You can use the default database name Render creates (no need for a separate `CREATE DATABASE` unless you manage Postgres yourself).

---

## 3. Create the Web Service (Next.js)

1. **New +** → **Web Service** → connect your repo.
2. **Settings** (adjust to match your repo):

   | Setting | Typical value |
   |---------|----------------|
   | **Runtime** | Node |
   | **Build command** | `npm install && npm run build` |
   | **Start command** | `npm start` |
   | **Root directory** | Repository root (unless this app lives in a subfolder) |

3. **Instance type**: choose a plan that fits traffic (free tier can sleep; paid tiers avoid cold starts).

4. **Node version**: this project expects **Node ≥ 20.19** (see `package.json` `engines`). On Render, set env **`NODE_VERSION`** to `20.19.0` (or newer LTS you prefer) on the Web Service so the build matches.

5. **Link the database**: in the Web Service → **Environment** → **Link database** and select your Render Postgres. Render injects **`DATABASE_URL`** automatically. If you paste the URL manually instead, use the same value as in the Postgres dashboard.

6. Do **not** commit production secrets; set them only in Render **Environment** (see section 5).

7. Deploy. The build runs:

   ```text
   prisma generate && prisma migrate deploy && next build
   ```

   First deploy applies all migrations under `prisma/migrations/`. If the build fails on Prisma, confirm `DATABASE_URL` is present for the **build** environment (Render passes linked env vars to builds by default).

---

## 4. Custom domain (optional)

1. Web Service → **Settings** → **Custom Domain** → add your domain and follow DNS instructions.
2. Set **`XENDIT_PUBLIC_BASE_URL`** (and any other “public base URL” envs) to **`https://your-domain.com`** with no trailing slash, so Xendit return URLs and documentation match production.

---

## 5. Environment variables (Render Web Service)

Add these in **Environment** for the Web Service. Values are never committed to git.

### Required for the app and database

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Usually auto-injected when Postgres is linked. Must be available at **build** and **runtime**. |

### Xendit (checkout + webhooks)

| Variable | Purpose |
|----------|---------|
| `XENDIT_SECRET_KEY` | Server-side API secret from Xendit. |
| `XENDIT_WEBHOOK_TOKEN` | Verifies `x-callback-token` on **`POST /api/webhooks/xendit`**. **Required in production** (the route returns 503 if missing when `NODE_ENV=production`). |
| `XENDIT_PUBLIC_BASE_URL` | Your public site origin, e.g. `https://shop.example.com`. Used for payment success/cancel return URLs. |

### SalesPlay (outbound sync after payment)

| Variable | Purpose |
|----------|---------|
| `SALESPLAY_ACCESS_TOKEN` | Bearer token from SalesPlay Backoffice → Integrations → Access Token. |
| `SALESPLAY_SHOP_ID` | From `GET https://api.salesplaypos.com/v1.0/shops` (or your backoffice). |
| `SALESPLAY_FALLBACK_PRODUCT_CODE` | SalesPlay `product_code` used for order lines that do not have `salesplay_product_id` set. |

Optional (defaults usually fine; tune if SalesPlay rejects payloads):

- `SALESPLAY_API_BASE_URL` — default `https://api.salesplaypos.com/v1.0`
- `SALESPLAY_ORDER_TYPE` — default `Delivery`
- `SALESPLAY_ORDER_PAYMENT_TYPE` — default `Card` (must match an enabled payment type name in SalesPlay)
- `SALESPLAY_TARGET_TERMINAL` — if SalesPlay requires a terminal id
- `SALESPLAY_CHANNEL_ORDER_STATUS_ID` / `SALESPLAY_CHANNEL_ORDER_STATUS_NAME` — defaults `0` / `pending` per SalesPlay online-order docs

### SalesPlay inbound webhooks

| Variable | Purpose |
|----------|---------|
| `SALESPLAY_WEBHOOK_SECRET` | Shared secret; caller must send `x-salesplay-webhook-secret`, `x-webhook-secret`, or `Authorization: Bearer …`. **Required in production** for `POST /api/webhooks/salesplay`. |
| `SALESPLAY_MERCHANT_ID` | Optional; if set, must match `merchant_id` in each webhook JSON (spoof protection). |

### Outbox cron (SalesPlay push worker)

| Variable | Purpose |
|----------|---------|
| `CRON_SECRET` | Long random string. **`GET` or `POST /api/cron/process-outbox`** requires `Authorization: Bearer <CRON_SECRET>` or header `x-cron-secret: <CRON_SECRET>`. **Required in production**. |

### SSO from moja-member-app (if you use handoff)

| Variable | Purpose |
|----------|---------|
| `SHOP_HANDOFF_JWT_SECRET` | Shared secret for JWT verification. |
| `SHOP_HANDOFF_ISSUER` | Issuer claim for shop handoff tokens. |
| `SHOP_HANDOFF_AUDIENCE` | Optional; default `shop`. |

See [`.env.example`](../.env.example) for a flat list.

---

## 6. Xendit dashboard configuration

1. In Xendit, set the webhook URL to:

   `https://<your-render-host>/api/webhooks/xendit`

2. Configure the **callback verification token** to match **`XENDIT_WEBHOOK_TOKEN`**.
3. Use **test** keys until you are ready to go live, then swap to live keys and update Render env vars.

---

## 7. SalesPlay configuration

### Outbound (your site → SalesPlay)

No extra “toggle” beyond valid **`SALESPLAY_*`** env vars and the **cron** (next section). After a payment is marked paid, the outbox row is processed by the cron job.

### Inbound webhooks (SalesPlay → your site)

SalesPlay allows **one event type per webhook URL**. Register **two** webhooks (same path is fine), both pointing to:

`https://<your-render-host>/api/webhooks/salesplay`

- Event **customers.update**
- Event **receipts.update**

Configure the shared secret in SalesPlay (if their UI supports a header or secret) to match **`SALESPLAY_WEBHOOK_SECRET`**, or rely on your app only checking the headers documented in [`payments-runbook.md`](payments-runbook.md) Phase 6.

---

## 8. Render Cron Job (process SalesPlay outbox)

Without this, orders stay **paid** in your DB but **never push** to SalesPlay.

1. **New +** → **Cron Job**.
2. **Command** (example; replace host and secret):

   ```bash
   curl -fsS -X POST "https://<your-render-host>/api/cron/process-outbox?limit=10" \
     -H "Authorization: Bearer <CRON_SECRET>"
   ```

   Alternatively use header:

   ```bash
   curl -fsS -X POST "https://<your-render-host>/api/cron/process-outbox?limit=10" \
     -H "x-cron-secret: <CRON_SECRET>"
   ```

3. **Schedule**: every **1–5 minutes** is reasonable (e.g. `*/2 * * * *` for every 2 minutes in cron syntax—confirm against Render’s cron UI).
4. Put the same **`CRON_SECRET`** value in the **Web Service** env (already done in section 5) and embed it only in this curl command’s URL/header (Cron Job env vars on Render can hold the secret if you prefer not to inline it).

---

## 9. Smoke test after deploy

1. **Health**: open `https://<your-host>/` and a static page (e.g. `/shop`).
2. **Checkout**: run a **test** payment; confirm redirect back and order flow in logs.
3. **Database**: in Render Postgres, or via `npx prisma studio` locally against a read-only copy, confirm `orders`, `payment_intents`, `webhook_events` rows.
4. **Xendit webhook**: after pay, confirm `webhook_events` has a **xendit** row and order status **paid**.
5. **Cron**: trigger the cron once manually or wait for schedule; confirm **`salesplay_outbox`** rows move to **done** (or inspect logs for `[webhooks` / outbox errors).
6. **SalesPlay**: confirm customer and online order appear in SalesPlay backoffice.
7. **SalesPlay webhook**: trigger a test notification from SalesPlay; confirm **200** response and `webhook_events` with **salesplay** source.

---

## 10. Common issues

| Symptom | Things to check |
|---------|-------------------|
| Build fails on Prisma | `DATABASE_URL` available at build time; Node version ≥ 20.19. |
| Checkout 503 | `XENDIT_SECRET_KEY` missing or wrong. |
| Payment succeeds but order never paid | Xendit webhook URL/token wrong; check Render logs for `/api/webhooks/xendit`. |
| Order paid but SalesPlay empty | Cron not running, `CRON_SECRET` mismatch, or `SALESPLAY_*` / `SALESPLAY_FALLBACK_PRODUCT_CODE` / `SALESPLAY_SHOP_ID` misconfigured—check Web Service logs when cron hits `process-outbox`. |
| SalesPlay webhooks 401 | `SALESPLAY_WEBHOOK_SECRET` not set in production or header mismatch. |

---

## 11. Local development (optional)

Use Docker Postgres and `.env.local` as described in [`payments-runbook.md`](payments-runbook.md) Phase 1a. That flow is separate from Render but keeps the same env variable names.

---

## Summary checklist

- [ ] Render **PostgreSQL** created and **linked** to the Web Service (`DATABASE_URL`).
- [ ] Web Service **build** / **start** commands and **Node 20+** set.
- [ ] **`XENDIT_*`** and **`XENDIT_PUBLIC_BASE_URL`** set; Xendit webhook URL registered.
- [ ] **`SALESPLAY_*`** outbound vars set; fallback product code and shop id verified.
- [ ] **`CRON_SECRET`** set on Web Service; **Cron Job** calls `process-outbox` on a schedule.
- [ ] **`SALESPLAY_WEBHOOK_SECRET`** set; two SalesPlay webhooks point at `/api/webhooks/salesplay`.
- [ ] SSO env vars set if you use `/sso/consume` from member-app.
- [ ] Smoke test: pay → webhook → cron → SalesPlay → optional inbound webhook.

When this is green, the **integration path** described in [`architecture.md`](architecture.md) is operational on Render. **Confirmation emails and admin UI** are still Phase 7 work if you need them for operations.

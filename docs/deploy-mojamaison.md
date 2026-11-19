# Deploying mojamaison.com (moja-sites)

## Catalog (Option B — member-app is source of truth)

1. Edit products in **moja-member-app** `data/shop-catalog.products.json` and `data/shop-catalog.layout.json`.
2. Add images under **moja-sites** `public/images/products/`.
3. Run `npm run catalog:pull` in moja-sites (updates fallback JSON for builds).
4. Deploy **member-app** first, then **moja-sites** with:

```env
MEMBER_API_BASE_URL=https://api.mojamaison.com
MEMBER_API_TIMEOUT_MS=2500
CATALOG_CACHE_SECONDS=300
```

The storefront caches catalog API responses for **5 minutes** (`CATALOG_CACHE_SECONDS`). After deploy, the first page load may still call the API; later loads should be fast.

> **Prices.** The member-app admin is the single source. Prices now render on
> the storefront, so a stale fallback would publish a price you no longer
> charge. The site therefore **hides prices in production whenever the catalog
> came from `products.catalog.json` instead of the API** — check
> `npm run catalog:check` and your `MEMBER_API_BASE_URL` if prices go missing.
> See `docs/seo-and-aeo.md` for the full chain.

If every page load stays slow (10s+), Hostinger may not reach `api.mojamaison.com`. Test from the host’s shell:

```bash
curl -sS -o /dev/null -w "%{http_code} %{time_total}s\n" https://api.mojamaison.com/shop/catalog/bundle
```

If that hangs or takes many seconds, use fast fallback until networking is fixed:

```env
CATALOG_SOURCE=local
```

Then run `npm run catalog:pull` before each deploy (snapshot from member-app `data/`).

Do not use `CATALOG_SOURCE=local` in production unless you intentionally bypass the API.

See `moja-member-app/docs/shop-catalog.md`.

---

## Request timeout / 503 on the homepage

The shop loads product data on every page. If **`MEMBER_API_BASE_URL`** points at a URL the server cannot reach (very common: `http://localhost:3153` copied from dev), Node `fetch` used to **hang** until the hosting gateway timed out.

The app now:

- Uses a **5s timeout** on member API calls (`MEMBER_API_TIMEOUT_MS` to override).
- **Skips** localhost member API URLs in **production** and serves `config/products.catalog.json` instead.
- Falls back to the local JSON catalog when the API errors or times out.

### Fix on your host (pick one)

**Option A — Storefront only (fastest)**  
Unset `MEMBER_API_BASE_URL` on **moja-sites**, or set:

```env
CATALOG_SOURCE=local
```

Redeploy. The site uses `config/products.catalog.json` + images in `public/images/products/`.

**Option B — Live catalog from member API**  
Set a **public** Nest API URL (not localhost):

```env
MEMBER_API_BASE_URL=https://api.your-member-backend.example.com
```

Ensure that host serves:

- `GET /shop/catalog/products`
- `GET /shop/catalog/layout`

**Option C — Misconfigured localhost**  
Remove any production value like `http://localhost:3153` from moja-sites env vars.

---

## Environment variables (moja-sites)

| Variable | Required | Notes |
|----------|----------|--------|
| `CATALOG_SOURCE` | No | `local` = JSON only; `member` = always try API (with timeout + fallback) |
| `MEMBER_API_BASE_URL` | For member catalog / checkout | Public Nest API base URL, no trailing slash |
| `MEMBER_API_TIMEOUT_MS` | No | Default `5000` |
| `DATABASE_URL` | For SSO replay only | SQLite file URL or Postgres; SSO works without it (in-memory dev only) |
| `SHOP_HANDOFF_JWT_SECRET` | For SSO | Must match member-app |

---

## member-app must be reachable separately

- **moja-sites** = marketing site (mojamaison.com).
- **member-app Nest API** = catalog + checkout handoff (often another subdomain).

Redeploying member-app does not fix mojamaison.com unless `MEMBER_API_BASE_URL` on moja-sites points to that **live** API URL.

---

## Ordering links to the member app (the "Order in app" buttons)

Every "Order in app" button, and the header CTA, is controlled by one env var:

```env
NEXT_PUBLIC_ORDERING_ENABLED=false   # buttons become inert and show the
                                     # "not open yet" alert instead
```

The default is **enabled**. Only the literal string `false` blocks ordering,
so the var is normally absent. To unlock ordering:

1. In the hosting dashboard, **delete** `NEXT_PUBLIC_ORDERING_ENABLED`, or set
   it to `true`.
2. Trigger a **new deploy**. This is not optional — `NEXT_PUBLIC_*` values are
   baked into the JavaScript at build time, so restarting the server keeps the
   old value.
3. Verify from any machine:

```bash
# unlocked: prints a number above zero. blocked: prints 0
curl -s https://mojamaison.com/shop | grep -c 'app\.mojamaison\.com'
```

Nothing in this repo sets the var, so if ordering is blocked in production but
works locally, the value is in the hosting dashboard.

Blocking ordering also redirects `/cart` and `/checkout` to `/shop`.

---

## After changing env vars

1. Save env in hosting dashboard (Render / Hostinger / Vercel).
2. Trigger a **new deploy** (restart alone may not reload env).
3. Open `https://mojamaison.com/` — should load in a few seconds, not 30+.

## Verify locally

```powershell
# Local catalog only (no member API)
$env:CATALOG_SOURCE="local"
npm run dev
```

```powershell
# With member API
$env:MEMBER_API_BASE_URL="http://127.0.0.1:3153"
npm run dev
```

/**
 * Refresh config/products.catalog.json from the member-app catalog (Option B).
 *
 * Reads moja-member-app/data/shop-catalog.*.json (default: ../moja-member-app/data)
 * or fetches GET /shop/catalog/* when MEMBER_API_BASE_URL is set and --from-api is passed.
 *
 * Usage:
 *   npm run catalog:pull
 *   MEMBER_API_BASE_URL=https://api.example.com npm run catalog:pull -- --from-api
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sitesRoot = resolve(__dirname, "..");

function formatRm(cents) {
  return `RM${(cents / 100).toFixed(2)}`;
}

function variantPrice(v) {
  if (v.priceDisplay?.trim()) return v.priceDisplay.trim();
  if (v.available === false || v.priceCents <= 0) return null;
  return formatRm(v.priceCents);
}

function memberProductToSites(p) {
  const images =
    p.images?.length > 0
      ? p.images
      : p.imageUrl?.trim()
        ? [{ src: p.imageUrl, alt: p.name }]
        : [];

  const variants = p.variants?.map((v) => ({
    label: v.label,
    price: variantPrice(v),
    available: v.available !== false && Boolean(variantPrice(v)),
  }));

  return {
    slug: p.id,
    name: p.name,
    price: p.priceDisplay?.trim() || formatRm(p.basePriceCents ?? 0),
    category: p.categoryLabel || "Premium Cake",
    images,
    summary: p.description || p.shortDescription || "",
    shortDescription: p.shortDescription,
    badge: p.badge,
    soldOut: p.soldOut,
    ...(variants?.length ? { variants } : {}),
  };
}

function buildSitesCatalog(products, layout) {
  const active = products.filter((p) => p.isActive !== false);
  return {
    $schemaNote:
      "AUTO-GENERATED fallback snapshot. Edit catalog in moja-member-app/data/shop-catalog.products.json and shop-catalog.layout.json, then run: npm run catalog:pull (in moja-sites). Live site uses Member API when MEMBER_API_BASE_URL is set.",
    homeFeaturedSlugs: layout.homeFeaturedProductIds ?? [],
    shopSections: (layout.shopSections ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      productSlugs: s.productIds ?? [],
    })),
    products: active.map(memberProductToSites),
  };
}

async function loadFromDataDir(dataDir) {
  const products = JSON.parse(
    readFileSync(resolve(dataDir, "shop-catalog.products.json"), "utf-8"),
  );
  const layout = JSON.parse(
    readFileSync(resolve(dataDir, "shop-catalog.layout.json"), "utf-8"),
  );
  return buildSitesCatalog(products, layout);
}

async function loadFromApi(base) {
  const root = base.replace(/\/$/, "");
  const timeoutMs = Number(process.env.MEMBER_API_TIMEOUT_MS) || 5000;
  const headers = { Accept: "application/json" };

  async function getJson(path) {
    const res = await fetch(`${root}${path}`, {
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json();
  }

  const [products, layout] = await Promise.all([
    getJson("/shop/catalog/products"),
    getJson("/shop/catalog/layout"),
  ]);
  return buildSitesCatalog(products, layout);
}

const fromApi = process.argv.includes("--from-api");
const dataDir =
  process.env.MOJA_MEMBER_DATA_DIR?.trim() ||
  resolve(sitesRoot, "..", "moja-member-app", "data");

let catalog;
if (fromApi) {
  const base = process.env.MEMBER_API_BASE_URL?.trim();
  if (!base) {
    console.error("MEMBER_API_BASE_URL is required with --from-api");
    process.exit(1);
  }
  catalog = await loadFromApi(base);
  console.log(`Pulled catalog from API ${base}`);
} else {
  catalog = await loadFromDataDir(dataDir);
  console.log(`Pulled catalog from ${dataDir}`);
}

const outPath = resolve(sitesRoot, "config", "products.catalog.json");
mkdirSync(resolve(sitesRoot, "config"), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf-8");
console.log(`Wrote ${outPath} (${catalog.products.length} products)`);

/**
 * Verify that what the storefront serves matches what the admin configured.
 *
 * Fetches the live member catalog (the same endpoint the website reads) and
 * compares it against config/products.catalog.json, the fallback snapshot.
 * Any drift reported here is what visitors would see if the site ever falls
 * back to the snapshot — a stale price, a cake the admin removed, or a new
 * cake the snapshot does not know about.
 *
 * Usage:
 *   npm run catalog:check
 *   MEMBER_API_BASE_URL=https://api.mojamaison.com npm run catalog:check
 *
 * Exits 1 when drift is found, so CI or a deploy script can gate on it.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const sitesRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const API_BASE = (
  process.env.MEMBER_API_BASE_URL?.trim() || "https://api.mojamaison.com"
).replace(/\/$/, "");

function formatRm(cents) {
  return `RM${(cents / 100).toFixed(2)}`;
}

function variantPrice(v) {
  if (v.priceDisplay?.trim()) return v.priceDisplay.trim();
  if (v.available === false || v.priceCents <= 0) return null;
  return formatRm(v.priceCents);
}

/** One comparable price string per product: base plus every variant. */
function priceSignature(product) {
  const base =
    product.price ?? product.priceDisplay?.trim() ?? formatRm(product.basePriceCents ?? 0);
  const variants = (product.variants ?? [])
    .map((v) => {
      const price = "priceCents" in v ? variantPrice(v) : v.price;
      return `${v.label}=${price ?? "n/a"}`;
    })
    .sort()
    .join(", ");
  return variants ? `${base} [${variants}]` : base;
}

async function fetchLiveCatalog() {
  const url = `${API_BASE}/shop/catalog/bundle`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) {
    throw new Error(`${url} returned HTTP ${res.status}`);
  }
  const data = await res.json();
  const products = Array.isArray(data.products) ? data.products : [];
  return products.filter((p) => p.isActive !== false);
}

function readSnapshot() {
  const path = resolve(sitesRoot, "config/products.catalog.json");
  return JSON.parse(readFileSync(path, "utf8")).products ?? [];
}

async function main() {
  console.log(`Live catalog : ${API_BASE}/shop/catalog/bundle`);
  console.log(`Snapshot     : config/products.catalog.json\n`);

  let live;
  try {
    live = await fetchLiveCatalog();
  } catch (err) {
    console.error(`✗ Could not reach the member API: ${err.message}`);
    console.error(
      "\n  The website falls back to the snapshot whenever this happens, so\n" +
        "  fix connectivity before trusting what the storefront shows.",
    );
    process.exit(1);
  }

  const snapshot = readSnapshot();
  const liveById = new Map(live.map((p) => [p.id, p]));
  const snapshotBySlug = new Map(snapshot.map((p) => [p.slug, p]));

  const problems = [];

  for (const [id, product] of liveById) {
    const snap = snapshotBySlug.get(id);
    if (!snap) {
      problems.push(`+ ${id}: in admin, missing from snapshot`);
      continue;
    }
    const livePrice = priceSignature(product);
    const snapPrice = priceSignature(snap);
    if (livePrice !== snapPrice) {
      problems.push(
        `~ ${id}: price drift\n    admin    ${livePrice}\n    snapshot ${snapPrice}`,
      );
    }
    if ((product.name ?? "") !== (snap.name ?? "")) {
      problems.push(
        `~ ${id}: name drift — admin "${product.name}" vs snapshot "${snap.name}"`,
      );
    }
    if (Boolean(product.soldOut) !== Boolean(snap.soldOut)) {
      problems.push(
        `~ ${id}: availability drift — admin soldOut=${Boolean(product.soldOut)}, snapshot soldOut=${Boolean(snap.soldOut)}`,
      );
    }
  }

  for (const slug of snapshotBySlug.keys()) {
    if (!liveById.has(slug)) {
      problems.push(`- ${slug}: in snapshot, not active in admin`);
    }
  }

  console.log(`Admin products: ${liveById.size}   Snapshot products: ${snapshotBySlug.size}\n`);

  if (problems.length === 0) {
    console.log("✓ Snapshot matches the admin catalog.");
    return;
  }

  console.log(`✗ ${problems.length} difference(s):\n`);
  for (const p of problems) console.log(`  ${p}`);
  console.log(
    "\n  Run `npm run catalog:pull` to refresh the snapshot, then redeploy.\n" +
      "  Until then the site shows these snapshot values whenever the API is\n" +
      "  unreachable (prices are hidden in production in that case).",
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

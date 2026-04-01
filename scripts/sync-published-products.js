// scripts/sync-published-products.js
// Usage:
//   node scripts/sync-published-products.js --dry-run
//   node scripts/sync-published-products.js
//   node scripts/sync-published-products.js --source ./scripts/published-products.json
//   node scripts/sync-published-products.js --source https://example.com/publish/products.json
require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const CATEGORY_SET = new Set(["seeds", "nutrients", "smart-pots"]);

function argValue(flag) {
  const idx = process.argv.findIndex((v) => v === flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function normalizeProduct(raw) {
  if (!raw || typeof raw !== "object") return null;

  const item = raw;
  const slug = typeof item.slug === "string" ? item.slug.trim() : "";
  const name = typeof item.name === "string" ? item.name.trim() : "";
  const category = typeof item.category === "string" ? item.category.trim() : "";
  const price = Number(item.price);

  if (!slug || !name || !CATEGORY_SET.has(category) || !Number.isFinite(price)) return null;

  const salePrice = Number(item.salePrice);
  const stock = Number(item.stock);
  const rating = Number(item.rating);
  const reviewCount = Number(item.reviewCount);

  return {
    slug,
    name,
    category,
    price,
    salePrice: Number.isFinite(salePrice) ? salePrice : undefined,
    images: Array.isArray(item.images) ? item.images.filter((x) => typeof x === "string" && x.trim()) : [],
    shortDescription: typeof item.shortDescription === "string" ? item.shortDescription.trim() : "",
    description: typeof item.description === "string" ? item.description.trim() : "",
    highlights: Array.isArray(item.highlights) ? item.highlights.filter((x) => typeof x === "string" && x.trim()) : [],
    whatsInTheBox: Array.isArray(item.whatsInTheBox) ? item.whatsInTheBox.filter((x) => typeof x === "string" && x.trim()) : [],
    compatibility: Array.isArray(item.compatibility) ? item.compatibility.filter((x) => typeof x === "string" && x.trim()) : [],
    specs: item.specs && typeof item.specs === "object" ? item.specs : {},
    warrantyMonths: Number.isFinite(Number(item.warrantyMonths)) ? Number(item.warrantyMonths) : 0,
    shipping: item.shipping && typeof item.shipping === "object" ? item.shipping : {},
    faqs: Array.isArray(item.faqs)
      ? item.faqs
          .filter((f) => f && typeof f.question === "string" && typeof f.answer === "string")
          .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
      : [],
    stock: Number.isFinite(stock) ? stock : 0,
    rating: Number.isFinite(rating) ? rating : 0,
    reviewCount: Number.isFinite(reviewCount) ? reviewCount : 0,
    tags: Array.isArray(item.tags) ? item.tags.filter((x) => typeof x === "string" && x.trim()) : [],
  };
}

async function loadPublishedProducts(sourcePathOrUrl) {
  if (/^https?:\/\//i.test(sourcePathOrUrl)) {
    const res = await fetch(sourcePathOrUrl);
    if (!res.ok) throw new Error(`Cannot fetch source: HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data.products;
  }

  const abs = path.isAbsolute(sourcePathOrUrl)
    ? sourcePathOrUrl
    : path.join(process.cwd(), sourcePathOrUrl);
  const text = fs.readFileSync(abs, "utf8");
  const data = JSON.parse(text);
  return Array.isArray(data) ? data : data.products;
}

async function main() {
  const dryRun = hasFlag("--dry-run");
  const source = argValue("--source") || "scripts/published-products.json";

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "AIoT";
  if (!uri) throw new Error("Missing MONGODB_URI in .env.local");

  const rawProducts = await loadPublishedProducts(source);
  if (!Array.isArray(rawProducts)) throw new Error("Source data must be an array of products");

  const normalized = rawProducts.map(normalizeProduct).filter(Boolean);
  if (normalized.length === 0) {
    console.log("No valid published products found in source.");
    return;
  }

  await mongoose.connect(uri, { dbName });
  const col = mongoose.connection.collection("products");

  const sourceSlugs = normalized.map((p) => p.slug);
  const existing = await col.find({ slug: { $in: sourceSlugs } }, { projection: { slug: 1 } }).toArray();
  const existingSet = new Set(existing.map((x) => x.slug));

  const missing = normalized.filter((p) => !existingSet.has(p.slug));

  console.log(`Source products: ${normalized.length}`);
  console.log(`Existing in DB: ${existing.length}`);
  console.log(`Missing products: ${missing.length}`);
  if (missing.length > 0) {
    console.log("Missing slugs:");
    for (const p of missing) console.log(`- ${p.slug}`);
  }

  if (!dryRun && missing.length > 0) {
    const now = new Date();
    const docs = missing.map((p) => ({ ...p, createdAt: now, updatedAt: now }));
    await col.insertMany(docs);
    console.log(`Inserted ${docs.length} new products into database.`);
  } else if (dryRun) {
    console.log("Dry-run mode: no inserts performed.");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Sync failed:", err.message || err);
  process.exit(1);
});

// scripts/add-products-from-images.js
// Usage:
//   node scripts/add-products-from-images.js --dry-run
//   node scripts/add-products-from-images.js
require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const PRODUCTS_DIR = path.join(process.cwd(), "public", "products");

function toSlug(filename) {
  return filename
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function inferCategory(slug) {
  if (slug.includes("seed")) return "seeds";
  if (slug.includes("nutrient")) return "nutrients";
  return "smart-pots";
}

function defaultsByCategory(category, name) {
  if (category === "seeds") {
    return {
      price: 79000,
      salePrice: 59000,
      stock: 120,
      rating: 4.6,
      reviewCount: 18,
      description: `${name} seeds with high germination rate for hydroponic and indoor gardens.`,
      shortDescription: `Premium ${name.toLowerCase()} seeds for healthy and consistent growth.`,
      highlights: [
        "High germination performance",
        "Suitable for hydroponic systems",
        "Fast and stable early growth",
      ],
      whatsInTheBox: ["Seed pack", "Growing guide"],
      compatibility: ["Rockwool", "Coco coir", "Hydroponic NFT/DWC"],
      warrantyMonths: 0,
      shipping: { weightKg: 0.05, dimensionsCm: { length: 12, width: 8, height: 1 }, leadTimeDays: 2, origin: "Vietnam" },
      faqs: [
        { question: "How should I store these seeds?", answer: "Store in a cool, dry place away from direct sunlight." },
        { question: "Are these seeds suitable for beginners?", answer: "Yes, they are beginner-friendly with stable germination." },
      ],
      tags: ["seeds", "hydroponic", "indoor-garden"],
    };
  }

  if (category === "nutrients") {
    return {
      price: 390000,
      salePrice: 329000,
      stock: 60,
      rating: 4.7,
      reviewCount: 24,
      description: `${name} designed for balanced hydroponic nutrition and strong plant development.`,
      shortDescription: `Balanced nutrient formula for reliable hydroponic performance.`,
      highlights: [
        "Stable nutrient ratio",
        "Easy to mix and monitor",
        "Compatible with common hydroponic setups",
      ],
      whatsInTheBox: ["Nutrient solution", "Mixing guide"],
      compatibility: ["NFT", "DWC", "Vertical hydroponic towers"],
      warrantyMonths: 6,
      shipping: { weightKg: 1.2, dimensionsCm: { length: 24, width: 16, height: 14 }, leadTimeDays: 2, origin: "Vietnam" },
      faqs: [
        { question: "How often should I replace nutrient solution?", answer: "Typically every 10-14 days depending on plant stage." },
        { question: "Do I still need to monitor pH and TDS?", answer: "Yes, regular monitoring is recommended for best results." },
      ],
      tags: ["nutrients", "hydroponic", "ab-formula"],
    };
  }

  return {
    price: 890000,
    salePrice: 749000,
    stock: 25,
    rating: 4.7,
    reviewCount: 16,
    description: `${name} for smart hydroponic gardening with easy setup and maintenance.`,
    shortDescription: `Smart gardening hardware optimized for home hydroponics.`,
    highlights: [
      "Easy setup process",
      "Space-efficient design",
      "Smart Garden ecosystem compatible",
    ],
    whatsInTheBox: ["Main hardware unit", "Accessories", "User guide"],
    compatibility: ["Smart Garden Dashboard", "Hydroponic circulation systems", "220V power"],
    warrantyMonths: 12,
    shipping: { weightKg: 6.8, dimensionsCm: { length: 90, width: 32, height: 26 }, leadTimeDays: 2, origin: "Vietnam" },
    faqs: [
      { question: "Is technical installation required?", answer: "No, most users can install it within 20-30 minutes." },
      { question: "Can I use it with existing hydroponic systems?", answer: "Yes, it works with most common home hydroponic setups." },
    ],
    tags: ["smart-pots", "hydroponic", "iot"],
  };
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

async function main() {
  const dryRun = hasFlag("--dry-run");
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "AIoT";

  if (!uri) throw new Error("Missing MONGODB_URI in .env.local");
  if (!fs.existsSync(PRODUCTS_DIR)) throw new Error("Missing public/products directory");

  const imageFiles = fs
    .readdirSync(PRODUCTS_DIR)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));

  if (imageFiles.length === 0) {
    console.log("No image files found in public/products.");
    return;
  }

  await mongoose.connect(uri, { dbName });
  const col = mongoose.connection.collection("products");

  const existing = await col.find({}, { projection: { slug: 1 } }).toArray();
  const existingSet = new Set(existing.map((x) => x.slug));

  const candidates = imageFiles.map((filename) => {
    const slug = toSlug(filename);
    const name = titleFromSlug(slug);
    const category = inferCategory(slug);
    const defaults = defaultsByCategory(category, name);

    return {
      slug,
      name,
      category,
      price: defaults.price,
      salePrice: defaults.salePrice,
      images: [`/products/${filename}`],
      description: defaults.description,
      shortDescription: defaults.shortDescription,
      highlights: defaults.highlights,
      whatsInTheBox: defaults.whatsInTheBox,
      compatibility: defaults.compatibility,
      specs: {},
      warrantyMonths: defaults.warrantyMonths,
      shipping: defaults.shipping,
      faqs: defaults.faqs,
      stock: defaults.stock,
      rating: defaults.rating,
      reviewCount: defaults.reviewCount,
      tags: defaults.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  const missing = candidates.filter((p) => !existingSet.has(p.slug));

  console.log(`Detected images: ${imageFiles.length}`);
  console.log(`Candidates from images: ${candidates.length}`);
  console.log(`Missing products to insert: ${missing.length}`);
  if (missing.length) {
    console.log("Missing slugs:");
    for (const p of missing) console.log(`- ${p.slug}`);
  }

  if (!dryRun && missing.length > 0) {
    await col.insertMany(missing);
    console.log(`Inserted ${missing.length} new products.`);
  } else if (dryRun) {
    console.log("Dry-run mode: no inserts performed.");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Add-from-images failed:", err.message || err);
  process.exit(1);
});

// scripts/normalize-products-english.js
// Usage:
//   node scripts/normalize-products-english.js --dry-run
//   node scripts/normalize-products-english.js
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function titleFromSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function inferCategory(slug, existingCategory) {
  if (existingCategory && ["seeds", "nutrients", "smart-pots"].includes(existingCategory)) return existingCategory;
  const s = String(slug || "");
  if (s.includes("seed")) return "seeds";
  if (s.includes("nutrient")) return "nutrients";
  return "smart-pots";
}

function englishPackByCategory(name, category) {
  if (category === "seeds") {
    return {
      shortDescription: `Premium ${name.toLowerCase()} for hydroponic and home gardens.`,
      description: `${name} is selected for consistent germination and dependable early growth in hydroponic and indoor environments. Each batch is packed to preserve seed quality, helping growers start with uniform seedlings and healthier root development. It is a practical choice for balcony gardens, small indoor farms, and beginner-friendly home cultivation projects.`,
      highlights: [
        "Stable and high germination rate",
        "Suitable for hydroponic and indoor systems",
        "Reliable early-stage growth",
      ],
      whatsInTheBox: ["Seed pack", "Quick start growing guide"],
      compatibility: ["Rockwool", "Coco coir", "Hydroponic NFT/DWC systems"],
      warrantyMonths: 0,
      shipping: {
        weightKg: 0.05,
        dimensionsCm: { length: 12, width: 8, height: 1 },
        leadTimeDays: 2,
        origin: "Vietnam",
      },
      faqs: [
        {
          question: "How should I store the seeds?",
          answer: "Store them in a cool, dry place away from direct sunlight.",
        },
        {
          question: "Are these seeds beginner-friendly?",
          answer: "Yes, they are easy to handle and suitable for beginners.",
        },
      ],
      tags: ["seeds", "hydroponic", "indoor-garden"],
    };
  }

  if (category === "nutrients") {
    return {
      shortDescription: "Balanced nutrient formula for reliable hydroponic growth.",
      description: `${name} is formulated to deliver balanced macro and micronutrients for steady plant growth throughout the cultivation cycle. The formula mixes easily in most hydroponic reservoirs and supports more predictable pH and TDS management during daily operation. It is suitable for home growers who want healthier foliage, stronger roots, and more consistent crop quality over time.`,
      highlights: [
        "Balanced nutrient profile",
        "Easy to mix and monitor",
        "Supports stable hydroponic growth",
      ],
      whatsInTheBox: ["Nutrient solution", "Usage and mixing instructions"],
      compatibility: ["NFT", "DWC", "Vertical hydroponic tower systems"],
      warrantyMonths: 6,
      shipping: {
        weightKg: 1.2,
        dimensionsCm: { length: 24, width: 16, height: 14 },
        leadTimeDays: 2,
        origin: "Vietnam",
      },
      faqs: [
        {
          question: "How often should I replace the nutrient solution?",
          answer: "Typically every 10-14 days, depending on plant stage and system conditions.",
        },
        {
          question: "Do I still need to monitor pH and TDS?",
          answer: "Yes, regular pH and TDS checks are recommended for best results.",
        },
      ],
      tags: ["nutrients", "hydroponic", "plant-growth"],
    };
  }

  return {
    shortDescription: "Smart gardening hardware optimized for modern hydroponic setups.",
    description: `${name} is built to simplify setup, monitoring, and maintenance for modern hydroponic systems at home or in small-scale projects. Its design focuses on stable day-to-day operation, helping users reduce manual workload while improving system reliability. From first-time growers to experienced users, it provides a practical foundation for expanding an IoT-enabled smart garden workflow.`,
    highlights: [
      "Easy setup workflow",
      "Space-efficient product design",
      "Compatible with Smart Garden ecosystem",
    ],
    whatsInTheBox: ["Main hardware unit", "Accessories", "User guide"],
    compatibility: ["Smart Garden Dashboard", "Hydroponic circulation systems", "220V power"],
    warrantyMonths: 12,
    shipping: {
      weightKg: 6.8,
      dimensionsCm: { length: 90, width: 32, height: 26 },
      leadTimeDays: 2,
      origin: "Vietnam",
    },
    faqs: [
      {
        question: "Is professional installation required?",
        answer: "No, most users can complete setup within 20-30 minutes.",
      },
      {
        question: "Can it work with existing hydroponic systems?",
        answer: "Yes, it is compatible with most common home hydroponic setups.",
      },
    ],
    tags: ["smart-pots", "hydroponic", "iot"],
  };
}

function curatedBySlug(slug) {
  const map = {
    "ab-nutrient-kit": {
      name: "A+B Hydroponic Nutrient Kit",
      shortDescription: "Complete A+B nutrient solution for healthy hydroponic growth.",
      description:
        "This A+B Hydroponic Nutrient Kit provides a complete feeding base for leafy greens, herbs, and fruiting crops in hydroponic systems. It supports both vegetative and bloom stages with a balanced nutrient profile that helps maintain stable growth and healthier plant structure. The kit is easy to dilute, easy to monitor with pH/TDS tools, and practical for home growers who want reliable week-to-week results.",
    },
    "complete-diy-vertical-tower-kit": {
      name: "Complete DIY Vertical Tower Kit",
      shortDescription: "All-in-one vertical hydroponic kit for home growers.",
      description:
        "The Complete DIY Vertical Tower Kit includes the core hardware and guidance needed to assemble a compact vertical hydroponic setup at home. It is designed for efficient use of limited space, making it ideal for balconies, patios, and small indoor areas. With clear assembly flow and practical components, this kit helps growers start faster and maintain a cleaner, more organized growing system.",
    },
    "leak-proof-joint-fittings": {
      name: "Leak-Proof Joint Fittings Kit",
      shortDescription: "Durable anti-leak fittings for hydroponic water lines.",
      description:
        "The Leak-Proof Joint Fittings Kit is designed to improve sealing quality and reduce water leakage in hydroponic pipe connections. It includes practical connector components that support cleaner routing, easier maintenance, and more stable water circulation. This kit is especially useful when expanding or upgrading existing systems that require tighter, more reliable joints.",
    },
    "automated-nutrient-center": {
      name: "Automated Nutrient Center",
      shortDescription: "Automated nutrient mixing and dosing hub for hydroponics.",
      description:
        "The Automated Nutrient Center streamlines nutrient preparation by automating key dosing and mixing steps in your hydroponic workflow. It helps reduce repetitive manual adjustments while maintaining more consistent feed concentration across daily operations. For growers managing multiple plants or frequent reservoir changes, it provides better control, improved repeatability, and a more scalable maintenance routine.",
    },
  };

  return map[slug] || null;
}

async function main() {
  const dryRun = hasFlag("--dry-run");
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "AIoT";
  if (!uri) throw new Error("Missing MONGODB_URI in .env.local");

  await mongoose.connect(uri, { dbName });
  const col = mongoose.connection.collection("products");

  const products = await col.find({}).toArray();
  if (products.length === 0) {
    console.log("No products found.");
    await mongoose.disconnect();
    return;
  }

  let changed = 0;
  for (const p of products) {
    const slug = String(p.slug || "").trim();
    if (!slug) continue;

    const category = inferCategory(slug, p.category);
    const inferredName = titleFromSlug(slug);
    const pack = englishPackByCategory(inferredName, category);
    const curated = curatedBySlug(slug);

    const next = {
      category,
      name: curated?.name || inferredName,
      shortDescription: curated?.shortDescription || pack.shortDescription,
      description: curated?.description || pack.description,
      highlights: pack.highlights,
      whatsInTheBox: pack.whatsInTheBox,
      compatibility: pack.compatibility,
      warrantyMonths: pack.warrantyMonths,
      shipping: pack.shipping,
      faqs: pack.faqs,
      tags: pack.tags,
      updatedAt: new Date(),
    };

    changed += 1;
    if (!dryRun) {
      await col.updateOne({ _id: p._id }, { $set: next });
    }
  }

  console.log(`Products scanned: ${products.length}`);
  console.log(`Products normalized to English: ${changed}`);
  console.log(dryRun ? "Dry-run mode: no database writes." : "Normalization completed.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Normalization failed:", err.message || err);
  process.exit(1);
});

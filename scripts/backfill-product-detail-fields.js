// scripts/backfill-product-detail-fields.js
// Chay: node scripts/backfill-product-detail-fields.js
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

function firstSentence(text) {
  if (!text || typeof text !== "string") return "";
  const cleaned = text.trim();
  if (!cleaned) return "";
  const idx = cleaned.search(/[.!?]/);
  if (idx === -1) return cleaned.slice(0, 140);
  return cleaned.slice(0, idx + 1);
}

function buildByCategory(product) {
  const category = product.category;
  const isSmartPot = category === "smart-pots";
  const isNutrient = category === "nutrients";
  const isSeed = category === "seeds";

  const defaults = {
    shortDescription:
      firstSentence(product.description) ||
      "San pham toi uu cho he thong trong cay thong minh tai nha.",
    highlights: isSmartPot
      ? [
          "Lap dat nhanh trong 20-30 phut",
          "Toi uu dien tich cho ban cong va san thuong",
          "Tuong thich dashboard Smart Garden",
        ]
      : isNutrient
        ? [
            "Cong thuc on dinh cho cay an la va cay an qua",
            "De pha, de theo doi TDS va pH",
            "Phu hop cho he thong thuy canh gia dinh",
          ]
        : [
            "Ty le nay mam on dinh",
            "Dong goi de bao quan va su dung",
            "Phu hop trong nha hoac ngoai troi",
          ],
    whatsInTheBox: isSmartPot
      ? ["Bo phan lap dat chinh", "Phu kien ket noi", "Huong dan su dung"]
      : isNutrient
        ? ["Dung dich/chai thanh phan", "Huong dan pha", "Khuyen nghi su dung"]
        : ["Hat giong", "Huong dan gieo trong"],
    compatibility: isSmartPot
      ? ["He thong tuoi tuan hoan", "Dashboard Smart Garden", "Nguon dien 220V"]
      : isNutrient
        ? ["He thong NFT", "He thong DWC", "Thap dung hydroponic"]
        : ["Gia the xop dua", "Rockwool", "Dat huu co"],
    warrantyMonths: isSmartPot ? 12 : 6,
    shipping: {
      weightKg: isSmartPot ? 7.5 : isNutrient ? 1.2 : 0.2,
      dimensionsCm: isSmartPot
        ? { length: 95, width: 35, height: 28 }
        : isNutrient
          ? { length: 24, width: 16, height: 14 }
          : { length: 14, width: 9, height: 3 },
      leadTimeDays: 2,
      origin: "Vietnam",
    },
    faqs: isSmartPot
      ? [
          {
            question: "San pham co can ky thuat vien den lap dat khong?",
            answer: "Khong. Ban co the tu lap theo huong dan di kem trong 20-30 phut.",
          },
          {
            question: "Co dung duoc voi dashboard hien tai khong?",
            answer: "Co. San pham tuong thich voi he thong dashboard Smart Garden.",
          },
        ]
      : isNutrient
        ? [
            {
              question: "Ty le pha bao nhieu la hop ly?",
              answer: "Pha theo huong dan tren bao bi, sau do do lai TDS/pH de can chinh.",
            },
            {
              question: "Bao lau nen thay dung dich mot lan?",
              answer: "Thong thuong 10-14 ngay, tuy giai doan phat trien cua cay.",
            },
          ]
        : [
            {
              question: "Hat giong bao quan nhu the nao?",
              answer: "Bao quan noi kho, tranh anh nang truc tiep va dong kin sau khi mo.",
            },
            {
              question: "Can ngam hat truoc khi gieo khong?",
              answer: "Tuy loai hat. Ban nen tham khao huong dan di kem cho tung giong cay.",
            },
          ],
  };

  return defaults;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "AIoT";

  if (!uri) {
    console.error("MONGODB_URI khong ton tai trong .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName });
  const products = await mongoose.connection.collection("products").find({}).toArray();

  if (products.length === 0) {
    console.log("Khong co san pham nao de cap nhat.");
    await mongoose.disconnect();
    return;
  }

  let updated = 0;
  for (const p of products) {
    const patch = buildByCategory(p);

    await mongoose.connection.collection("products").updateOne(
      { _id: p._id },
      {
        $set: {
          shortDescription: patch.shortDescription,
          highlights: patch.highlights,
          whatsInTheBox: patch.whatsInTheBox,
          compatibility: patch.compatibility,
          warrantyMonths: patch.warrantyMonths,
          shipping: patch.shipping,
          faqs: patch.faqs,
        },
      }
    );
    updated += 1;
  }

  console.log(`Da cap nhat ${updated}/${products.length} san pham voi bo field product-detail.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Backfill loi:", err.message || err);
  process.exit(1);
});

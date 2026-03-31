// scripts/seed-products.js
// Chạy: node scripts/seed-products.js
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    slug:        { type: String, required: true, unique: true },
    name:        { type: String, required: true },
    category:    { type: String, enum: ["seeds", "nutrients", "smart-pots"], required: true },
    price:       { type: Number, required: true },
    salePrice:   { type: Number },
    images:      [{ type: String }],
    description: { type: String, default: "" },
    specs:       { type: mongoose.Schema.Types.Mixed, default: {} },
    stock:       { type: Number, default: 0 },
    rating:      { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    tags:        [{ type: String }],
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const PRODUCTS = [
  {
    slug: "automated-nutrient-center",
    name: "Automated Nutrient Center",
    category: "smart-pots",
    price: 2_490_000,
    salePrice: 1_990_000,
    images: [
      "https://res.cloudinary.com/ddxgfsbhh/image/upload/v1/AIoT_smartGarden/automated-nutrient-center.webp",
    ],
    description:
      "Hệ thống pha dinh dưỡng tự động cho thủy canh. Bao gồm bơm chìm lưu lượng cao, bộ điều khiển kỹ thuật số, 2 bơm định lượng nhu động (peristaltic) và bộ lọc nội tích. Tự động pha dung dịch A+B theo tỉ lệ lập trình sẵn.",
    specs: {
      "Bơm chính": "Submersible High-Flow 1000L/h",
      "Bơm định lượng": "2x Peristaltic (A & B)",
      "Màn hình": "Digital LCD Controller",
      "Bộ lọc": "Internal Filter Stack",
      "Điện áp": "220V / 50Hz",
      "Kích thước bể": "40×30×20 cm",
    },
    stock: 15,
    rating: 4.8,
    reviewCount: 24,
    tags: ["tự động", "dinh dưỡng", "thủy canh", "bơm", "controller"],
  },
  {
    slug: "leak-proof-joint-fittings",
    name: "Leak-Proof Joint Fittings Kit",
    category: "smart-pots",
    price: 320_000,
    salePrice: 259_000,
    images: [
      "https://res.cloudinary.com/ddxgfsbhh/image/upload/v1/AIoT_smartGarden/leak-proof-fittings.webp",
    ],
    description:
      "Bộ khớp nối chống rò rỉ chuyên dụng cho hệ thống thủy canh. Bao gồm khớp nối 4 chiều, khớp cong 90°, vòng đệm O-ring cao su, băng PTFE và hướng dẫn lắp ráp. Thiết kế seal-check 3 điểm đảm bảo không rò rỉ.",
    specs: {
      "Vật liệu": "ABS cao cấp chịu UV",
      "Đường kính": "20mm / 25mm (2 loại)",
      "Áp suất chịu được": "Tối đa 0.6 MPa",
      "Nhiệt độ": "-10°C đến 60°C",
      "Bộ gồm": "4 khớp cong + 1 khớp 4 chiều + 10 O-ring + băng PTFE",
    },
    stock: 50,
    rating: 4.6,
    reviewCount: 41,
    tags: ["ống nước", "khớp nối", "chống rò", "thủy canh", "fitting"],
  },
  {
    slug: "ab-nutrient-kit",
    name: "Bộ Dinh Dưỡng A+B Thủy Canh",
    category: "nutrients",
    price: 450_000,
    salePrice: 379_000,
    images: [
      "https://res.cloudinary.com/ddxgfsbhh/image/upload/v1/AIoT_smartGarden/ab-nutrient-kit.webp",
    ],
    description:
      "Bộ dinh dưỡng đầy đủ cho thủy canh gồm dung dịch A (Grow Nutrient) cho giai đoạn sinh dưỡng, dung dịch B (Bloom Nutrient) cho giai đoạn ra hoa/quả, Micronutrient Booster và gói vi lượng Pre-Mixed & Specialized. Đủ cho 100L dung dịch.",
    specs: {
      "Dung dịch A": "500ml Grow Nutrient (concentrated)",
      "Dung dịch B": "500ml Bloom Nutrient (concentrated)",
      "Micronutrient Booster": "30ml",
      "Gói vi lượng": "2 gói (Pre-mixed + Specialized)",
      "Pha loãng": "1:500 cho mỗi dung dịch",
      "TDS mục tiêu": "800–1400 ppm",
    },
    stock: 35,
    rating: 4.9,
    reviewCount: 67,
    tags: ["dinh dưỡng", "A+B", "thủy canh", "grow", "bloom", "vi lượng"],
  },
  {
    slug: "complete-diy-vertical-tower-kit",
    name: "Complete DIY Vertical Tower Kit",
    category: "smart-pots",
    price: 890_000,
    salePrice: 749_000,
    images: [
      "https://res.cloudinary.com/ddxgfsbhh/image/upload/v1/AIoT_smartGarden/vertical-tower-kit.webp",
    ],
    description:
      "Bộ kit hoàn chỉnh để tự làm hệ thống thủy canh tháp đứng. Bao gồm ống PVC đục sẵn lỗ, khối rockwool gieo mầm, bơm nước, ống dẫn nước, chậu lưới net cup (đen + trắng), 3 gói hạt giống (cà chua bi, cải pak choi, rau diếp đỏ) và sách hướng dẫn lắp ráp chi tiết.",
    specs: {
      "Ống trồng": "PVC Ø110mm × 1.2m (16 lỗ)",
      "Bơm nước": "Submersible 300L/h",
      "Ống dẫn": "5m flexible hose",
      "Net cup": "8 trắng Ø75mm + 6 đen Ø50mm",
      "Rockwool": "20 khối 36×36×40mm",
      "Hạt giống": "Cà chua bi + Pak Choi + Rau diếp đỏ",
      "Sách HD": "Tiếng Việt + Tiếng Anh",
    },
    stock: 20,
    rating: 4.7,
    reviewCount: 33,
    tags: ["tower", "tháp đứng", "DIY", "kit", "thủy canh", "rockwool", "hạt giống"],
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "AIoT";

  if (!uri) {
    console.error("❌ MONGODB_URI không tìm thấy trong .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName });
  console.log("✅ MongoDB connected:", dbName);

  let inserted = 0;
  let skipped = 0;

  for (const p of PRODUCTS) {
    const existing = await Product.findOne({ slug: p.slug });
    if (existing) {
      console.log(`⏭️  Bỏ qua (đã tồn tại): ${p.name}`);
      skipped++;
      continue;
    }
    await Product.create(p);
    console.log(`✅ Đã thêm: ${p.name} — ${p.price.toLocaleString("vi-VN")}đ`);
    inserted++;
  }

  console.log(`\n📦 Kết quả: ${inserted} sản phẩm mới, ${skipped} bỏ qua`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Lỗi:", err.message);
  process.exit(1);
});

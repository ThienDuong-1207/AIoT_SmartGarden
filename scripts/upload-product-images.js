// scripts/upload-product-images.js
// Chạy: node scripts/upload-product-images.js
// Đặt 4 ảnh vào thư mục scripts/product-images/ trước khi chạy
require("dotenv").config({ path: ".env.local" });
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Map tên file → slug sản phẩm
const IMAGE_MAP = {
  "automated-nutrient-center.webp":   "automated-nutrient-center",
  "leak-proof-fittings.webp":         "leak-proof-joint-fittings",
  "ab-nutrient-kit.webp":             "ab-nutrient-kit",
  "vertical-tower-kit.webp":          "complete-diy-vertical-tower-kit",
};

const ProductSchema = new mongoose.Schema({ slug: String, images: [String] }, { strict: false });
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || "AIoT" });
  console.log("✅ MongoDB connected\n");

  const imgDir = path.join(__dirname, "product-images");
  if (!fs.existsSync(imgDir)) {
    console.error("❌ Chưa có thư mục scripts/product-images/");
    console.log("   Tạo thư mục và đặt 4 ảnh vào:\n");
    Object.keys(IMAGE_MAP).forEach(f => console.log(`   - scripts/product-images/${f}`));
    process.exit(1);
  }

  for (const [filename, slug] of Object.entries(IMAGE_MAP)) {
    const filePath = path.join(imgDir, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Không tìm thấy: ${filename} — bỏ qua`);
      continue;
    }

    console.log(`📤 Uploading ${filename}...`);
    const result = await cloudinary.uploader.upload(filePath, {
      folder:          "AIoT_smartGarden",
      public_id:       slug,
      overwrite:       true,
      resource_type:   "image",
    });

    await Product.updateOne({ slug }, { $set: { images: [result.secure_url] } });
    console.log(`✅ ${slug} → ${result.secure_url}\n`);
  }

  console.log("🎉 Upload hoàn tất!");
  await mongoose.disconnect();
}

main().catch(err => { console.error("❌", err.message); process.exit(1); });

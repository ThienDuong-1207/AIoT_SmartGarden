import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ProductSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["seeds", "nutrients", "smart-pots"],
      required: true,
      index: true,
    },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    images: [{ type: String }],
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    highlights: [{ type: String }],
    whatsInTheBox: [{ type: String }],
    compatibility: [{ type: String }],
    specs: { type: Schema.Types.Mixed, default: {} },
    warrantyMonths: { type: Number, default: 0 },
    shipping: {
      weightKg: { type: Number, default: null },
      dimensionsCm: {
        length: { type: Number, default: null },
        width: { type: Number, default: null },
        height: { type: Number, default: null },
      },
      leadTimeDays: { type: Number, default: null },
      origin: { type: String, default: "" },
    },
    videoUrl: { type: String, default: "" },
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

type ProductDocument = InferSchemaType<typeof ProductSchema>;

const ProductModel: Model<ProductDocument> =
  mongoose.models.Product ||
  mongoose.model<ProductDocument>("Product", ProductSchema);

export default ProductModel;

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
    description: { type: String, default: "" },
    specs: { type: Schema.Types.Mixed, default: {} },
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

import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    image: { type: String },
    password: { type: String },
    provider: { type: String, default: "google" },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "banned"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

type UserDocument = InferSchemaType<typeof UserSchema>;

const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);

export default UserModel;

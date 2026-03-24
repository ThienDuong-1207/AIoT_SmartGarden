import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const DeviceSchema = new Schema(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    plantType: { type: String, default: "Unknown" },
    firmwareVersion: { type: String, default: "1.0.0" },
    wifiMAC: { type: String },
    isOnline: { type: Boolean, default: false },
    lastSeenAt: { type: Date },
    activationCode: { type: String, required: true, unique: true, index: true },
    config: {
      cameraInterval: { type: Number, default: 21600 },
      alertThresholds: {
        tds: {
          min: { type: Number, default: 800 },
          max: { type: Number, default: 1800 },
        },
        ph: {
          min: { type: Number, default: 5.5 },
          max: { type: Number, default: 7.0 },
        },
        temp: {
          min: { type: Number, default: 18 },
          max: { type: Number, default: 30 },
        },
      },
      notificationsEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

type DeviceDocument = InferSchemaType<typeof DeviceSchema>;

const DeviceModel: Model<DeviceDocument> =
  mongoose.models.Device || mongoose.model<DeviceDocument>("Device", DeviceSchema);

export default DeviceModel;

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
    mutePushUntil: { type: Date, default: null },
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
        // IoT Peripheral Control
        pump: {
          status: { type: Boolean, default: false },
          schedule: [
            {
              time: String,
              durationMinutes: { type: Number, default: 15 },
              enabled: { type: Boolean, default: true },
            },
          ],
          lastActivated: Date,
          activationCount: { type: Number, default: 0 },
        },
        light: {
          status: { type: Boolean, default: true },
          brightness: { type: Number, default: 100 },
          schedule: [
            {
              startTime: String,
              endTime: String,
              brightness: { type: Number, default: 100 },
              enabled: { type: Boolean, default: true },
            },
          ],
        },
        watering: {
          autoMode: { type: Boolean, default: false },
          intervalHours: { type: Number, default: 6 },
          schedule: [
            {
              time: String,
              durationMinutes: { type: Number, default: 15 },
              enabled: { type: Boolean, default: true },
            },
          ],
          nextScheduledRun: Date,
        },
        sensor: {
          calibrationMode: { type: Boolean, default: false },
          calibratingType: { type: String, enum: ["TDS", "pH"], default: null },
          lastCalibrated: Date,
        },
        operationEvents: [
          {
            type: { type: String },
            timestamp: { type: Date, default: Date.now },
            meta: { type: Schema.Types.Mixed, default: {} },
          },
        ],
    },
  },
  { timestamps: true }
);

type DeviceDocument = InferSchemaType<typeof DeviceSchema>;

const DeviceModel: Model<DeviceDocument> =
  mongoose.models.Device || mongoose.model<DeviceDocument>("Device", DeviceSchema);

export default DeviceModel;

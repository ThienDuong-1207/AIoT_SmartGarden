import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const SensorReadingSchema = new Schema(
  {
    deviceId:     { type: String, required: true, index: true },
    timestamp:    { type: Date, required: true, default: Date.now, index: true },
    temp:         { type: Number },   // °C
    humi:         { type: Number },   // %
    tds_ppm:      { type: Number },   // ppm
    ph:           { type: Number },
    light_status: { type: Boolean },  // đèn bật/tắt
    water_level:  { type: Number },   // % mực nước
    raw:          { type: Schema.Types.Mixed }, // raw payload từ ESP32
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound index: query theo deviceId + khoảng thời gian
SensorReadingSchema.index({ deviceId: 1, timestamp: -1 });

// TTL index: tự xóa readings sau 90 ngày
SensorReadingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

type SensorReadingDocument = InferSchemaType<typeof SensorReadingSchema>;

const SensorReadingModel: Model<SensorReadingDocument> =
  mongoose.models.SensorReading ||
  mongoose.model<SensorReadingDocument>("SensorReading", SensorReadingSchema);

export default SensorReadingModel;

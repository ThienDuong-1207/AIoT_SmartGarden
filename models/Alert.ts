import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AlertSchema = new Schema(
  {
    deviceId:    { type: String, required: true, index: true },
    userId:      { type: Schema.Types.ObjectId, ref: "User", index: true },
    type:        {
      type: String,
      enum: ["tds_low", "tds_high", "temp_low", "temp_high", "water_low", "ai_disease", "device_offline"],
      required: true,
    },
    severity:    { type: String, enum: ["info", "warning", "danger"], default: "warning" },
    message:     { type: String, required: true },
    value:       { type: Number },      // giá trị tại thời điểm trigger
    threshold:   { type: Number },      // ngưỡng bị vượt qua
    isRead:      { type: Boolean, default: false, index: true },
    triggeredAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

AlertSchema.index({ deviceId: 1, triggeredAt: -1 });
AlertSchema.index({ userId: 1, isRead: 1 });

type AlertDocument = InferSchemaType<typeof AlertSchema>;

const AlertModel: Model<AlertDocument> =
  mongoose.models.Alert ||
  mongoose.model<AlertDocument>("Alert", AlertSchema);

export default AlertModel;

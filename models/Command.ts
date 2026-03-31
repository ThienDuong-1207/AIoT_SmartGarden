import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Command — lịch sử lệnh gửi xuống ESP32 qua MQTT
 *
 * Luồng:
 *   User/Schedule → POST /api/devices/{id}/command
 *   → lưu Command (status: "sent")
 *   → publish MQTT topic garden/{deviceId}/command
 *   → ESP32 nhận lệnh, thực thi, ACK qua MQTT
 *   → backend cập nhật status → "acknowledged"
 */
const CommandSchema = new Schema(
  {
    deviceId: { type: String,                required: true, index: true },
    userId:   { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },

    command: {
      type: String,
      enum: [
        "light_on", "light_off",
        "pump_on",  "pump_off",
        "capture_now",
        "reboot",
        "update_config",
      ],
      required: true,
    },

    // payload tuỳ chọn (ví dụ: { duration: 30 } cho pump_on)
    payload: { type: Schema.Types.Mixed, default: null },

    source: {
      type: String,
      enum: ["user", "schedule", "automation"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["sent", "acknowledged", "failed", "timeout"],
      default: "sent",
    },

    sentAt:           { type: Date, default: Date.now, index: true },
    acknowledgedAt:   { type: Date, default: null },
  },
  { timestamps: false, versionKey: false }
);

CommandSchema.index({ deviceId: 1, sentAt: -1 });

// TTL: tự xóa lệnh cũ sau 30 ngày
CommandSchema.index({ sentAt: 1 }, { expireAfterSeconds: 2_592_000 });

type CommandDocument = InferSchemaType<typeof CommandSchema>;

const CommandModel: Model<CommandDocument> =
  mongoose.models.Command ||
  mongoose.model<CommandDocument>("Command", CommandSchema);

export default CommandModel;

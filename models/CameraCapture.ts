import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const CameraCaptureSchema = new Schema(
  {
    deviceId:    { type: String,                required: true, index: true },
    userId:      { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    imageUrl:    { type: String,                required: true },   // Cloudinary URL
    capturedAt:  { type: Date,                  required: true, default: Date.now, index: true },
    triggeredBy: {
      type: String,
      enum: ["manual", "schedule", "alert"],
      default: "manual",
    },
    // ref tới AIdiagnostic nếu ảnh này đã được phân tích AI
    diagId: { type: Schema.Types.ObjectId, ref: "AIdiagnostic", default: null },
  },
  { timestamps: false, versionKey: false }
);

CameraCaptureSchema.index({ deviceId: 1, capturedAt: -1 });
CameraCaptureSchema.index({ userId:   1, capturedAt: -1 });

type CameraCaptureDocument = InferSchemaType<typeof CameraCaptureSchema>;

const CameraCaptureModel: Model<CameraCaptureDocument> =
  mongoose.models.CameraCapture ||
  mongoose.model<CameraCaptureDocument>("CameraCapture", CameraCaptureSchema);

export default CameraCaptureModel;

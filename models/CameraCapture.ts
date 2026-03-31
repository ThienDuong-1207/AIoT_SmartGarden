import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const CameraCaptureSchema = new Schema(
  {
    deviceId:    { type: String, required: true, index: true },
    imageBase64: { type: String, required: true },
    capturedAt:  { type: Date,   required: true, default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

CameraCaptureSchema.index({ deviceId: 1, capturedAt: -1 });

type CameraCaptureDocument = InferSchemaType<typeof CameraCaptureSchema>;

const CameraCaptureModel: Model<CameraCaptureDocument> =
  mongoose.models.CameraCapture ||
  mongoose.model<CameraCaptureDocument>("CameraCapture", CameraCaptureSchema);

export default CameraCaptureModel;

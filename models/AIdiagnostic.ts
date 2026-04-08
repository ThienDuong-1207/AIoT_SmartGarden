import mongoose, { Schema, Document } from "mongoose";

export interface IAIdiagnostic extends Document {
  deviceId: string;
  userId: string;               // ref → users._id (để query trực tiếp không cần join)
  capturedAt: Date;
  imageUrl: string;             // Cloudinary URL (thay thế imageBase64)
  sensorContext: {
    tds: number | null;
    temperature: number | null;
    humidity: number | null;
  };
  detections: {
    class: string;
    confidence: number;
    bbox: number[];
  }[];
  status: "healthy" | "warning" | "danger";
  topDisease: string | null;
  topConfidence: number;
  fusedDiagnosis: string;       // kết hợp AI + sensor context
  recommendation: string;
  aiModel: string;
  processingMs: number;
}

const AIdiagnosticSchema = new Schema<IAIdiagnostic>(
  {
    deviceId:    { type: String, required: true, index: true },
    userId:      { type: String, required: true, index: true },
    capturedAt:  { type: Date, default: Date.now, index: true },
    imageUrl:    { type: String, default: "" },   // Cloudinary URL
    sensorContext: {
      tds:         { type: Number, default: null },
      temperature: { type: Number, default: null },
      humidity:    { type: Number, default: null },
    },
    detections: [
      {
        class:      String,
        confidence: Number,
        bbox:       [Number],
      },
    ],
    status:          { type: String, enum: ["healthy", "warning", "danger"], required: true },
    topDisease:      { type: String, default: null },
    topConfidence:   { type: Number, required: true },
    fusedDiagnosis:  { type: String, default: "" },
    recommendation:  { type: String, default: "" },
    aiModel:         { type: String, default: "YOLOv8-plantAI" },
    processingMs:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

AIdiagnosticSchema.index({ deviceId: 1, capturedAt: -1 });
AIdiagnosticSchema.index({ deviceId: 1, status: 1 });
AIdiagnosticSchema.index({ userId: 1, capturedAt: -1 });  // query lịch sử theo user

const AIdiagnosticModel: mongoose.Model<IAIdiagnostic> =
  mongoose.models.AIdiagnostic ||
  mongoose.model<IAIdiagnostic>("AIdiagnostic", AIdiagnosticSchema);

export default AIdiagnosticModel;

import mongoose, { Schema, Document } from "mongoose";

export interface IAIdiagnostic extends Document {
  deviceId: string;
  capturedAt: Date;
  imageBase64: string;          // ảnh lưu thẳng MongoDB, không cần Cloudinary
  sensorContext: {
    tds: number | null;
    ph: number | null;
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
    capturedAt:  { type: Date, default: Date.now, index: true },
    imageBase64: { type: String, required: true },
    sensorContext: {
      tds:         { type: Number, default: null },
      ph:          { type: Number, default: null },
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

const AIdiagnosticModel: mongoose.Model<IAIdiagnostic> =
  mongoose.models.AIdiagnostic ||
  mongoose.model<IAIdiagnostic>("AIdiagnostic", AIdiagnosticSchema);

export default AIdiagnosticModel;

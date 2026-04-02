import { dbConnect } from "@/lib/mongodb";
import AlertModel from "@/models/Alert";

export type AlertSeverity = "info" | "warning" | "danger";
export type AlertType =
  | "tds_low"
  | "tds_high"
  | "ph_low"
  | "ph_high"
  | "temp_low"
  | "temp_high"
  | "water_low"
  | "ai_disease"
  | "device_offline";

export type CreateAlertInput = {
  deviceId: string;
  userId: string;
  type: AlertType;
  severity?: AlertSeverity;
  message: string;
  value?: number;
  threshold?: number;
  isRead?: boolean;
};

export async function createAlert(input: CreateAlertInput) {
  await dbConnect();

  return AlertModel.create({
    deviceId: input.deviceId,
    userId: input.userId,
    type: input.type,
    severity: input.severity ?? "warning",
    message: input.message,
    value: input.value,
    threshold: input.threshold,
    isRead: input.isRead ?? false,
  });
}

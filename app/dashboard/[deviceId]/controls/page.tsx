"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Loader2, BarChart3 } from "lucide-react";
import SensorCalibrationWizard from "@/components/dashboard/SensorCalibrationWizard";

interface DeviceConfig {
  sensor: {
    calibrationMode: boolean;
    calibratingType?: string | null;
    lastCalibrated?: Date | string;
  };
}

function normalizeConfig(raw: Partial<DeviceConfig> | null | undefined): DeviceConfig {
  return {
    sensor: {
      calibrationMode: raw?.sensor?.calibrationMode ?? false,
      calibratingType: raw?.sensor?.calibratingType ?? null,
      lastCalibrated: raw?.sensor?.lastCalibrated,
    },
  };
}

export default function IoTControlsPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const router = useRouter();
  const [config, setConfig] = useState<DeviceConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(`/api/devices/${deviceId}/config`);
        if (res.ok) {
          const data = await res.json();
          setConfig(normalizeConfig(data.config));
        }
      } catch (error) {
        console.error("Failed to fetch config:", error);
      } finally {
        setLoading(false);
      }
    }

    if (deviceId) {
      fetchConfig();
    }
  }, [deviceId]);

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--emerald-400)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 hover:bg-opacity-80 transition-all"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={18} style={{ color: "var(--emerald-400)" }} />
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              IoT Peripheral Control
            </h1>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Manage pump, light, and watering automation
          </p>
        </div>
      </div>

      {/* Grid of Controls */}
      <div className="grid gap-4 md:grid-cols-1">
        <SensorCalibrationWizard
          deviceId={deviceId as string}
          initialSensor={config.sensor}
          onUpdate={(updated) => setConfig({ ...config, sensor: updated.sensor })}
        />
      </div>

      {/* Info Box */}
      <div className="rounded-lg p-3" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          💡 <strong>Tip:</strong> Changes are sent to your ESP32 device immediately via MQTT. Ensure your device is online and subscribed to commands.
        </p>
      </div>
    </div>
  );
}

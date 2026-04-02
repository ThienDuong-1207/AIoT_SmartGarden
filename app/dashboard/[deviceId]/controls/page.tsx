"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Loader2, BarChart3 } from "lucide-react";
import PumpControl from "@/components/dashboard/PumpControl";
import LightControl from "@/components/dashboard/LightControl";
import WateringSchedule from "@/components/dashboard/WateringSchedule";
import SensorCalibrationWizard from "@/components/dashboard/SensorCalibrationWizard";

interface DeviceConfig {
  pump: {
    status: boolean;
    schedule: Array<{ time: string; durationMinutes: number; enabled: boolean }>;
    lastActivated?: Date;
    activationCount?: number;
  };
  light: {
    status: boolean;
    brightness: number;
    schedule: Array<{ startTime: string; endTime: string; brightness: number; enabled: boolean }>;
  };
  watering: {
    autoMode: boolean;
    intervalHours?: number;
    schedule: Array<{ time: string; durationMinutes: number; enabled: boolean }>;
  };
  sensor: {
    calibrationMode: boolean;
    calibratingType?: string | null;
    lastCalibrated?: Date | string;
  };
}

function normalizeConfig(raw: Partial<DeviceConfig> | null | undefined): DeviceConfig {
  return {
    pump: {
      status: raw?.pump?.status ?? false,
      schedule: raw?.pump?.schedule ?? [],
      lastActivated: raw?.pump?.lastActivated,
      activationCount: raw?.pump?.activationCount ?? 0,
    },
    light: {
      status: raw?.light?.status ?? false,
      brightness: raw?.light?.brightness ?? 100,
      schedule: raw?.light?.schedule ?? [],
    },
    watering: {
      autoMode: raw?.watering?.autoMode ?? false,
      intervalHours: raw?.watering?.intervalHours ?? 6,
      schedule: raw?.watering?.schedule ?? [],
    },
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(`/api/devices/${deviceId}/config`);
        if (res.ok) {
          const data = await res.json();
          setConfig(normalizeConfig(data.config));
          setError(null);
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data?.error || `Failed to load device config (${res.status})`);
        }
      } catch (error) {
        console.error("Failed to fetch config:", error);
        setError(error instanceof Error ? error.message : "Failed to load device config");
      } finally {
        setLoading(false);
      }
    }

    if (deviceId) {
      fetchConfig();
    }
  }, [deviceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--emerald-400)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl p-6" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "#F87171" }}>Sensor Control unavailable</h2>
        <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
          {error}
        </p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>No device configuration found.</p>
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
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pump Control */}
        <PumpControl
          deviceId={deviceId as string}
          initialStatus={config.pump.status}
          initialSchedule={config.pump.schedule}
          onUpdate={(updated) => setConfig({ ...config, pump: updated.pump })}
        />

        {/* Light Control */}
        <LightControl
          deviceId={deviceId as string}
          initialStatus={config.light.status}
          initialBrightness={config.light.brightness}
          initialSchedule={config.light.schedule}
          onUpdate={(updated) => setConfig({ ...config, light: updated.light })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <WateringSchedule
          deviceId={deviceId as string}
          initialWatering={config.watering}
          onUpdate={(updated) => setConfig({ ...config, watering: updated.watering })}
        />

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

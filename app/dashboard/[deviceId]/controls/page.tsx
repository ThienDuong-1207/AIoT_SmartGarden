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
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const [configRes, latestRes] = await Promise.all([
          fetch(`/api/devices/${deviceId}/config`),
          fetch(`/api/devices/${deviceId}/latest`),
        ]);

        if (configRes.ok) {
          const data = await configRes.json();
          setConfig(normalizeConfig(data.config));
          setError(null);
        } else {
          const data = await configRes.json().catch(() => ({}));
          setError(data?.error || `Failed to load device config (${configRes.status})`);
          setConfig(normalizeConfig(null));
        }

        if (latestRes.ok) {
          const latestData = await latestRes.json();
          setIsConnected(Boolean(latestData?.device?.isOnline));
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.error("Failed to fetch config:", error);
        setError(error instanceof Error ? error.message : "Failed to load device config");
        setConfig(normalizeConfig(null));
        setIsConnected(false);
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

  if (!config) return null;

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

      <div className="rounded-lg p-3 flex items-center justify-between" style={{ background: isConnected ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)", border: isConnected ? "1px solid rgba(16,185,129,0.20)" : "1px solid rgba(239,68,68,0.20)" }}>
        <p className="text-xs font-semibold" style={{ color: isConnected ? "var(--emerald-400)" : "#F87171" }}>
          {isConnected ? "Connected" : "Unconnected"}
        </p>
        <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
          {isConnected ? "Device is online. Controls are enabled." : "Device is offline. Controls are disabled."}
        </p>
      </div>

      {error && (
        <div className="rounded-2xl p-4" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)" }}>
          <p className="text-xs" style={{ color: "#FBBF24" }}>
            {error}
          </p>
        </div>
      )}

      {/* Grid of Controls */}
      <div className="grid gap-4 md:grid-cols-1">
        <SensorCalibrationWizard
          deviceId={deviceId as string}
          initialSensor={config.sensor}
          disabled={!isConnected}
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

"use client";

import { useState } from "react";
import { X, Loader } from "lucide-react";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDeviceModal({ isOpen, onClose, onSuccess }: AddDeviceModalProps) {
  const [activationCode, setActivationCode] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activationCode: activationCode.trim(),
          name: deviceName.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add device");
      }

      setSuccess(true);
      setActivationCode("");
      setDeviceName("");

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 animate-scale-in"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-normal)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Add Device
          </h2>
          <button
            onClick={onClose}
            className="btn-icon"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-full mx-auto"
              style={{ background: "rgba(16,185,129,0.10)" }}
            >
              <span style={{ color: "var(--emerald-400)", fontSize: "24px" }}>✓</span>
            </div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Device added successfully!
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Your device is now linked to your account.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Activation Code */}
            <div>
              <label className="mb-2 block text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                Activation Code *
              </label>
              <input
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                placeholder="Enter activation code from device"
                className="dark-input w-full text-sm"
                disabled={loading}
                autoFocus
              />
              <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                Found on the device label or documentation
              </p>
            </div>

            {/* Device Name */}
            <div>
              <label className="mb-2 block text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                Device Name (optional)
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. Kitchen Basil"
                className="dark-input w-full text-sm"
                disabled={loading}
              />
            </div>

            {/* Error message */}
            {error && (
              <div
                className="flex items-start gap-2 rounded-lg p-3 text-sm"
                style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.20)" }}
              >
                <span style={{ color: "#F87171", marginTop: "2px" }}>⚠</span>
                <p style={{ color: "#F87171" }}>{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !activationCode.trim()}
                className="btn-emerald flex-1 text-sm"
              >
                {loading ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Device"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

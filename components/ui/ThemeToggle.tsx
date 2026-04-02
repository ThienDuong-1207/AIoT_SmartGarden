"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme, THEME_OPTIONS, type Theme } from "@/components/providers/ThemeProvider";
import { Check, ChevronDown, Droplets, Flame, Palette } from "lucide-react";

const THEME_META: Record<Theme, { label: string; hint: string; icon: typeof Palette; color: string; chipBg: string }> = {
  forest: { label: "Forest", hint: "Default green", icon: Palette, color: "var(--emerald-500)", chipBg: "rgba(16,185,129,0.12)" },
  ocean: { label: "Ocean", hint: "Blue / cyan", icon: Droplets, color: "var(--cyan-500)", chipBg: "rgba(6,182,212,0.12)" },
  sunset: { label: "Sunset", hint: "Warm amber", icon: Flame, color: "var(--gold-500)", chipBg: "rgba(245,158,11,0.12)" },
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const current = THEME_META[theme];
  const CurrentIcon = current.icon;
  const displayLabel = mounted ? current.label : "Theme";
  const displayHint = mounted ? `Theme: ${current.label}` : "Theme presets";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="btn-icon inline-flex items-center gap-1.5 px-3 w-auto"
        title={displayHint}
        aria-label="Open theme presets"
        suppressHydrationWarning
      >
        {mounted ? <CurrentIcon size={16} style={{ color: current.color }} /> : <Palette size={16} style={{ color: "var(--text-secondary)" }} />}
        <span className="hidden text-xs font-semibold md:inline" style={{ color: "var(--text-secondary)" }}>
          {displayLabel}
        </span>
        <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border shadow-xl"
          style={{ background: "var(--bg-overlay)", borderColor: "var(--border-subtle)" }}
        >
          <div className="border-b px-3 py-2" style={{ borderColor: "var(--border-subtle)" }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
              Theme Presets
            </p>
          </div>
          <div className="p-1">
            {THEME_OPTIONS.map((option) => {
              const meta = THEME_META[option];
              const OptionIcon = meta.icon;
              const active = option === theme;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setTheme(option);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/5"
                  style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)" }}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: meta.chipBg }}>
                    <OptionIcon size={15} style={{ color: meta.color }} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold">{meta.label}</span>
                    <span className="block text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {meta.hint}
                    </span>
                  </span>
                  {active && <Check size={14} style={{ color: current.color }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

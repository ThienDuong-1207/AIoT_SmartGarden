"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ScanEye, TrendingUp, Cpu, BellDot, Wifi, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ─────────────────────────────────────
   HUD Components
───────────────────────────────────── */
export function HudCorners() {
  const c = "absolute w-3 h-3 border-[1.5px] border-[rgba(34,211,238,0.5)] pointer-events-none z-20";
  return (
    <>
      <div className={`${c} top-[-1px] left-[-1px] border-r-0 border-b-0`} />
      <div className={`${c} top-[-1px] right-[-1px] border-l-0 border-b-0`} />
      <div className={`${c} bottom-[-1px] left-[-1px] border-r-0 border-t-0`} />
      <div className={`${c} bottom-[-1px] right-[-1px] border-l-0 border-t-0`} />
    </>
  );
}

/* ─────────────────────────────────────
   Scroll-reveal hook
───────────────────────────────────── */
// counters will be controlled via GSAP in Master Timeline

/* ─────────────────────────────────────
   Vision AI — Holographic Feed
───────────────────────────────────── */
function VisionMockup({ visible }: { visible: boolean }) {
  return (
    <div
      className="absolute inset-y-0 right-0 w-[52%] overflow-hidden"
      style={{ borderLeft: "1px solid rgba(6,182,212,0.2)" }}
    >
      {/* Container for feed */}
      <div className="relative h-full w-full bg-black">
        
        {/* The plant image strictly filtered identically to HUD expectations */}
        <Image
          src="/images/chaucay.webp"
          alt="Vision Target"
          fill
          className="object-cover"
          style={{
            filter: "grayscale(100%) brightness(0.8) sepia(100%) hue-rotate(140deg) saturate(200%)",
            opacity: 0.85
          }}
        />

        {/* Scan lines & Noise Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')",
            opacity: 0.12,
            mixBlendMode: "overlay"
          }}
        />
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.08) 2px, rgba(34,211,238,0.08) 4px)",
            backgroundSize: "100% 4px"
          }} 
        />

        {/* Corner HUD framing for the feed block */}
        <HudCorners />

        {/* Detection Box 1 — Stroke only, coord label */}
        <div
          className="absolute"
          style={{
            left: "24%", top: "32%",
            width: 80, height: 80,
            border: "1px solid var(--cyan-500)",
            boxShadow: "0 0 8px rgba(34,211,238,0.2) inset"
          }}
        >
          {/* Target Reticle corners on the box itself */}
          <div className="absolute top-[-3px] left-[-3px] w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-[var(--cyan-400)]" />
          <div className="absolute bottom-[-3px] right-[-3px] w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-[var(--cyan-400)]" />

          <span
            className="absolute -top-7 left-0 px-1 py-0.5 font-mono text-[9px] font-bold"
            style={{ color: "var(--cyan-400)", whiteSpace: "nowrap" }}
          >
            Anomaly_01 <span className="bento-counter-87">0</span>%<br/>
            [<span className="text-[7px] text-[var(--cyan-600)]">240, 320, 80, 80</span>]
          </span>
        </div>

        {/* Animated scan line sweeping down */}
        <div
          className="vision-scan-line absolute inset-x-0 top-0 h-px"
          style={{
            background: "rgba(34,211,238,0.6)",
            boxShadow: "0 0 12px 2px rgba(34,211,238,0.6)",
            transform: "translateY(0px)",
          }}
        />

        {/* Status bar */}
        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-1.5 border-t border-[rgba(34,211,238,0.3)] backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <span className="font-mono text-[10px] uppercase font-bold tracking-widest" style={{ color: "var(--cyan-500)" }}>
            CAM_01 · <span className="animate-pulse">REC</span>
          </span>
          <span className="font-mono text-[9px]" style={{ color: "var(--cyan-400)" }}>
             <span className="bento-counter-2">0</span> anomalies DETECTED
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Telemetry — Holographic Line Only
───────────────────────────────────── */
function TelemetryChart({ visible }: { visible: boolean }) {
  // A clean, techy wave
  const LINE = "M0,48 L10,48 L20,40 L30,40 L40,32 L50,42 L60,28 L70,30 L80,20 L90,20 L100,12 L110,18 L120,5 L130,10 L140,5 L150,15 L160,8 L170,12 L180,2 L190,5 L200,0";

  return (
    <div
      className="overflow-hidden rounded-xl p-3 relative h-[80px]"
      style={{
        background: "rgba(0,0,0,0.4)",
        border: "1px solid rgba(34,211,238,0.15)",
      }}
    >
      <HudCorners />
      {/* Axes */}
      <div className="absolute left-3 bottom-5 right-3 h-[1px] bg-[rgba(34,211,238,0.2)]" />
      <div className="absolute left-3 bottom-5 top-3 w-[1px] bg-[rgba(34,211,238,0.2)]" />
      
      {/* Grid lines */}
      <div className="absolute left-3 bottom-[50%] right-3 h-[1px] bg-[rgba(34,211,238,0.05)] border-dashed border-b border-[rgba(34,211,238,0.1)]" />

      <svg
        viewBox="0 0 200 56"
        fill="none"
        className="w-full h-full pb-3 pl-1"
        aria-hidden="true"
      >
        {/* Line completely without fill */}
        <path
          d={LINE}
          stroke="#06B6D4"
          strokeWidth="1.2"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
          strokeDasharray="400"
          className="telemetry-path"
          style={{ 
            strokeDashoffset: 400,
            filter: "drop-shadow(0px 0px 4px rgba(6,182,212,0.6))"
          }}
        />
        {/* End dot */}
        <circle cx="200" cy="0" r="2" fill="#22D3EE" className="telemetry-dot" opacity="0" />
      </svg>

      {/* Terminology */}
      <div className="absolute bottom-1 w-full left-0 px-3 flex justify-between">
        <span className="font-mono text-[8.5px]" style={{ color: "var(--text-muted)" }}>
          T-24H
        </span>
        <span className="font-mono text-[8.5px] uppercase font-bold" style={{ color: "var(--cyan-400)" }}>
          SYNC ↑
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Hardware Status Blueprint
───────────────────────────────────── */
function CircuitMockup() {
  const STATUS = [
    { label: "WIFI_LINK",  on: true  },
    { label: "MQTT_BUS",   on: true  },
    { label: "PROC_UNIT",  on: false },
  ];

  return (
    <div className="space-y-3 relative p-1">
      {/* Chip Blueprint */}
      <div
        className="relative flex items-center justify-center py-4"
        style={{
          background: "transparent",
          border: "1px dashed rgba(34,211,238,0.3)",
        }}
      >
        <HudCorners />
        {/* SVG Chip Drawing */}
        <svg width="80" height="40" viewBox="0 0 80 40" className="opacity-80">
          <rect x="25" y="5" width="30" height="30" fill="none" stroke="#22D3EE" strokeWidth="1" />
          <rect x="28" y="8" width="24" height="24" fill="rgba(34,211,238,0.1)" stroke="#06B6D4" strokeWidth="0.5" />
          {/* Pins Top/Bottom */}
          {[1,2,3,4,5,6].map((i) => (
            <g key={i}>
              <rect x={25 + i * 4.2} y="1" width="1.5" height="4" fill="#0891B2" />
              <rect x={25 + i * 4.2} y="35" width="1.5" height="4" fill="#0891B2" />
            </g>
          ))}
          {/* Pins Left/Right */}
          {[1,2,3,4,5,6].map((i) => (
            <g key={`h${i}`}>
              <rect x="21" y={5 + i * 4.2} width="4" height="1.5" fill="#0891B2" />
              <rect x="55" y={5 + i * 4.2} width="4" height="1.5" fill="#0891B2" />
            </g>
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-mono text-[7px] font-bold text-[#22D3EE] tracking-widest mt-0.5 shadow-xl">MCU-XX</span>
        </div>
      </div>

      {/* Terminal lines styling */}
      <div className="flex flex-col gap-1.5 mt-2">
        {STATUS.map(({ label, on }) => (
          <div key={label} className="flex justify-between items-center text-[9px] font-mono border-b border-[rgba(34,211,238,0.1)] pb-1">
            <span style={{ color: "var(--text-muted)" }}>{label}</span>
            <div className="flex items-center gap-1.5">
              <span style={{ color: on ? "var(--cyan-400)" : "var(--text-muted)", fontWeight: "bold" }}>
                {on ? "STATUS: ONLINE" : "STATUS: OFFLINE"}
              </span>
              <div 
                className={`w-1.5 h-1.5 rounded-full ${on ? 'animate-pulse' : ''}`} 
                style={{ 
                  backgroundColor: on ? "var(--cyan-400)" : "var(--text-muted)",
                  boxShadow: on ? "0 0 6px var(--cyan-500)" : "none" 
                }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   FCM — Log lines preview
───────────────────────────────────── */
function NotificationStack() {
  const NOTIFS = [
    { title: "SYS_SYNC_COMPLETE", sub: "HEX: 0x2A3F · RT: 2m" },
    { title: "NET_STABILITY_OK",  sub: "LATENCY: 12ms · RT: 15m" },
  ];

  return (
    <div className="space-y-2">
      {NOTIFS.map(({ title, sub }, i) => (
        <div
          key={title}
          className="relative px-3 py-2"
          style={{
            background: "rgba(0,0,0,0.4)",
            borderLeft: "2px solid var(--cyan-500)",
            transform: i === 1 ? "scale(0.98)" : "scale(1)",
            opacity: i === 1 ? 0.65 : 1,
            transition: "transform 0.2s ease",
          }}
        >
          <div className="min-w-0 font-mono">
            <p className="truncate text-[10px] font-bold uppercase tracking-wider text-[var(--cyan-400)]">
              &gt; {title}
            </p>
            <p className="mt-0.5 text-[8.5px] text-[var(--text-muted)]">
              [LOG] {sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────
   Main component
───────────────────────────────────── */
export default function BentoGrid() {
  const containerRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Empty: Master Timeline will scrub DOM directly using classes
  }, []);

  return (
    <section
      id="bento-grid"
      ref={containerRef as any}
      className="bento-section absolute inset-0 z-20 opacity-0 invisible flex flex-col justify-center w-full max-w-6xl mx-auto px-4 md:px-6"
    >
      <div className="relative z-10 w-full">

        {/* ── Section header ── */}
        <div
          className="mb-14 flex flex-col items-center justify-center text-center"
        >
          <span
            className="bento-subtitle font-mono text-[10px] font-bold mb-4 px-2 py-1"
            style={{ color: "var(--text-muted)", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          >
            [ SYST_LOAD: 0x3B9F ]
          </span>
          <p
            className="bento-subtitle mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--cyan-500)" }}
          >
            // DATA_MATRIX_INITIALIZED
          </p>
          <h2
            className="bento-title text-3xl md:text-5xl font-extrabold leading-tight uppercase text-white"
          >
            Mạng lưới phân tích <br/> Thời gian thực
          </h2>
        </div>

        {/* ── Bento grid ── */}
        <div
          className="grid auto-rows-[220px] grid-cols-1 gap-5 md:grid-cols-4 md:grid-rows-2"
        >
          {/* ══ Card 1: Vision AI (2×2) ══ */}
          <div
            className="bento-card dark-card group relative col-span-1 overflow-hidden md:col-span-2 md:row-span-2"
          >
            <HudCorners />
            <div className="relative z-10 flex h-full flex-col justify-between p-6 w-[48%]">
              <div>
                <span
                  className="font-mono text-[11px] font-bold uppercase tracking-[0.15em]"
                  style={{ color: "var(--cyan-500)" }}
                >
                  <span className="mr-2 animate-pulse">●</span>OPTICS_NET
                </span>
                <p
                  className="mt-6 text-[13px] leading-relaxed font-mono"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Liên tục định vị và xử lý nhận diện tín hiệu sinh khối qua phân tích phổ ảnh.
                </p>
              </div>

              {/* Data tags matrix */}
              <div className="grid grid-cols-2 gap-2 mt-4 font-mono text-[9px] font-bold tracking-widest text-[var(--cyan-400)]">
                <div className="border border-[rgba(34,211,238,0.3)] bg-black/40 px-2 py-1.5 uppercase text-center">Scan_Rate</div>
                <div className="border border-[rgba(34,211,238,0.3)] bg-black/40 px-2 py-1.5 uppercase text-center">30_FPS</div>
                <div className="col-span-2 border border-[rgba(34,211,238,0.3)] bg-black/40 px-2 py-1.5 uppercase text-center flex justify-between">
                  <span>LATENCY</span>
                  <span>12MS</span>
                </div>
              </div>
            </div>

            <VisionMockup visible={revealed} />
          </div>

          {/* ══ Card 2: Telemetry (2×1) ══ */}
          <div
            className="bento-card dark-card group relative col-span-1 flex flex-col justify-between p-5 md:col-span-2"
          >
            <HudCorners />
            <div className="relative z-10 flex items-start justify-between">
              <span
                className="font-mono text-[11px] font-bold uppercase tracking-[0.15em]"
                style={{ color: "var(--cyan-500)" }}
              >
                TELEMETRY_STREAM
              </span>
              <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 border border-[rgba(34,211,238,0.3)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--cyan-500)]" />
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[var(--cyan-400)]">
                  LIVE
                </span>
              </div>
            </div>

            <div className="relative z-10 flex-1 py-1">
              <TelemetryChart visible={revealed} />
            </div>
          </div>

          {/* ══ Card 3: ESP32 (1×1) ══ */}
          <div
            className="bento-card dark-card group relative col-span-1 flex flex-col justify-between p-5"
          >
            <HudCorners />
            <div className="flex items-start justify-between">
              <span
                className="font-mono text-[11px] font-bold uppercase tracking-[0.15em]"
                style={{ color: "var(--cyan-500)" }}
              >
                SYS_HARDWARE
              </span>
            </div>
            <CircuitMockup />
          </div>

          {/* ══ Card 4: FCM Alerts (1×1) ══ */}
          <div
            className="bento-card dark-card group relative col-span-1 flex flex-col justify-between p-5"
          >
            <HudCorners />
            <div className="relative z-10 flex items-start justify-between">
              <span
                className="font-mono text-[11px] font-bold uppercase tracking-[0.15em]"
                style={{ color: "var(--cyan-500)" }}
              >
                EVENT_LOG
              </span>
            </div>

            <div className="relative z-10 flex-1 py-3">
              <NotificationStack />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

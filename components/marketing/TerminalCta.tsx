"use client";

import { Terminal, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function TerminalCta() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* ── Section header ── */}
      <div className="mb-12 flex flex-col items-center justify-center text-center w-full">
        <span
          className="font-mono text-[10px] font-bold mb-4 px-3 py-1 bg-cyan-950/40 text-cyan-400 rounded-full border border-cyan-800/50"
        >
          [ SYST_LOAD: 0x7A1E ]
        </span>
        <p
          className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-600"
        >
          // SYSTEM_OVERRIDE
        </p>
        <h2
          className="text-3xl md:text-5xl font-black leading-tight uppercase text-white"
        >
          Mở khóa <br/><span className="text-gradient-cyan">truy cập toàn diện</span>
        </h2>
      </div>

      {/* Terminal panel */}
      <div
        className="eco-card overflow-hidden w-full max-w-4xl border-white/5 bg-white/5 shadow-2xl"
      >
        {/* Terminal title bar */}
        <div
          className="flex items-center gap-2 px-4 py-4 bg-white/5 border-b border-white/5"
        >
          {/* Traffic light dots */}
          <div className="h-3 w-3 rounded-full bg-red-400/50" />
          <div className="h-3 w-3 rounded-full bg-amber-400/50" />
          <div className="h-3 w-3 rounded-full bg-emerald-400/50" />
          <div className="ml-4 flex items-center gap-2">
            <Terminal size={14} className="text-slate-600" />
            <span
              className="font-mono text-xs font-bold text-slate-500"
            >
              bash — root@smart-garden
            </span>
          </div>
        </div>

        {/* Terminal body */}
        <div className="p-8 font-mono text-sm min-h-[300px] bg-slate-900 shadow-inner">
          {/* Command line */}
          <div className="mb-2 text-cyan-400 font-bold">
            $ <span id="term-cmd" className="text-white">./initialize_garden.sh</span>
            <span className="term-cursor inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
          </div>

          {/* Output lines */}
          <div className="mb-8 space-y-2 text-slate-300">
            <p className="flex gap-2">
              <span className="text-cyan-600 font-bold">[....]</span>
              Loading protocols...
            </p>
            <p className="flex gap-2">
              <span className="text-emerald-500 font-bold">[OK]</span>
              Core modules ready.
            </p>
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-cyan-400 font-bold">
                Khu vực sinh thái số đã trực tuyến hoàn toàn.
              </p>
              <p className="text-slate-400 mt-1">
                Nhập truy cập Root:
              </p>
            </div>
          </div>

          {/* Input row */}
          <div
            className="flex flex-col gap-4 sm:flex-row sm:items-stretch"
          >
            <div
              className="flex flex-1 items-center gap-3 rounded-xl px-5 py-4 bg-black/40 border border-white/10 transition-all focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20"
            >
              <span className="text-cyan-500 font-bold">&gt;</span>
              <input
                type="email"
                placeholder="root@matrix.com"
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-600"
              />
            </div>

            <button
              type="button"
              className="group flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95"
            >
              Execute
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Bottom hint */}
          <p
            className="mt-6 text-xs text-slate-500 italic"
          >
            // Xác thực quyền khởi tạo không gian sinh trưởng.
          </p>
        </div>
      </div>
    </div>
  );
}

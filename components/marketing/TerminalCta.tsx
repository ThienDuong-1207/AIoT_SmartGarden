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
          className="font-mono text-[10px] font-bold mb-4 px-3 py-1 bg-teal-900/30 text-teal-400 rounded-full border border-teal-500/20"
        >
          [ SYST_LOAD: 0x7A1E ]
        </span>
        <p
          className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400"
        >
          // SYSTEM_OVERRIDE
        </p>
        <h2
          className="text-3xl md:text-5xl font-black leading-tight uppercase text-white"
        >
          Unlock <br/><span className="text-emerald-400">full access</span>
        </h2>
      </div>

      {/* Terminal panel */}
      <div
        className="overflow-hidden w-full max-w-4xl bg-[#080808] border border-white/10 rounded-2xl shadow-2xl"
      >
        {/* Terminal title bar */}
        <div
          className="flex items-center gap-2 px-4 py-4 bg-white/[0.02] border-b border-white/5"
        >
          {/* Traffic light dots */}
          <div className="h-3 w-3 rounded-full bg-red-400/20 border border-red-500/30" />
          <div className="h-3 w-3 rounded-full bg-amber-400/20 border border-amber-500/30" />
          <div className="h-3 w-3 rounded-full bg-emerald-400/20 border border-emerald-500/30" />
          <div className="ml-4 flex items-center gap-2">
            <Terminal size={14} className="text-slate-500" />
            <span
              className="font-mono text-xs font-bold text-slate-400"
            >
              eco-sync-protocol — root@smart-garden
            </span>
          </div>
        </div>

        {/* Terminal body */}
        <div className="p-8 font-mono text-sm min-h-[300px] bg-black/40 shadow-inner">
          {/* Command line */}
          <div className="mb-2 text-emerald-400 font-bold">
            $ <span id="term-cmd" className="text-white">./initialize_garden.sh</span>
            <span className="term-cursor inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse" />
          </div>

          {/* Output lines */}
          <div className="mb-8 space-y-2 text-slate-300">
            <p className="flex gap-2">
              <span className="text-emerald-500 font-bold">[....]</span>
              Loading protocols...
            </p>
            <p className="flex gap-2">
              <span className="text-teal-400 font-bold">[OK]</span>
              Core modules ready.
            </p>
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-emerald-400 font-bold">
                The digital ecosystem is now fully online.
              </p>
              <p className="text-slate-400 mt-1">
                Enter your access address:
              </p>
            </div>
          </div>

          {/* Input row */}
          <div
            className="flex flex-col gap-4 sm:flex-row sm:items-stretch"
          >
            <div
              className="flex flex-1 items-center gap-3 rounded-xl px-5 py-4 bg-black/20 border border-white/10 transition-all focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/10"
            >
              <span className="text-emerald-500 font-bold">&gt;</span>
              <input
                type="email"
                placeholder="Enter your email..."
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <button
              type="button"
              className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-white transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              ACTIVATE
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Bottom hint */}
          <p
            className="mt-6 text-xs text-slate-500 italic"
          >
            // Verifying initialization rights for the growing space.
          </p>
        </div>
      </div>
    </div>
  );
}

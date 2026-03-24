"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import ProductCard from "@/components/marketing/ProductCard";
import { sampleProducts } from "@/lib/mock-data";
import HomeHero from "@/components/marketing/HomeHero";
import BentoGrid from "@/components/marketing/BentoGrid";
import TerminalCta from "@/components/marketing/TerminalCta";
import SiteFooter from "@/components/marketing/SiteFooter";
import LoadingScreen from "@/components/marketing/LoadingScreen";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const TRUST_ITEMS = [
  "500+ vườn đang hoạt động",
  "YOLOv8 Vision AI",
  "MQTT Realtime < 200ms",
  "MongoDB Atlas Time-Series",
  "Firebase Push Alerts",
];

export default function Home() {
  const [loadingDone, setLoadingDone] = useState(false);

  useGSAP(() => {
    // Master Timeline in HomeHero.tsx handles animations now.
  });

  return (
    <main className="flex-1 relative bg-transparent overflow-hidden">
      {/* SCANNING REVEAL PLANE */}
      <div 
        id="scan-plane"
        className="absolute inset-x-0 top-0 z-[35] h-[30vh] pointer-events-none opacity-0 invisible"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(34,211,238,0.02) 80%, rgba(34,211,238,0.15) 100%)",
          borderBottom: "1px solid rgba(34,211,238,0.4)",
          transform: "translateY(-100%)",
        }}
      />

      {!loadingDone ? <LoadingScreen onComplete={() => setLoadingDone(true)} /> : null}

      <div id="main-canvas" className="relative w-full h-[100vh] overflow-hidden">
        <HomeHero isLoaded={loadingDone} shouldPlayVideo={loadingDone} />

        {/* ── Stats Trust Bar (Temporarily hidden for cinematic flow) ── */}
        {/* <div className="w-full overflow-x-auto">...</div> */}

        <BentoGrid />

        {/* ── Product Strip ── */}
        <section
          id="hardware-store-section"
          className="hardware-section absolute inset-0 z-30 opacity-0 invisible flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 md:px-6"
        >
        {/* Section header */}
        <div className="mb-14 flex flex-col items-start md:items-center justify-center text-center">
          <span
            className="hardware-subtitle font-mono text-[10px] font-bold mb-4 px-2 py-1"
            style={{ color: "var(--text-muted)", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          >
            [ SYST_LOAD: 0x8F2C ]
          </span>
          <p
            className="hardware-subtitle mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--cyan-500)" }}
          >
            // HARDWARE_CONEXUS
          </p>
          <h2
            className="hardware-title text-3xl md:text-5xl font-extrabold leading-tight uppercase text-white"
          >
            Nâng cấp hệ thống
          </h2>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/products"
            className="link-muted flex shrink-0 items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-widest transition-all"
            style={{
              background: "rgba(34,211,238,0.1)",
              border: "1px solid var(--cyan-500)",
              color: "var(--cyan-400)",
            }}
          >
            Truy cập Kho dữ liệu
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Product cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sampleProducts.slice(0, 3).map((product, i) => (
            <div
              key={product.slug}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      <TerminalCta />
      </div>

      <SiteFooter />
    </main>
  );
}

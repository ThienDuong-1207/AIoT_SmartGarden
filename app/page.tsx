"use client";

import { useState, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!loadingDone) return;

    // ── SCROLL TRIGGER BATCH ANIMATION ──
    // Apply reveal effect to all elements with .eco-card class
    ScrollTrigger.batch(".eco-card", {
      onEnter: (elements) => {
        gsap.fromTo(
          elements,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            overwrite: true,
          }
        );
      },
      once: true,
    });

    // --- HARDWARE CARDS BATCH ANIMATION ---
    gsap.set(".hardware-card", { y: 50, autoAlpha: 0 });
    ScrollTrigger.batch(".hardware-card", {
      start: "top 85%",
      onEnter: (elements) => {
        gsap.to(elements, { 
          y: 0, 
          autoAlpha: 1, 
          duration: 0.8, 
          stagger: 0.15, 
          ease: "power2.out" 
        });
      },
      once: true
    });
  }, { dependencies: [loadingDone], scope: containerRef });

  return (
    <main ref={containerRef} className="flex-1 relative bg-[#030303] min-h-screen text-white">
      {!loadingDone ? <LoadingScreen onComplete={() => setLoadingDone(true)} /> : null}

      {/* --- HERO SECTION --- */}
      <section className="relative w-full">
        <HomeHero isLoaded={loadingDone} shouldPlayVideo={loadingDone} />
      </section>

      {/* --- BENTO GRID SECTION --- */}
      <section id="features" className="eco-section">
        <div className="container-app">
          <BentoGrid />
        </div>
      </section>

      {/* --- HARDWARE STORE SECTION --- */}
      <section id="hardware" className="eco-section">
        <div className="container-app">
          {/* Section header */}
          <div className="mb-16 flex flex-col items-center text-center">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
              // HARDWARE_CONEXUS
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              Nâng cấp <span className="text-emerald-400">hệ thống</span>
            </h2>
            <p className="mt-4 max-w-2xl text-slate-300">
              Các module phần cứng được tinh chỉnh tối ưu cho việc vận hành vườn thông minh AIoT.
            </p>
          </div>

          {/* Product cards grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {sampleProducts.slice(0, 3).map((product) => (
              <div key={product.slug} className="hardware-card overflow-hidden h-full flex flex-col" style={{ willChange: "transform, opacity" }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <Link
              href="/products"
              className="group flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-cyan-600 hover:shadow-xl active:scale-95"
            >
              Xem tất cả sản phẩm
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- TERMINAL CTA SECTION --- */}
      <section id="community" className="eco-section">
        <div className="container-app">
          <TerminalCta />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

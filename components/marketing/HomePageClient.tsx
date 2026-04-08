"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/marketing/ProductCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const HomeHero = dynamic(() => import("@/components/marketing/HomeHero"));
const BentoGrid = dynamic(() => import("@/components/marketing/BentoGrid"));
const TerminalCta = dynamic(() => import("@/components/marketing/TerminalCta"));
const SiteFooter = dynamic(() => import("@/components/marketing/SiteFooter"));
const LoadingScreen = dynamic(() => import("@/components/marketing/LoadingScreen"));

type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number | null;
  rating?: number;
  images?: string[];
};

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function HomePageClient({ products }: { products: Product[] }) {
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
    <main ref={containerRef} className="flex-1 relative bg-transparent min-h-screen text-white">
      {!loadingDone ? <LoadingScreen onComplete={() => setLoadingDone(true)} /> : null}

      {/* --- HERO SECTION --- */}
      <section className="relative w-full">
        <HomeHero isLoaded={loadingDone} shouldPlayVideo={loadingDone} />
      </section>

      {/* --- BENTO GRID SECTION --- */}
      <section id="features" className="eco-section bg-transparent">
        <div className="container-app">
          <BentoGrid />
        </div>
      </section>

      {/* --- HARDWARE STORE SECTION --- */}
      <section id="hardware" className="eco-section bg-transparent relative z-10">
        <div className="container-app">
          {/* Section header */}
          <div className="mb-16 flex flex-col items-center text-center">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400/60 mb-3">
              // HARDWARE_CONEXUS
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
              Upgrade Your <span className="text-emerald-400">System</span>
            </h2>
            <p className="mt-4 max-w-2xl text-slate-300">
              Hardware modules fine-tuned for running your AIoT Smart Garden ecosystem.
            </p>
          </div>

          {/* Product cards grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 3).map((product) => (
              <div key={product.slug} className="hardware-card overflow-hidden h-full flex flex-col" style={{ willChange: "transform, opacity" }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <Link
              href="/products"
              className="group flex items-center gap-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md px-8 py-4 text-sm font-bold uppercase tracking-widest text-emerald-400 transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:shadow-xl active:scale-95"
            >
              View All Products
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- TERMINAL CTA SECTION --- */}
      <section id="community" className="eco-section bg-transparent relative z-10">
        <div className="container-app">
          <TerminalCta />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

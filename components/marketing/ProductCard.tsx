"use client";

import Link from "next/link";
import { ArrowRight, Star, Leaf, FlaskConical, Cpu, Tag, ShoppingCart, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, useGSAP);

type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number | null;
  rating?: number;
};

/* ── Per-category design tokens (Eco-Tech Emerald) ── */
const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    gradient: string;
    glow: string;
    accent: string;
    accentBg: string;
    accentBorder: string;
    badgeColor: string;
  }
> = {
  seeds: {
    label: "Hạt Giống",
    icon: Leaf,
    gradient: "transparent",
    glow: "rgba(16, 185, 129, 0.15)",
    accent: "#34D399", // Emerald 400
    accentBg: "rgba(16, 185, 129, 0.05)",
    accentBorder: "rgba(16, 185, 129, 0.2)",
    badgeColor: "#10B981", // Emerald 500
  },
  nutrients: {
    label: "Dinh Dưỡng",
    icon: FlaskConical,
    gradient: "transparent",
    glow: "rgba(20, 184, 166, 0.15)",
    accent: "#2DD4BF", // Teal 400
    accentBg: "rgba(20, 184, 166, 0.05)",
    accentBorder: "rgba(20, 184, 166, 0.2)",
    badgeColor: "#14B8A6", // Teal 500
  },
  "smart-pots": {
    label: "Smart Pot",
    icon: Cpu,
    gradient: "transparent",
    glow: "rgba(5, 150, 105, 0.15)",
    accent: "#10B981", // Emerald 500
    accentBg: "rgba(5, 150, 105, 0.05)",
    accentBorder: "rgba(5, 150, 105, 0.2)",
    badgeColor: "#059669", // Emerald 600
  },
};

const FALLBACK_CONFIG = CATEGORY_CONFIG["seeds"];

export default function ProductCard({ product }: { product: Product }) {
  const displayedPrice = product.salePrice ?? product.price;
  const hasDiscount    = Boolean(product.salePrice);
  const cfg            = CATEGORY_CONFIG[product.category] ?? FALLBACK_CONFIG;
  const Icon           = cfg.icon;
  const discountPct    = hasDiscount
    ? Math.round((1 - (product.salePrice! / product.price)) * 100)
    : 0;

  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Empty context: local ScrollTriggers removed for Master Timeline centralization

  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleMouseEnter = contextSafe(() => {
    gsap.to(".product-card-glass", { 
      borderColor: "rgba(52, 211, 153, 0.3)", 
      background: "rgba(255, 255, 255, 0.06)",
      y: -4,
      duration: 0.4, 
      ease: "power2.out" 
    });
    
    // Phase 1: Hologram Lift
    gsap.to(".hologram-lift-wrapper", {
      z: 80,
      filter: "brightness(1.5)",
      duration: 0.4,
      ease: "power2.out"
    });

    // Phase 2: Depth text
    gsap.to(".content-zone", {
      z: -20,
      opacity: 0.8,
      duration: 0.4,
      ease: "power2.out"
    });

    // Phase 3: Reveal base and pulse
    gsap.to(".hologram-projection-base", {
      autoAlpha: 1,
      scale: 1.3,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(".hologram-projection-base", {
          opacity: 0.4,
          scale: 1.1,
          duration: 0.8,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut"
        });
      }
    });
  });

  const handleMouseLeave = contextSafe(() => {
    gsap.to(".product-card-glass", { 
      borderColor: "rgba(255, 255, 255, 0.1)", 
      background: "rgba(255, 255, 255, 0.02)",
      y: 0,
      duration: 0.4, 
      ease: "power2.out" 
    });
    
    // Revert Lift
    gsap.to(".hologram-lift-wrapper", {
      z: 20,
      filter: "brightness(1)",
      duration: 0.4,
      ease: "power2.out"
    });

    // Revert text
    gsap.to(".content-zone", {
      z: 0,
      opacity: 1,
      duration: 0.4,
      ease: "power2.out"
    });

    // Hide base
    gsap.killTweensOf(".hologram-projection-base");
    gsap.to(".hologram-projection-base", {
      autoAlpha: 0,
      scale: 0.8,
      duration: 0.4,
      ease: "power2.out"
    });
  });

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    add({ slug: product.slug, name: product.name, category: product.category, price: product.price, salePrice: product.salePrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div ref={containerRef} className="relative w-full h-full" style={{ perspective: "1000px" }}>
      <article
        className="product-card-glass group relative flex flex-col overflow-hidden h-full bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-md transition-all duration-300 ease-out transform-gpu will-change-transform hover:shadow-[0_8px_32px_rgba(16,185,129,0.1)]"
        style={{
          transformStyle: "preserve-3d",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >

      {/* ── Visual zone ── */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: 180, background: cfg.gradient }}
      >
        {/* Ambient glow blob */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${cfg.glow} 0%, transparent 70%)`,
          }}
        />

        {/* Decorative grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Central Icon Hologram System */}
        <div className="relative flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
          
          {/* Phase 3 Base Projection Ring */}
          <div 
            className="hologram-projection-base absolute inset-0 rounded-full"
            style={{
              border: `1px solid ${cfg.accent}33`,
              boxShadow: `0 0 15px ${cfg.glow}`,
              transform: "translateZ(0px) scale(0.8)",
              background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`
            }}
          />

          {/* Phase 1 The Lift Wrapper */}
          <div
            className="hologram-lift-wrapper relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{
              background: cfg.accentBg,
              border: `1px solid ${cfg.accentBorder}`,
              backdropFilter: "blur(12px)",
              boxShadow: `0 0 32px ${cfg.glow}`,
              transform: "translateZ(20px)",
            }}
          >
            <Icon size={36} style={{ color: cfg.accent }} />
          </div>
        </div>

        {/* Floating category badge — top left */}
        <div
          className="absolute left-3.5 top-3.5 flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-slate-800/50 border border-slate-700 backdrop-blur-md"
        >
          <span
            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
          />
          <span
            className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-300"
          >
            {cfg.label}
          </span>
        </div>

        {/* Sale badge — top right */}
        {hasDiscount && (
          <div
            className="absolute right-3.5 top-3.5 flex items-center gap-1 rounded-full px-2 py-1 bg-emerald-500/10 border border-emerald-500/20"
          >
            <Tag size={9} className="text-emerald-400" />
            <span className="font-mono text-[10px] font-bold text-emerald-400">
              -{discountPct}%
            </span>
          </div>
        )}
      </div>

      {/* ── Content zone ── */}
      <div 
        className="content-zone flex flex-1 flex-col p-5"
        style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d", willChange: "transform, opacity" }}
      >
        {/* Rating */}
        <div className="mb-3 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={10}
              fill={(product.rating ?? 0) > i ? "currentColor" : "none"}
              className={(product.rating ?? 0) > i ? "text-emerald-500" : "text-white/10"}
            />
          ))}
          <span
            className="ml-1 font-mono text-[10px]"
            style={{ color: "var(--text-muted)" }}
          >
            {(product.rating ?? 0).toFixed(1)}
          </span>
        </div>

        {/* Name */}
        <h3
          className="line-clamp-2 text-base font-bold leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {product.name}
        </h3>

        <p
          className="mt-1.5 line-clamp-2 text-xs leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          Module hỗ trợ kỹ thuật và vận hành cao cấp.
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + CTA */}
        <div
          className="mt-4 pt-4"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          {/* Price row */}
          <div className="mb-3 flex items-baseline gap-2">
            <span
              className="text-2xl font-black text-emerald-400"
            >
              {displayedPrice.toLocaleString("vi-VN")}đ
            </span>
            {hasDiscount && (
              <span
                className="text-xs line-through"
                style={{ color: "var(--text-muted)" }}
              >
                {product.price.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>

          {/* CTA row */}
          <div className="flex gap-2">
            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold bg-transparent border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              {added ? <Check size={12} /> : <ShoppingCart size={12} />}
              {added ? "Đã chọn!" : "Chọn mua"}
            </button>

            {/* View detail */}
            <Link
              href={`/products/${product.slug}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-150 hover:bg-white/5"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
              }}
              title="Phân tích"
            >
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </article>
    </div>
  );
}

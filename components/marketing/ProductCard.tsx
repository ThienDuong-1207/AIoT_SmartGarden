"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Leaf, FlaskConical, Cpu, Tag, ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";

type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number | null;
  rating?: number;
  images?: string[];
};

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; accent: string; accentBg: string; accentBorder: string }
> = {
  seeds: {
    label: "Seeds",
    icon: Leaf,
    accent: "var(--emerald-400)",
    accentBg: "rgba(16,185,129,0.08)",
    accentBorder: "rgba(16,185,129,0.20)",
  },
  nutrients: {
    label: "Nutrients",
    icon: FlaskConical,
    accent: "#60A5FA",
    accentBg: "rgba(96,165,250,0.08)",
    accentBorder: "rgba(96,165,250,0.20)",
  },
  "smart-pots": {
    label: "Smart Pot",
    icon: Cpu,
    accent: "var(--gold-400)",
    accentBg: "rgba(245,158,11,0.08)",
    accentBorder: "rgba(245,158,11,0.20)",
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

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    add({ slug: product.slug, name: product.name, category: product.category, price: product.price, salePrice: product.salePrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article
      className="group relative flex h-[430px] flex-col overflow-hidden rounded-2xl transition-all duration-200 sm:h-[450px] lg:h-[460px]"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = cfg.accentBorder;
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.2)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-0"
        aria-label={`View details for ${product.name}`}
        title="View details"
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {/* ── Visual zone ── */}
        <div
          className="relative flex-1 overflow-hidden"
          style={{ background: cfg.accentBg }}
        >
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: "var(--bg-elevated)", border: `1px solid ${cfg.accentBorder}` }}
              >
                <Icon size={28} style={{ color: cfg.accent }} />
              </div>
            </div>
          )}

          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.22) 42%, rgba(0,0,0,0.10) 100%)",
            }}
          />

          {/* Category badge */}
          <div
            className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{
              background: "rgba(0,0,0,0.40)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.accent }} />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#fff" }}>
              {cfg.label}
            </span>
          </div>

          {/* Discount badge */}
          {hasDiscount && (
            <div
              className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full px-2 py-1"
              style={{
                background: "rgba(0,0,0,0.40)",
                border: "1px solid rgba(239,68,68,0.35)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Tag size={9} style={{ color: "#F87171" }} />
              <span className="font-mono text-[10px] font-bold" style={{ color: "#F87171" }}>
                -{discountPct}%
              </span>
            </div>
          )}

          {/* Overlaid components */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-4 text-white">
            <div className="mb-2 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  fill={(product.rating ?? 0) > i ? "currentColor" : "none"}
                  style={{ color: (product.rating ?? 0) > i ? cfg.accent : "rgba(255,255,255,0.35)" }}
                />
              ))}
              <span className="ml-1 font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.70)" }}>
                {(product.rating ?? 0).toFixed(1)}
              </span>
            </div>

            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white drop-shadow-sm">
              {product.name}
            </h3>

            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/75">
              Premium cultivation support for better yields.
            </p>
          </div>
        </div>

        {/* ── Footer zone ── */}
        <div className="relative z-10 flex flex-none flex-col p-4 pointer-events-none">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-xl font-black" style={{ color: cfg.accent }}>
              ${displayedPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {hasDiscount && (
              <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>
                ${product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>

          <div className="pointer-events-auto flex gap-2">
            <button
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all duration-150"
              style={{
                background: added ? cfg.accentBg : cfg.accentBg,
                color: added ? cfg.accent : cfg.accent,
                border: `1px solid ${added ? cfg.accentBorder : cfg.accentBorder}`,
              }}
            >
              {added ? <Check size={12} /> : <ShoppingCart size={12} />}
              {added ? "Added!" : "Add to Cart"}
            </button>

            <Link
              href={`/products/${product.slug}`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-150"
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
              }}
              title="View details"
            >
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

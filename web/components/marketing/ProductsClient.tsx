"use client";

import { useState, useMemo } from "react";
import {
  SlidersHorizontal,
  Package,
  ChevronDown,
  Leaf,
  FlaskConical,
  Cpu,
  LayoutGrid,
  X,
} from "lucide-react";
import ProductCard from "@/components/marketing/ProductCard";

type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number | null;
  rating?: number;
  stock?: number;
};

/* ── Category config ── */
const CATEGORIES = [
  { value: "all",        label: "Tất cả",     icon: LayoutGrid,   dot: "rgba(255,255,255,0.4)" },
  { value: "seeds",      label: "Hạt Giống",  icon: Leaf,         dot: "var(--cyan-500)"    },
  { value: "nutrients",  label: "Dinh Dưỡng", icon: FlaskConical, dot: "var(--cyan-400)"    },
  { value: "smart-pots", label: "Smart Pot",  icon: Cpu,          dot: "var(--cyan-600)"    },
];

const SORT_OPTIONS = [
  { value: "default",    label: "Mặc định"     },
  { value: "price-asc",  label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "rating",     label: "Đánh giá cao" },
  { value: "sale",       label: "Đang giảm giá"},
];

export default function ProductsClient({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy]                 = useState("default");
  const [sortOpen, setSortOpen]             = useState(false);

  /* ── Filtered + sorted list ── */
  const displayed = useMemo(() => {
    let list = activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

    switch (sortBy) {
      case "price-asc":
        list = [...list].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case "price-desc":
        list = [...list].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case "rating":
        list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "sale":
        list = [...list].filter((p) => p.salePrice);
        break;
    }
    return list;
  }, [products, activeCategory, sortBy]);

  /* ── Count per category ── */
  const countOf = (cat: string) =>
    cat === "all" ? products.length : products.filter((p) => p.category === cat).length;

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Mặc định";

  return (
    <>
      {/* ══════════════════════════════════════
          Filter + Sort bar (sticky)
      ══════════════════════════════════════ */}
      <div
        className="sticky z-30"
        style={{
          top: "72px",
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(34, 211, 238, 0.1)",
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 overflow-x-auto px-4 py-3 md:px-8">

          {/* Category tabs */}
          <div className="flex items-center gap-1.5">
            {CATEGORIES.map(({ value, label, icon: Icon, dot }) => {
              const active = value === activeCategory;
              return (
                <button
                  key={value}
                  onClick={() => setActiveCategory(value)}
                  className="flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200"
                  style={
                    active
                      ? {
                          background: "rgba(6,182,212,0.12)",
                          color: "var(--cyan-400)",
                          border: "1px solid rgba(6,182,212,0.28)",
                        }
                      : {
                          background: "transparent",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-subtle)",
                        }
                  }
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: active ? dot : "var(--text-muted)", flexShrink: 0 }}
                  />
                  <Icon size={11} />
                  {label}
                  <span
                    className="rounded-full px-1.5 py-0.5 font-mono text-[10px]"
                    style={{
                      background: active ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.06)",
                      color: active ? "var(--cyan-400)" : "var(--text-muted)",
                    }}
                  >
                    {countOf(value)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-semibold transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              <SlidersHorizontal size={11} />
              {activeSortLabel}
              <ChevronDown
                size={11}
                style={{ transform: sortOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
              />
            </button>

            {sortOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl py-1 glass-panel"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(34, 211, 238, 0.15)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                }}
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => { setSortBy(value); setSortOpen(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors"
                    style={{
                      color: sortBy === value ? "var(--cyan-400)" : "var(--text-secondary)",
                      background: sortBy === value ? "rgba(6,182,212,0.08)" : "transparent",
                    }}
                  >
                    {sortBy === value && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: "var(--cyan-500)", flexShrink: 0 }}
                      />
                    )}
                    {sortBy !== value && <span className="h-1.5 w-1.5" />}
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          Results summary + Active filters
      ══════════════════════════════════════ */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 md:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>
              {displayed.length}
            </span>{" "}
            sản phẩm
          </span>

          {/* Active filter chips */}
          {activeCategory !== "all" && (
            <button
              onClick={() => setActiveCategory("all")}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
              style={{
                background: "rgba(6,182,212,0.08)",
                border: "1px solid rgba(6,182,212,0.20)",
                color: "var(--cyan-400)",
              }}
            >
              {CATEGORIES.find((c) => c.value === activeCategory)?.label}
              <X size={10} />
            </button>
          )}
          {sortBy !== "default" && (
            <button
              onClick={() => setSortBy("default")}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              {activeSortLabel}
              <X size={10} />
            </button>
          )}
        </div>

        {/* ── Product grid ── */}
        {displayed.length > 0 ? (
          <div className="grid gap-5 pb-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayed.map((product, i) => (
              <div
                key={product.slug}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          /* ── Empty state ── */
          <div
            className="flex flex-col items-center justify-center rounded-3xl py-28 text-center"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(12px)",
              border: "1px dashed rgba(34, 211, 238, 0.2)",
            }}
          >
            <div
              className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Package size={28} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Không tìm thấy sản phẩm
            </p>
            <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
              Thử chọn danh mục khác hoặc xoá bộ lọc.
            </p>
            <button
              onClick={() => { setActiveCategory("all"); setSortBy("default"); }}
              className="btn-cyan mt-6 gap-2 text-xs"
            >
              Xoá bộ lọc
            </button>
          </div>
        )}
      </div>
    </>
  );
}

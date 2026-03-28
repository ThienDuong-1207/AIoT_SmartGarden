"use client";

import { useCart } from "@/components/providers/CartProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, Trash2, Plus, Minus,
  ArrowLeft, ArrowRight, ShoppingBag, Tag,
  Leaf, FlaskConical, Cpu, CreditCard,
} from "lucide-react";
import GalaxyBackground from "@/components/ui/GalaxyBackground";

const CATEGORY_COLOR: Record<string, string> = {
  seeds:        "var(--emerald-400)",
  nutrients:    "#60A5FA",
  "smart-pots": "var(--gold-400)",
};

const CATEGORY_ICON: Record<string, React.ElementType> = {
  seeds:        Leaf,
  nutrients:    FlaskConical,
  "smart-pots": Cpu,
};

function fmt(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function CartPage() {
  const { items, count, total, setQty, remove, clear } = useCart();
  const router = useRouter();

  const shipping   = total >= 500000 ? 0 : 35000;
  const grandTotal = total + shipping;

  function handleCheckout() {
    clear();
    router.push("/checkout/success");
  }

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <main className="relative flex min-h-dvh flex-col items-center justify-center gap-6 px-4 bg-transparent overflow-hidden">
        <GalaxyBackground />
        <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-sm">
          <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-transform hover:scale-110 duration-500">
            <ShoppingCart size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
              GIỎ HÀNG <span className="text-emerald-400">TRỐNG</span>
            </h2>
            <p className="mt-4 text-slate-400 font-medium leading-relaxed">
              Dường như bạn chưa chọn được sản phẩm ưng ý. Hãy tiếp tục khám phá khu vườn công nghệ của chúng tôi.
            </p>
          </div>
          <Link href="/products" className="group relative px-8 py-4 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl overflow-hidden transition-all hover:bg-emerald-400 hover:-translate-y-1 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-3">
            <ShoppingBag size={20} />
            KHÁM PHÁ SẢN PHẨM
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-transparent overflow-hidden pt-24 pb-12 px-4">
      <GalaxyBackground />
      <div className="w-full max-w-6xl mx-auto relative z-10">

        {/* Header (Centered & Compact) */}
        <div className="mb-16 text-center">
          <p className="mb-4 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">
            {"// SHOPPING CART"}
          </p>
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <span className="text-white">GIỎ</span> <span className="text-emerald-400">HÀNG</span>
            </h1>
            <span className="px-3 py-1 text-[10px] font-black bg-white/10 border border-white/20 text-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)] uppercase tracking-[0.1em]">
              {count} SẢN PHẨM TRONG GIỎ
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Item list ── */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {items.map((item) => {
              const color   = CATEGORY_COLOR[item.category] ?? "var(--emerald-400)";
              const Icon    = CATEGORY_ICON[item.category] ?? Leaf;
              const price   = item.salePrice ?? item.price;
              const hasDisc = Boolean(item.salePrice);

              return (
                <div
                  key={item.slug}
                  className="flex items-center gap-6 rounded-2xl p-5 bg-white/[0.02] backdrop-blur-md border border-white/10 transition-all hover:bg-white/[0.04] group/item shadow-xl overflow-hidden"
                >
                  {/* Icon Frame (Reduced) */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-transform group-hover/item:scale-105">
                    <Icon size={28} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {item.name}
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="font-bold text-base text-emerald-400">
                        {fmt(price)}
                      </span>
                      {hasDisc && (
                        <span className="text-xs line-through text-slate-500">
                          {fmt(item.price)}
                        </span>
                      )}
                      {hasDisc && (
                        <span
                          className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold"
                          style={{ background: "rgba(249,115,22,0.12)", color: "#F97316" }}
                        >
                          <Tag size={8} />
                          -{Math.round((1 - price / item.price) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Qty controls (Refined Pill) */}
                  <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-full p-1 px-4 h-9 shadow-inner">
                    <button
                      onClick={() => setQty(item.slug, item.qty - 1)}
                      className="text-slate-500 hover:text-emerald-400 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center font-bold text-sm text-white">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => setQty(item.slug, item.qty + 1)}
                      className="text-slate-500 hover:text-emerald-400 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Item total (Reduced) */}
                  <p className="hidden w-28 text-right font-bold text-white text-sm sm:block">
                    {fmt(price * item.qty)}
                  </p>

                  {/* Remove */}
                  <button
                    onClick={() => remove(item.slug)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}

            <div className="flex justify-end pt-4">
              <button
                onClick={clear}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-all px-4 py-2"
              >
                <Trash2 size={14} />
                XOÁ TẤT CẢ GIỎ HÀNG
              </button>
            </div>
          </div>

          {/* ── Order summary block ── */}
          <div className="col-span-12 lg:col-span-4 h-fit rounded-[2rem] bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 sticky top-24 shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all hover:border-emerald-500/10">
            <p className="mb-6 font-mono text-[9px] font-black uppercase tracking-[0.3em] text-teal-400 text-center">
              ORDER SUMMARY
            </p>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>
                  Tạm tính ({count} sản phẩm)
                </span>
                <span style={{ color: "var(--text-primary)" }}>{fmt(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>Phí vận chuyển</span>
                {shipping === 0
                  ? <span style={{ color: "var(--emerald-400)" }}>Miễn phí</span>
                  : <span style={{ color: "var(--text-primary)" }}>{fmt(shipping)}</span>
                }
              </div>
              {shipping > 0 && (
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Mua thêm {fmt(500000 - total)} để được miễn phí vận chuyển
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 mt-8 border-t border-white/5 pt-6 text-center">
              <span className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-500">TOTAL AMOUNT</span>
              <span className="text-2xl font-black text-white">
                {fmt(grandTotal)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-emerald-500 text-white font-black uppercase tracking-widest py-4 mt-8 rounded-xl hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 flex justify-center items-center gap-3 group text-xs"
            >
              <CreditCard size={18} className="group-hover:scale-110 transition-transform" />
              TIẾN HÀNH THANH TOÁN
            </button>

            <div className="mt-8 space-y-3 pt-6 border-t border-white/5">
              {[
                { label: "Bảo hành 12 tháng chính hãng", icon: "✓" },
                { label: "Đổi trả trong 30 ngày", icon: "↺" },
                { label: "Thanh toán an toàn · SSL", icon: "🔒" },
              ].map(({ label, icon }) => (
                <p key={label} className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                  <span className="text-emerald-500 text-sm">{icon}</span> {label}
                </p>
              ))}
            </div>
            </div>
          </div>
        </div>
    </main>
  );
}

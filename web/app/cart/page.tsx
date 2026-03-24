"use client";

import { useCart } from "@/components/providers/CartProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, Trash2, Plus, Minus,
  ArrowLeft, ArrowRight, ShoppingBag, Tag,
  Leaf, FlaskConical, Cpu,
} from "lucide-react";

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
      <main
        className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4"
        style={{ background: "var(--bg-base)", paddingTop: "72px" }}
      >
        <div
          className="flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(74,222,128,0.18)" }}
        >
          <ShoppingCart size={32} style={{ color: "var(--emerald-400)" }} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
            Giỏ hàng trống
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Khám phá sản phẩm và thêm vào giỏ hàng của bạn.
          </p>
        </div>
        <Link href="/products" className="btn-emerald gap-2 px-6 py-3">
          <ShoppingBag size={15} />
          Khám phá sản phẩm
        </Link>
      </main>
    );
  }

  return (
    <main
      className="min-h-dvh"
      style={{ background: "var(--bg-base)", paddingTop: "72px" }}
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p
              className="mb-1 font-mono text-xs font-semibold uppercase tracking-[0.15em]"
              style={{ color: "var(--emerald-500)" }}
            >
              // CART
            </p>
            <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              Giỏ hàng
              <span
                className="ml-3 rounded-full px-2.5 py-0.5 text-base font-bold"
                style={{ background: "rgba(34,197,94,0.12)", color: "var(--emerald-400)" }}
              >
                {count}
              </span>
            </h1>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft size={14} />
            Tiếp tục mua sắm
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* ── Item list ── */}
          <div className="space-y-3">
            {items.map((item) => {
              const color   = CATEGORY_COLOR[item.category] ?? "var(--emerald-400)";
              const Icon    = CATEGORY_ICON[item.category] ?? Leaf;
              const price   = item.salePrice ?? item.price;
              const hasDisc = Boolean(item.salePrice);

              return (
                <div
                  key={item.slug}
                  className="flex items-center gap-4 rounded-2xl p-4"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
                >
                  {/* Icon */}
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${color}18`, border: `1px solid ${color}33` }}
                  >
                    <Icon size={24} style={{ color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {item.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-sm font-black" style={{ color }}>
                        {fmt(price)}
                      </span>
                      {hasDisc && (
                        <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>
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

                  {/* Qty controls */}
                  <div
                    className="flex items-center gap-1 rounded-xl p-1"
                    style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}
                  >
                    <button
                      onClick={() => setQty(item.slug, item.qty - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Minus size={12} />
                    </button>
                    <span
                      className="w-7 text-center font-mono text-sm font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.qty}
                    </span>
                    <button
                      onClick={() => setQty(item.slug, item.qty + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Item total */}
                  <p
                    className="hidden w-28 text-right font-mono text-sm font-black sm:block"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {fmt(price * item.qty)}
                  </p>

                  {/* Remove */}
                  <button
                    onClick={() => remove(item.slug)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}

            <div className="flex justify-end">
              <button
                onClick={clear}
                className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                <Trash2 size={11} />
                Xoá tất cả
              </button>
            </div>
          </div>

          {/* ── Order summary ── */}
          <div
            className="h-fit rounded-2xl p-5"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <p
              className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Tóm tắt đơn hàng
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

            <div className="my-4" style={{ borderTop: "1px solid var(--border-subtle)" }} />

            <div className="flex items-baseline justify-between">
              <span className="font-bold" style={{ color: "var(--text-primary)" }}>Tổng cộng</span>
              <span className="text-2xl font-black" style={{ color: "var(--emerald-400)" }}>
                {fmt(grandTotal)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="btn-emerald mt-5 w-full justify-center gap-2 py-3"
            >
              Thanh toán
              <ArrowRight size={15} />
            </button>

            <Link
              href="/products"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              <ArrowLeft size={12} />
              Tiếp tục mua sắm
            </Link>

            <div className="mt-5 space-y-2 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              {["Bảo hành 12 tháng chính hãng", "Đổi trả trong 30 ngày", "Thanh toán an toàn · SSL"].map((t) => (
                <p key={t} className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  <span style={{ color: "var(--emerald-500)" }}>✓</span> {t}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

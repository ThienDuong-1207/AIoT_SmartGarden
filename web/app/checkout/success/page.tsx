"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle, ShoppingBag, LayoutDashboard,
  Package, Truck, Leaf,
} from "lucide-react";

const ORDER_NUM = `SG-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

const STEPS = [
  { icon: Package, label: "Xác nhận đơn",  desc: "Đơn hàng đã được ghi nhận",      done: true  },
  { icon: Truck,   label: "Đang chuẩn bị", desc: "Kho đang đóng gói sản phẩm",     done: true  },
  { icon: Truck,   label: "Vận chuyển",    desc: "Dự kiến 2–4 ngày làm việc",       done: false },
  { icon: Leaf,    label: "Đã nhận hàng",  desc: "Kích hoạt thiết bị trong 30 ngày", done: false },
];

export default function CheckoutSuccessPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-4 py-16"
      style={{ background: "var(--bg-base)", paddingTop: "88px" }}
    >
      {/* ── Success card ── */}
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl transition-all duration-700"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
        }}
      >
        {/* Green top bar */}
        <div
          className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg, var(--emerald-600), var(--emerald-400), #86EFAC)" }}
        />

        <div className="p-8">
          {/* Check icon */}
          <div className="flex justify-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                background: "rgba(34,197,94,0.10)",
                border: "2px solid rgba(74,222,128,0.30)",
                boxShadow: "0 0 40px rgba(34,197,94,0.20)",
              }}
            >
              <CheckCircle size={40} style={{ color: "var(--emerald-400)" }} />
            </div>
          </div>

          {/* Title */}
          <div className="mt-6 text-center">
            <h1
              className="text-2xl font-black"
              style={{ color: "var(--text-primary)" }}
            >
              Thanh toán thành công!
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Cảm ơn bạn đã tin tưởng Smart Garden AIoT 🌿
            </p>
          </div>

          {/* Order number */}
          <div
            className="mt-5 flex items-center justify-between rounded-xl px-4 py-3"
            style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}
          >
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Mã đơn hàng</span>
            <span
              className="font-mono text-sm font-bold"
              style={{ color: "var(--emerald-400)" }}
            >
              {ORDER_NUM}
            </span>
          </div>

          {/* Order tracking steps */}
          <div className="mt-6 space-y-0">
            {STEPS.map(({ icon: Icon, label, desc, done }, i) => (
              <div key={label} className="flex gap-4">
                {/* Connector */}
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: done ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${done ? "rgba(74,222,128,0.35)" : "var(--border-subtle)"}`,
                    }}
                  >
                    <Icon size={14} style={{ color: done ? "var(--emerald-400)" : "var(--text-muted)" }} />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="my-1 w-px flex-1"
                      style={{
                        background: done ? "rgba(74,222,128,0.25)" : "var(--border-subtle)",
                        minHeight: 20,
                      }}
                    />
                  )}
                </div>

                {/* Text */}
                <div className="pb-4 pt-1">
                  <p
                    className="text-xs font-semibold"
                    style={{ color: done ? "var(--text-primary)" : "var(--text-muted)" }}
                  >
                    {label}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Info note */}
          <div
            className="mt-2 rounded-xl p-3"
            style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(74,222,128,0.15)" }}
          >
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Email xác nhận đã được gửi đến tài khoản của bạn. Sau khi nhận hàng,
              sử dụng <span style={{ color: "var(--emerald-400)" }}>activation code</span> trong
              hộp để liên kết Smart Pot với dashboard.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/dashboard" className="btn-emerald w-full justify-center gap-2 py-3">
              <LayoutDashboard size={15} />
              Truy cập Dashboard
            </Link>
            <Link
              href="/products"
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              <ShoppingBag size={14} />
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

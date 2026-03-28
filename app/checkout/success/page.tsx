"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle, ShoppingBag, LayoutDashboard,
  Package, Truck, Leaf, Cpu, FlaskConical,
} from "lucide-react";
import GalaxyBackground from "@/components/ui/GalaxyBackground";

const STEPS = [
  { icon: Package, label: "Xác nhận",  desc: "Đã ghi nhận",      done: true  },
  { icon: Truck,   label: "Chuẩn bị",  desc: "Đang đóng gói",    done: true  },
  { icon: Truck,   label: "Vận chuyển", desc: "Dự kiến 2-4 ngày", done: false },
  { icon: Leaf,    label: "Nhận hàng",  desc: "Kích hoạt thiết bị", done: false },
];

const MOCK_ITEMS = [
  { id: 1, name: "Smart Pot v2 - Emerald", price: 1250000, qty: 1, icon: Cpu, color: "text-emerald-400" },
  { id: 2, name: "Dinh dưỡng Bio-Grow", price: 350000, qty: 2, icon: FlaskConical, color: "text-teal-400" },
];

export default function CheckoutSuccessPage() {
  const [visible, setVisible] = useState(false);
  const [orderId, setOrderId] = useState("SG-202XMM-0000");

  useEffect(() => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const random = String(Math.floor(Math.random() * 9000) + 1000);
    setOrderId(`SG-${year}${month}-${random}`);
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="relative h-screen min-h-[600px] overflow-hidden flex flex-col items-center px-4 pt-32 pb-8">
      <GalaxyBackground />

      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto transform-gpu scale-[0.98] md:scale-95 origin-top">
        {/* ── Header System ── */}
        <div className={`mb-3 text-center transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
          <div className="w-8 h-8 mx-auto bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center ring-4 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-2.5">
            <CheckCircle size={16} className="fill-emerald-400/10" />
          </div>
          <h1 className="text-base md:text-lg font-black tracking-tight uppercase leading-none">
            <span className="text-white block md:inline">Thanh toán</span>
            <span className="text-emerald-400 md:ml-2 block md:inline">Thành công!</span>
          </h1>
          <p className="text-emerald-100/20 text-[8px] font-bold uppercase tracking-[0.3em] mt-1">
            Hệ thống Smart Garden đã xác nhận
          </p>
        </div>

        {/* ── 2-Column Dashboard ── */}
        <div className={`flex flex-col md:flex-row gap-4 w-full transition-all duration-1000 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          
          {/* LEFT COLUMN: Danh sách sản phẩm */}
          <div className="flex-1 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl p-4 flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
            <h2 className="text-white/30 text-[7px] font-bold uppercase tracking-[0.2em] text-center mb-3.5">Danh sách sản phẩm</h2>
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar max-h-[180px]">
              {MOCK_ITEMS.map((item) => (
                <div key={item.id} className="flex flex-col items-center bg-white/[0.02] border border-white/5 rounded-xl p-2 text-center transition-colors hover:bg-white/[0.04]">
                  <div className={`w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center mb-1 ${item.color}`}>
                    <item.icon size={14} />
                  </div>
                  <h3 className="text-white/80 font-bold text-[8.5px] uppercase tracking-wide line-clamp-1">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-emerald-100/20 text-[7px]">Qty: {item.qty}</span>
                    <span className="text-emerald-400/80 font-mono text-[8px] font-bold">{(item.price * item.qty).toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 backdrop-blur-md">
              <span className="text-emerald-100/20 text-[7px] font-bold uppercase tracking-widest">Mã đơn</span>
              <span className="font-mono text-white/60 text-[9px] font-bold tracking-wider">{orderId}</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Tóm tắt & Timeline */}
          <div className="flex-1 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl p-4 flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
            <h2 className="text-white/30 text-[7px] font-bold uppercase tracking-[0.2em] text-center mb-3.5">Tóm tắt đơn hàng</h2>
            
            {/* Detailed Summary */}
            <div className="space-y-1 mb-3.5">
              <div className="flex justify-between text-[8px] text-emerald-100/20">
                <span>Tạm tính</span>
                <span className="font-mono">1.950.000đ</span>
              </div>
              <div className="flex justify-between text-[8px] text-emerald-100/20">
                <span>Vận chuyển</span>
                <span className="text-emerald-400/60">Free</span>
              </div>
              <div className="pt-1.5 mt-1 border-t border-white/5 flex justify-between items-baseline">
                <span className="text-[7.5px] font-bold text-white uppercase tracking-wider">Tổng cộng</span>
                <span className="text-sm font-black text-emerald-400 font-mono">1.950.000đ</span>
              </div>
            </div>

            {/* Compressed Timeline */}
            <div className="flex-1 px-1">
              <div className="text-[7px] font-bold text-emerald-400/30 uppercase tracking-widest mb-2.5 px-1">Lộ trình</div>
              <div className="space-y-1.5">
                {STEPS.map(({ icon: Icon, label, desc, done }, i) => (
                  <div key={label} className="flex gap-2 group">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors ${done ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-white/10 border border-white/10"}`}>
                        <Icon size={8} />
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`w-px h-1.5 mt-0.5 ${done ? "bg-emerald-500/30" : "bg-white/5"}`} />
                      )}
                    </div>
                    <div className="pt-0">
                      <p className={`text-[7.5px] font-bold uppercase tracking-wider leading-none ${done ? "text-emerald-400" : "text-white/10"}`}>{label}</p>
                      <p className={`text-[6.5px] mt-0.5 ${done ? "text-emerald-100/20" : "text-white/5"}`}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compact Actions */}
            <div className="mt-4 flex flex-col gap-1.5">
              <Link href="/dashboard" className="w-full bg-emerald-500/90 hover:bg-emerald-500 text-white text-[8px] font-bold uppercase tracking-wider py-1.5 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:-translate-y-0.5 flex justify-center items-center gap-1.5 group">
                <LayoutDashboard size={10} className="group-hover:rotate-6 transition-transform" />
                Dashboard
              </Link>
              <Link href="/products" className="w-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 text-[7.5px] font-medium py-1 rounded-lg transition-all flex justify-center items-center gap-1.5 group">
                <ShoppingBag size={10} className="text-emerald-400/60 group-hover:scale-110 transition-transform" />
                Mua sắm
              </Link>
            </div>
          </div>
        </div>

        <p className={`mt-5 text-white/5 text-[7px] font-mono uppercase tracking-[0.8em] transition-opacity duration-1000 delay-700 ${visible ? "opacity-100" : "opacity-0"}`}>
          Smart Garden AIoT © 2026
        </p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 1.5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.03); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.1); }
      `}</style>
    </main>
  );
}

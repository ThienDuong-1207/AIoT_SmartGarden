"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface AdminOrderActionsProps {
  orderId: string;
  currentOrderStatus: "pending" | "processing" | "completed" | "cancelled";
  currentPaymentStatus: "pending" | "paid" | "failed";
}

export default function AdminOrderActions({
  orderId,
  currentOrderStatus,
  currentPaymentStatus,
}: AdminOrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateOrder = async (payload: {
    orderStatus?: "pending" | "processing" | "completed" | "cancelled";
    paymentStatus?: "pending" | "paid" | "failed";
  }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...payload }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Cập nhật đơn hàng thất bại");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        disabled={loading || currentOrderStatus === "processing"}
        onClick={() => updateOrder({ orderStatus: "processing" })}
        className="rounded-md px-2.5 py-1.5 text-xs font-medium disabled:opacity-60"
        style={{ border: "1px solid rgba(59,130,246,0.35)", color: "var(--blue-400)", background: "rgba(59,130,246,0.08)" }}
      >
        Processing
      </button>
      <button
        disabled={loading || currentOrderStatus === "completed"}
        onClick={() => updateOrder({ orderStatus: "completed" })}
        className="rounded-md px-2.5 py-1.5 text-xs font-medium disabled:opacity-60"
        style={{ border: "1px solid var(--border-emerald)", color: "var(--emerald-400)", background: "rgba(16,185,129,0.08)" }}
      >
        Completed
      </button>
      <button
        disabled={loading || currentPaymentStatus === "paid"}
        onClick={() => updateOrder({ paymentStatus: "paid" })}
        className="rounded-md px-2.5 py-1.5 text-xs font-medium disabled:opacity-60"
        style={{ border: "1px solid rgba(245,158,11,0.35)", color: "var(--gold-400)", background: "rgba(245,158,11,0.08)" }}
      >
        Mark Paid
      </button>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface AdminProductDeleteButtonProps {
  productId: string;
}

export default function AdminProductDeleteButton({ productId }: AdminProductDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa sản phẩm này?");
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Xóa sản phẩm thất bại");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      disabled={loading}
      onClick={onDelete}
      className="rounded-md px-2.5 py-1.5 text-xs font-medium disabled:opacity-60"
      style={{ border: "1px solid rgba(239,68,68,0.35)", color: "var(--danger)", background: "rgba(239,68,68,0.08)" }}
    >
      Xóa
    </button>
  );
}

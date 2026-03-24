"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UserRole = "customer" | "admin";
type UserStatus = "active" | "banned";

interface AdminUserActionsProps {
  userId: string;
  currentRole: UserRole;
  currentStatus: UserStatus;
}

export default function AdminUserActions({ userId, currentRole, currentStatus }: AdminUserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateUser = async (payload: Partial<{ role: UserRole; status: UserStatus }>) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Cập nhật thất bại");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const softDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Xóa mềm thất bại");
        return;
      }
      router.push("/admin/users");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        disabled={loading}
        onClick={() => updateUser({ role: currentRole === "admin" ? "customer" : "admin" })}
        className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
        style={{ border: "1px solid var(--border-normal)", color: "var(--text-primary)", background: "var(--bg-overlay)" }}
      >
        {currentRole === "admin" ? "Đổi thành Customer" : "Đổi thành Admin"}
      </button>
      <button
        disabled={loading}
        onClick={() => updateUser({ status: currentStatus === "active" ? "banned" : "active" })}
        className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
        style={{ border: "1px solid rgba(245,158,11,0.35)", color: "var(--gold-400)", background: "rgba(245,158,11,0.08)" }}
      >
        {currentStatus === "active" ? "Ban User" : "Bỏ Ban"}
      </button>
      <button
        disabled={loading}
        onClick={softDelete}
        className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60 sm:col-span-2"
        style={{ border: "1px solid rgba(239,68,68,0.35)", color: "var(--danger)", background: "rgba(239,68,68,0.08)" }}
      >
        Xóa mềm tài khoản
      </button>
    </div>
  );
}

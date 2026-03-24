"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { Leaf } from "lucide-react";

export default function RegisterPage() {
  useEffect(() => {
    void signIn("google", { callbackUrl: "/auth/redirect" });
  }, []);

  return (
    <main
      className="flex min-h-dvh w-full items-center justify-center px-4"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl p-10 text-center"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* Spinning logo */}
        <div
          className="flex h-12 w-12 animate-spin items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, var(--emerald-500), var(--emerald-600))",
            animationDuration: "2s",
          }}
        >
          <Leaf size={20} color="#fff" />
        </div>

        <div>
          <p
            className="font-mono text-xs font-semibold uppercase tracking-[0.15em]"
            style={{ color: "var(--emerald-500)" }}
          >
            // REDIRECTING
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Đang chuyển hướng đến Google OAuth để tạo tài khoản an toàn...
          </p>
        </div>

        {/* Progress bar */}
        <div
          className="h-px w-full overflow-hidden rounded-full"
          style={{ background: "var(--border-subtle)" }}
        >
          <div
            className="h-full animate-pulse rounded-full"
            style={{
              width: "60%",
              background:
                "linear-gradient(90deg, var(--emerald-600), var(--emerald-400))",
            }}
          />
        </div>
      </div>
    </main>
  );
}

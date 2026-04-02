"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProviders, signIn } from "next-auth/react";
import { Globe, KeyRound, Leaf, Mail, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false);

  useEffect(() => {
    void (async () => {
      const providers = await getProviders();
      setIsGoogleAvailable(Boolean(providers?.google));
    })();
  }, []);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      }),
    });

    const data = (await res.json()) as { error?: string };

    if (!res.ok) {
      setIsSubmitting(false);
      setError(data.error || "Registration failed");
      return;
    }

    await signIn("credentials", {
      email: email.trim(),
      password: password.trim(),
      redirect: true,
      callbackUrl: "/dashboard",
    });
  }

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
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, var(--emerald-500), var(--emerald-600))",
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
            Create your customer account with email and password.
          </p>
        </div>

        <form onSubmit={handleRegister} className="w-full space-y-3">
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm"
              style={{ background: "var(--bg-base)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              required
            />
          </div>

          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm"
              style={{ background: "var(--bg-base)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              required
            />
          </div>

          <div className="relative">
            <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 chars)"
              className="w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm"
              style={{ background: "var(--bg-base)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="rounded-xl border px-3 py-2 text-xs" style={{ borderColor: "rgba(239,68,68,0.35)", color: "#f87171", background: "rgba(239,68,68,0.08)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--emerald-500)" }}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          <button
            type="button"
            disabled={!isGoogleAvailable}
            onClick={() => signIn("google", { callbackUrl: "/auth/redirect" })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold disabled:opacity-50"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--bg-base)" }}
          >
            <Globe size={14} />
            Continue with Google
          </button>

          {!isGoogleAvailable && (
            <p className="rounded-xl border px-3 py-2 text-[11px] text-amber-300" style={{ borderColor: "rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.08)" }}>
              Google sign-up is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local, then restart the server.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

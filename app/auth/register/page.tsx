"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProviders, signIn } from "next-auth/react";
import { KeyRound, Leaf, Mail, User } from "lucide-react";

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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
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

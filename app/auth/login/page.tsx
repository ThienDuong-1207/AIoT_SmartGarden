"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProviders, signIn } from "next-auth/react";
import { Leaf, UserCog, LogIn, Mail, KeyRound, ChevronRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"customer" | "admin">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [customerError, setCustomerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false);

  const isAdminMode = mode === "admin";

  useEffect(() => {
    void (async () => {
      const providers = await getProviders();
      setIsGoogleAvailable(Boolean(providers?.google));
    })();
  }, []);

  async function handleCustomerLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCustomerError("");
    setIsSubmitting(true);

    await signIn("credentials", {
      email: email.trim(),
      password: password.trim(),
      redirect: true,
      callbackUrl: "/dashboard",
    });
  }

  async function handleAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdminError("");
    setIsSubmitting(true);

    await signIn("credentials", {
      email: email.trim(),
      password: password.trim(),
      redirect: true,
      callbackUrl: "/admin",
    });
  }

  return (
    <main className="relative min-h-screen w-full bg-[#030508] text-white overflow-hidden grid md:grid-cols-2">
      {/* ── LEFT PANEL: Visual / Ecosystem Atmosphere ── */}
      <div className="relative hidden md:flex flex-col justify-center p-12 lg:p-20 overflow-hidden border-r border-white/5 pb-32">
        {/* Background Visual Layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-black/40 to-black z-10" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-500/10 to-transparent blur-3xl opacity-30 animate-pulse" />
          
          {/* Decorative Plexus SVG */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
             <defs>
               <radialGradient id="visualGlow" cx="50%" cy="50%" r="50%">
                 <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
                 <stop offset="100%" stopColor="transparent" />
               </radialGradient>
             </defs>
             <circle cx="20" cy="30" r="15" fill="url(#visualGlow)" />
             <circle cx="80" cy="70" r="20" fill="url(#visualGlow)" />
          </svg>
        </div>

        {/* Content Layer */}
        <div className="relative z-10">
           <h2 className="text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.85]">
             GREEN<br/>
             <span className="text-emerald-400">TECH</span> AT<br/>
             YOUR FINGERTIPS
           </h2>
           <p className="mt-12 text-slate-400 text-xl max-w-sm leading-relaxed font-medium">
             Automate your garden with next-generation AI and IoT systems.
           </p>
        </div>
      </div>

      {/* ── RIGHT PANEL: Integrated Login Form ── */}
      <div className="relative flex items-center justify-center p-6 sm:p-12 lg:p-20 z-10">
        <div className="w-full max-w-md animate-scale-in">
          
          {/* Integrated Glass Card */}
          <div className="relative p-10 sm:p-12 rounded-3xl bg-white/[0.02] backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden transform-gpu will-change-transform">
             {/* Subtitle Tag */}
             <div className="flex items-center gap-2 mb-6">
               <span className="h-px w-8 bg-emerald-500/50" />
               <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-teal-400">
                 // WELCOME BACK
               </p>
             </div>

             <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
                <span className="text-white">SIGN</span> <span className="text-emerald-400">IN</span>
             </h1>
             <p className="text-slate-400 text-sm mb-10 leading-relaxed">
               Continue your journey to build a smarter garden.
             </p>

             {/* Mode Toggle Switch (Full Pill Style) */}
             <div className="grid grid-cols-2 gap-1 rounded-full p-1 bg-black/40 border border-white/5 mb-10">
               <button
                 onClick={() => setMode("customer")}
                 className={`py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${!isAdminMode ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "text-slate-500 hover:text-white"}`}
               >
                 ACCOUNT
               </button>
               <button
                 onClick={() => setMode("admin")}
                 className={`py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isAdminMode ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "text-slate-500 hover:text-white"}`}
               >
                 ADMIN
               </button>
             </div>

             {!isAdminMode ? (
               <form onSubmit={handleCustomerLogin} className="space-y-4">
                 <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="customer@email.com"
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm font-medium focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                      required
                    />
                 </div>

                 <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                      <KeyRound size={16} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm font-medium focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                      required
                    />
                 </div>

                 {customerError && (
                   <p className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wider text-center">
                     {customerError}
                   </p>
                 )}

                 <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-500 disabled:bg-slate-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1"
                 >
                    {isSubmitting ? "PROCESSING..." : "SIGN IN NOW"}
                    <ChevronRight size={14} className="animate-pulse" />
                 </button>

                 <a href="/auth/register" className="block text-center text-xs text-slate-400 hover:text-emerald-400 transition-colors">
                   Create a customer account
                 </a>

                 <button
                   type="button"
                   disabled={!isGoogleAvailable}
                   onClick={() => signIn("google", { callbackUrl: "/auth/redirect" })}
                   className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/[0.03] border border-white/10 rounded-xl text-white font-medium transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                 >
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                     <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                     <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                     <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                   </svg>
                   <span className="text-xs uppercase tracking-widest font-bold">CONTINUE WITH GOOGLE</span>
                 </button>

                 {!isGoogleAvailable && (
                   <p className="rounded-xl border px-3 py-2 text-[11px] text-amber-300" style={{ borderColor: "rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.08)" }}>
                     Google sign-in is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local, then restart the server.
                   </p>
                 )}
               </form>
             ) : (
               <form onSubmit={handleAdminLogin} className="space-y-4">
                 <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@smartgarden.com"
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm font-medium focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                      required
                    />
                 </div>

                 <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                      <KeyRound size={16} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Secure password"
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm font-medium focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                      required
                    />
                 </div>

                 {adminError && (
                   <p className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wider text-center">
                     {adminError}
                   </p>
                 )}

                 <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-500 disabled:bg-slate-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1"
                 >
                    {isSubmitting ? "PROCESSING..." : "CONFIRM ADMIN"}
                 </button>
               </form>
             )}

             <p className="mt-8 text-center text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
               By signing in, you agree to the <br/>
               <span className="text-slate-300 hover:text-emerald-400 cursor-pointer transition-colors underline underline-offset-4">terms of use</span> of the platform.
             </p>
          </div>
        </div>
      </div>
    </main>
  );
}

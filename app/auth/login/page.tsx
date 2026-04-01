"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Leaf, UserCog, LogIn, Mail, KeyRound, Globe, ChevronRight } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"customer" | "admin">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdminMode = mode === "admin";

  async function handleAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdminError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email: email.trim(),
      password: password.trim(),
      callbackUrl: "/admin",
      redirect: false,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setAdminError("Admin sign-in failed. Check your email/password.");
      return;
    }

    window.location.href = result.url || "/admin";
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
               <div className="space-y-4">
                 <button
                   onClick={() => signIn("google", { callbackUrl: "/auth/redirect" })}
                   className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl text-white font-medium transition-all duration-300 hover:-translate-y-0.5"
                 >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      <path fill="none" d="M0 0h48v48H0z"/>
                    </svg>
                      <span className="text-xs uppercase tracking-widest font-bold">CONTINUE WITH GOOGLE</span>
                 </button>
                 
                 <button
                    onClick={() => signIn("google", { callbackUrl: "/auth/redirect" })}
                    className="flex w-full items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1"
                 >
                    SIGN IN NOW
                    <ChevronRight size={14} className="animate-pulse" />
                 </button>
               </div>
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

"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LogOut, LayoutDashboard, ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/",          label: "Trang chủ" },
  { href: "/products",  label: "Sản phẩm" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about",     label: "About Us" },
];

export default function AppHeaderClient() {
  const [isScrolled, setIsScrolled]         = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen]     = useState(false);
  const { data: session }                   = useSession();
  const pathname                            = usePathname();
  const isAdminRoute                        = pathname.startsWith("/admin");
  const dropdownRef                         = useRef<HTMLDivElement>(null);

  /* ---------- scroll detection ---------- */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- close dropdown on outside click ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      {/* ═══════════════════════════════════════════
          HEADER BAR
      ═══════════════════════════════════════════ */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 md:px-6">
        <div
          className="mx-auto w-full max-w-7xl rounded-2xl transition-all duration-300"
          style={
            isScrolled
              ? {
                  background: "rgba(9,9,11,0.92)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                }
              : {
                  background: "rgba(9,9,11,0.30)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }
          }
        >
          <div className="flex h-15 w-full items-center justify-between px-4 md:px-6" style={{ height: "60px" }}>

            {/* ── Logo ── */}
            <Link href="/" className="group flex items-center gap-2.5">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black"
                style={{
                  background: "linear-gradient(135deg, var(--emerald-500), var(--emerald-600))",
                  color: "#fff",
                }}
              >
                SG
              </span>
              <span
                className="text-sm font-black uppercase tracking-[0.18em] transition-colors duration-200"
                style={{ color: "var(--text-primary)" }}
              >
                Smart Garden
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150"
                  style={{
                    color: isActive(href) ? "var(--emerald-400)" : "var(--text-secondary)",
                    background: isActive(href) ? "rgba(16,185,129,0.08)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(href)) {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(href)) {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* ── Right section ── */}
            <div className="flex items-center gap-2 md:gap-3">

              {/* Cart icon */}
              <Link
                href="/cart"
                className="btn-icon relative hidden md:inline-flex"
                title="Giỏ hàng"
              >
                <ShoppingCart size={17} />
              </Link>

              {/* Auth */}
              {session ? (
                /* User dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150"
                    style={{
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border-normal)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {session.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt="avatar"
                        className="h-6 w-6 rounded-full object-cover"
                        style={{ border: "1.5px solid var(--border-emerald)" }}
                      />
                    ) : (
                      <User size={16} />
                    )}
                    <span className="hidden max-w-[96px] truncate md:inline">
                      {session.user?.name?.split(" ").at(-1) ?? "User"}
                    </span>
                    <ChevronDown
                      size={14}
                      className="transition-transform duration-200"
                      style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </button>

                  {/* Dropdown panel */}
                  {isDropdownOpen && (
                    <div
                      className="animate-scale-in absolute right-0 mt-2 w-52 overflow-hidden rounded-xl py-1"
                      style={{
                        background: "var(--bg-overlay)",
                        border: "1px solid var(--border-normal)",
                        boxShadow: "var(--shadow-elevated)",
                      }}
                    >
                      {/* User info */}
                      <div
                        className="px-4 py-3"
                        style={{ borderBottom: "1px solid var(--border-subtle)" }}
                      >
                        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                          {session.user?.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs" style={{ color: "var(--text-muted)" }}>
                          {session.user?.email}
                        </p>
                      </div>

                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-100"
                        style={{ color: "var(--text-secondary)" }}
                        onClick={() => setIsDropdownOpen(false)}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                        }}
                      >
                        <LayoutDashboard size={14} />
                        Dashboard
                      </Link>

                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-100"
                        style={{ color: "var(--text-secondary)" }}
                        onClick={() => setIsDropdownOpen(false)}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                        }}
                      >
                        <User size={14} />
                        Tài khoản
                      </Link>

                      <div style={{ borderTop: "1px solid var(--border-subtle)" }} className="mt-1 pt-1">
                        <button
                          onClick={() => signOut()}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-100"
                          style={{ color: "var(--danger)" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "var(--danger-glow)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                          }}
                        >
                          <LogOut size={14} />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Login button */
                <Link href="/auth/login" className="btn-emerald text-sm">
                  Đăng nhập
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                className="btn-icon md:!hidden"
                onClick={() => setIsMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          MOBILE MENU DRAWER
      ═══════════════════════════════════════════ */}
      {isMobileOpen && (
        <div
          className="fixed inset-x-0 top-0 z-40 pt-20 md:hidden animate-fade-in"
          style={{
            background: "rgba(9,9,11,0.98)",
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid var(--border-subtle)",
            minHeight: "100dvh",
          }}
        >
          <nav className="flex flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMobileOpen(false)}
                className="rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-150"
                style={{
                  color: isActive(href) ? "var(--emerald-400)" : "var(--text-secondary)",
                  background: isActive(href) ? "rgba(16,185,129,0.08)" : "transparent",
                  borderLeft: isActive(href) ? "2px solid var(--emerald-500)" : "2px solid transparent",
                }}
              >
                {label}
              </Link>
            ))}

            <div className="mt-4" style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
              <Link href="/cart" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium" style={{ color: "var(--text-secondary)" }}>
                <ShoppingCart size={18} /> Giỏ hàng
              </Link>
              {!session && (
                <Link href="/auth/login" className="btn-emerald mt-3 w-full justify-center text-base">
                  Đăng nhập
                </Link>
              )}
              {session && (
                <button
                  onClick={() => signOut()}
                  className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium"
                  style={{ color: "var(--danger)" }}
                >
                  <LogOut size={18} /> Đăng xuất
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Leaf, Code2, MessageSquare, Briefcase } from "lucide-react";

const EXPLORE_LINKS = [
  { href: "/",          label: "Trang chủ" },
  { href: "/products",  label: "Sản phẩm" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about",     label: "About Us" },
];

const SUPPORT_LINKS = [
  { href: "/about",   label: "Về chúng tôi" },
  { href: "/auth/login", label: "Đăng nhập" },
  { href: "/cart",    label: "Giỏ hàng" },
  { href: "/profile", label: "Tài khoản" },
];

const SOCIAL_LINKS = [
  { href: "#", icon: Code2,         label: "GitHub" },
  { href: "#", icon: MessageSquare, label: "Twitter" },
  { href: "#", icon: Briefcase,     label: "LinkedIn" },
];

export default function SiteFooter() {
  return (
    <footer style={{ background: "transparent", borderTop: "1px solid rgba(34, 211, 238, 0.1)" }}>

      {/* ── Top glow divider ── */}
      <div className="divider-glow" />

      {/* ── Main grid ── */}
      <div
        className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6"
      >

        {/* Brand column */}
        <div className="md:col-span-2">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, var(--cyan-500), var(--cyan-600))",
              }}
            >
              <Leaf size={16} color="#fff" />
            </span>
            <span
              className="text-sm font-black uppercase tracking-[0.18em]"
              style={{ color: "var(--text-primary)" }}
            >
              Smart Garden
            </span>
          </Link>

          {/* Tagline */}
          <p
            className="mt-4 max-w-sm text-sm leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Nền tảng AIoT thủy canh thông minh — giám sát thời gian thực, cảnh báo tự động và quản lý cây trồng hiệu quả từ mọi nơi.
          </p>

          {/* Social links */}
          <div className="mt-6 flex items-center gap-2">
            {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
              <Link
                key={label}
                href={href}
                className="btn-icon"
                title={label}
                aria-label={label}
              >
                <Icon size={15} />
              </Link>
            ))}
          </div>
        </div>

        {/* Explore links */}
        <div>
          <p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: "var(--text-muted)" }}
          >
            Khám phá
          </p>
          <ul className="space-y-3">
            {EXPLORE_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm transition-colors duration-150"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "var(--cyan-400)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")
                  }
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact column */}
        <div>
          <p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: "var(--text-muted)" }}
          >
            Liên hệ
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-2.5">
              <Mail size={13} style={{ color: "var(--cyan-500)", flexShrink: 0 }} />
              <a
                href="mailto:support@eco-tech.vn"
                className="text-sm transition-colors duration-150"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--cyan-400)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")
                }
              >
                support@eco-tech.vn
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={13} style={{ color: "var(--cyan-500)", flexShrink: 0 }} />
              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
              >
                +84 28 1234 5678
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={13} style={{ color: "var(--cyan-500)", flexShrink: 0, marginTop: 2 }} />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Ho Chi Minh City, Vietnam
              </span>
            </li>
          </ul>

          {/* Status indicator */}
          <div
            className="mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{
              background: "rgba(6,182,212,0.08)",
              border: "1px solid rgba(6,182,212,0.16)",
            }}
          >
            <span className="status-dot status-online" style={{ width: 6, height: 6, backgroundColor: "var(--cyan-500)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--cyan-400)" }}>
              Hệ thống mạng đồng bộ
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="px-4 py-5 md:px-6"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 md:flex-row">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © 2026 Smart Garden AIoT. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {SUPPORT_LINKS.slice(0, 2).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs transition-colors duration-150"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")
                }
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

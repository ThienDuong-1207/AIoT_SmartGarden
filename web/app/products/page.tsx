import { Package, Star, ShoppingBag, Home, ChevronRight, Cpu, Droplets, FlaskConical, Thermometer, Wifi, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SiteFooter from "@/components/marketing/SiteFooter";
import ProductsClient from "@/components/marketing/ProductsClient";
import AddToCartButton from "@/components/marketing/AddToCartButton";
import { sampleProducts } from "@/lib/mock-data";
import ProductModel from "@/models/Product";
import { dbConnect } from "@/lib/mongodb";

async function getProducts() {
  try {
    await dbConnect();
    const products = await ProductModel.find({}).sort({ createdAt: -1 }).lean();
    return products.length ? products : sampleProducts;
  } catch {
    return sampleProducts;
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  const totalReviews = 136;
  const avgRating    = 4.8;
  const inStock      = products.filter((p) => (p.stock ?? 1) > 0).length;

  return (
    <main className="flex flex-col bg-transparent relative" style={{ minHeight: "100dvh" }}>

      {/* ══════════════════════════════════════
          Hero Header
      ══════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          paddingTop: "7rem",
          paddingBottom: "4rem",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Ambient glows */}
        <div
          className="pointer-events-none absolute -top-20 right-0 h-[500px] w-[500px] translate-x-1/3 rounded-full blur-3xl"
          style={{ background: "rgba(16,185,129,0.06)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 rounded-full blur-3xl"
          style={{ background: "rgba(59,130,246,0.05)" }}
        />

        {/* Dot grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 md:px-8">

          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <Link href="/" className="link-muted-emerald flex items-center gap-1">
              <Home size={11} />
              Trang chủ
            </Link>
            <ChevronRight size={11} />
            <span style={{ color: "var(--text-secondary)" }}>Sản phẩm</span>
          </nav>

          {/* Main content — 2 col */}
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              {/* Label */}
              <p
                className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.15em]"
                style={{ color: "var(--emerald-500)" }}
              >
                // PRODUCT CATALOG
              </p>

              {/* Title */}
              <h1
                className="text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl"
                style={{ color: "var(--text-primary)" }}
              >
                Trang bị cho{" "}
                <span className="text-gradient-emerald">vườn thông minh</span>
                <br />
                của bạn.
              </h1>

              {/* Description */}
              <p
                className="mt-4 max-w-xl text-sm leading-relaxed md:text-base"
                style={{ color: "var(--text-secondary)" }}
              >
                Hạt giống năng suất cao, dung dịch dinh dưỡng cân bằng và bộ Smart Pot
                tích hợp cảm biến IoT — tất cả trong một hệ sinh thái.
              </p>
            </div>

            {/* Stats panel */}
            <div
              className="flex shrink-0 flex-col gap-px overflow-hidden rounded-2xl"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(34, 211, 238, 0.1)",
                minWidth: 220,
              }}
            >
              {[
                {
                  icon: Package,
                  label: "Sản phẩm",
                  value: products.length,
                  unit: "items",
                  color: "var(--emerald-400)",
                  bg: "rgba(16,185,129,0.08)",
                },
                {
                  icon: Star,
                  label: "Đánh giá TB",
                  value: avgRating,
                  unit: `/ 5 · ${totalReviews} reviews`,
                  color: "var(--gold-400)",
                  bg: "rgba(245,158,11,0.08)",
                },
                {
                  icon: ShoppingBag,
                  label: "Còn hàng",
                  value: inStock,
                  unit: "sản phẩm",
                  color: "#60A5FA",
                  bg: "rgba(59,130,246,0.08)",
                },
              ].map(({ icon: Icon, label, value, unit, color, bg }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 px-5 py-3.5"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: bg }}
                  >
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      {label}
                    </p>
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {value}{" "}
                      <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                        {unit}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          Smart Pot Showcase
      ══════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/4 rounded-full blur-3xl"
          style={{ background: "rgba(34,197,94,0.07)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/3 translate-y-1/4 rounded-full blur-3xl"
          style={{ background: "rgba(96,165,250,0.05)" }}
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">

          {/* Section label */}
          <p
            className="mb-12 text-center font-mono text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--emerald-500)" }}
          >
            // FEATURED PRODUCT
          </p>

          {/* 2-col grid */}
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

            {/* ── LEFT — Image ── */}
            <div className="relative flex items-center justify-center">
              {/* Glow behind pot */}
              <div
                className="pointer-events-none absolute inset-0 rounded-full blur-3xl"
                style={{ background: "radial-gradient(ellipse at center, rgba(34,197,94,0.20) 0%, transparent 65%)" }}
              />
              <div
                className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-72 -translate-x-1/2 blur-3xl"
                style={{ background: "rgba(34,197,94,0.14)" }}
              />

              {/* Pot image */}
              <div className="animate-soft-float relative w-full max-w-sm">
                <Image
                  src="/images/chaucay.webp"
                  alt="Smart Garden Pot"
                  width={480}
                  height={520}
                  className="relative z-10 w-full object-contain drop-shadow-2xl"
                  style={{ filter: "drop-shadow(0 32px 64px rgba(34,197,94,0.22))" }}
                />

                {/* Floating badge — TDS */}
                <div
                  className="absolute left-0 top-1/3 z-20 flex items-center gap-2 rounded-2xl px-3 py-2"
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(34,211,238,0.22)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <Droplets size={13} style={{ color: "var(--emerald-400)" }} />
                  <div>
                    <p className="font-mono text-xs font-black" style={{ color: "var(--emerald-400)" }}>
                      1150 <span className="text-[9px] font-normal">ppm</span>
                    </p>
                    <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.40)" }}>TDS</p>
                  </div>
                </div>

                {/* Floating badge — pH */}
                <div
                  className="absolute right-0 top-1/4 z-20 flex items-center gap-2 rounded-2xl px-3 py-2"
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(34,211,238,0.22)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <FlaskConical size={13} style={{ color: "#86EFAC" }} />
                  <div>
                    <p className="font-mono text-xs font-black" style={{ color: "#86EFAC" }}>6.2</p>
                    <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.40)" }}>pH</p>
                  </div>
                </div>

                {/* Floating badge — Temp */}
                <div
                  className="absolute bottom-16 left-4 z-20 flex items-center gap-2 rounded-2xl px-3 py-2"
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(34,211,238,0.22)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <Thermometer size={13} style={{ color: "#FBBF24" }} />
                  <div>
                    <p className="font-mono text-xs font-black" style={{ color: "#FBBF24" }}>
                      24.3 <span className="text-[9px] font-normal">°C</span>
                    </p>
                    <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.40)" }}>Nhiệt độ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT — Info ── */}
            <div className="flex flex-col">
              {/* Badges row */}
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-semibold"
                  style={{ background: "rgba(34,197,94,0.10)", color: "var(--emerald-400)", border: "1px solid rgba(74,222,128,0.22)" }}
                >
                  <Wifi size={10} />
                  WiFi · MQTT
                </span>
                <span
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-semibold"
                  style={{ background: "rgba(96,165,250,0.10)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.22)" }}
                >
                  <Cpu size={10} />
                  ESP32-S3
                </span>
                <span
                  className="rounded-full px-3 py-1 font-mono text-[10px] font-semibold"
                  style={{ background: "rgba(251,191,36,0.10)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.22)" }}
                >
                  ★ Best Seller
                </span>
              </div>

              {/* Title */}
              <h2
                className="text-4xl font-black leading-tight tracking-tight md:text-5xl"
                style={{ color: "var(--text-primary)" }}
              >
                Smart Garden{" "}
                <span className="text-gradient-emerald">Pot</span>
                <br />
                <span className="text-3xl md:text-4xl" style={{ color: "var(--text-secondary)" }}>
                  Chậu cây thông minh
                </span>
              </h2>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-black" style={{ color: "var(--emerald-400)" }}>
                  1.290.000 ₫
                </span>
                <span className="text-base line-through" style={{ color: "var(--text-muted)" }}>
                  1.690.000 ₫
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ background: "rgba(249,115,22,0.15)", color: "#F97316", border: "1px solid rgba(249,115,22,0.25)" }}
                >
                  -24%
                </span>
              </div>

              {/* Description */}
              <p
                className="mt-5 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Chậu thủy canh thế hệ mới tích hợp vi điều khiển <strong style={{ color: "var(--text-primary)" }}>ESP32-S3</strong>,
                camera AI và bộ cảm biến đầy đủ — giám sát cây trồng 24/7 từ điện thoại.
                Kết nối dashboard thông minh, nhận cảnh báo tức thì qua Firebase và phân tích
                sức khoẻ cây bằng mô hình <strong style={{ color: "var(--text-primary)" }}>YOLOv8</strong>.
              </p>

              {/* Specs list */}
              <div className="mt-6 grid grid-cols-2 gap-2">
                {[
                  { icon: Cpu,         label: "MCU",        value: "ESP32-S3"          },
                  { icon: Droplets,    label: "Cảm biến",   value: "TDS · pH · Nhiệt" },
                  { icon: Wifi,        label: "Kết nối",    value: "WiFi · MQTT"       },
                  { icon: Thermometer, label: "Camera",     value: "OV2640 2MP AI"    },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 spec-glow-item"
                    style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", border: "1px solid rgba(34, 211, 238, 0.1)" }}
                  >
                    <Icon size={13} style={{ color: "var(--emerald-400)", flexShrink: 0 }} />
                    <div>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                      <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="mt-8 flex flex-wrap gap-3">
                <AddToCartButton
                  item={{
                    slug: "chau-thong-minh-esp32",
                    name: "Chậu Thông Minh Smart Garden Pot",
                    category: "smart-pots",
                    price: 1690000,
                    salePrice: 1290000,
                  }}
                />
                <AddToCartButton
                  item={{
                    slug: "chau-thong-minh-esp32",
                    name: "Chậu Thông Minh Smart Garden Pot",
                    category: "smart-pots",
                    price: 1690000,
                    salePrice: 1290000,
                  }}
                  buyNow
                  className="btn-ghost gap-2 px-6 py-3"
                />
                <Link
                  href="/products/smart-pot"
                  className="btn-ghost gap-2 px-6 py-3"
                >
                  Xem chi tiết
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Trust badges */}
              <div
                className="mt-6 flex flex-wrap gap-4 pt-6"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                {[
                  { icon: CheckCircle, text: "Bảo hành 12 tháng"   },
                  { icon: CheckCircle, text: "Miễn phí vận chuyển"  },
                  { icon: CheckCircle, text: "Đổi trả trong 30 ngày" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <Icon size={12} style={{ color: "var(--emerald-500)" }} />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          Filter + Grid (Client Component)
      ══════════════════════════════════════ */}
      <div className="flex-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <ProductsClient products={products} />
      </div>

      <SiteFooter />
    </main>
  );
}

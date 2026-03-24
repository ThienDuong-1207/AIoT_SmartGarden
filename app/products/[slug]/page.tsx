import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ShoppingCart, Zap, CheckCircle, ArrowLeft } from "lucide-react";
import { sampleProductReviews, sampleProducts } from "@/lib/mock-data";
import ProductModel from "@/models/Product";
import { dbConnect } from "@/lib/mongodb";
import SiteFooter from "@/components/marketing/SiteFooter";

type Params = Promise<{ slug: string }>;

type ProductData = {
  slug: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  images?: string[];
  description?: string;
  specs?: Record<string, unknown>;
  stock?: number;
  rating?: number;
  reviewCount?: number;
};

async function getProduct(slug: string) {
  const fallback = sampleProducts.find((item) => item.slug === slug) || null;
  try {
    await dbConnect();
    const product = await ProductModel.findOne({ slug }).lean<ProductData | null>();
    return product || fallback;
  } catch {
    return fallback;
  }
}

async function getRelatedProducts(product: ProductData) {
  try {
    await dbConnect();
    const related = await ProductModel.find({
      category: product.category,
      slug: { $ne: product.slug },
    })
      .limit(4)
      .lean<ProductData[]>();
    if (related.length > 0) return related;
  } catch {
    // fallback below
  }
  return sampleProducts
    .filter((item) => item.slug !== product.slug)
    .sort((a, b) => {
      const aScore = a.category === product.category ? 1 : 0;
      const bScore = b.category === product.category ? 1 : 0;
      return bScore - aScore;
    })
    .slice(0, 4);
}

function formatSpecValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const reviews         = sampleProductReviews[product.slug] || [];
  const relatedProducts = await getRelatedProducts(product);
  const gallery         = product.images && product.images.length > 0 ? product.images : ["/window.svg"];
  const specsEntries    = Object.entries(product.specs || {});
  const isSmartPot      = product.category === "smart-pots";
  const activePrice     = Number(product.salePrice || product.price);
  const hasDiscount     = Boolean(product.salePrice);

  return (
    <main className="flex flex-col bg-transparent relative" style={{ minHeight: "100dvh" }}>

      {/* ── Breadcrumb ── */}
      <div
        className="border-b"
        style={{
          paddingTop: "5rem",
          borderColor: "var(--border-subtle)",
          background: "transparent",
        }}
      >
        <div className="container-app py-4">
          <Link
            href="/products"
            className="link-muted-emerald inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={14} />
            Danh mục sản phẩm
          </Link>
        </div>
      </div>

      {/* ── Main content ── */}
      <article className="container-app py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left column: Gallery + Specs */}
          <div className="space-y-6">

            {/* Image gallery */}
            <div
              className="overflow-hidden rounded-2xl p-4"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(34, 211, 238, 0.1)",
              }}
            >
              <div
                className="group relative overflow-hidden rounded-xl"
                style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
              >
                <Image
                  src={gallery[0]}
                  alt={product.name}
                  width={980}
                  height={680}
                  className="h-[300px] w-full object-cover transition duration-500 group-hover:scale-105 md:h-[400px]"
                />
              </div>

              {gallery.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {gallery.slice(0, 4).map((img, idx) => (
                    <div
                      key={`${img}-${idx}`}
                      className="overflow-hidden rounded-lg"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(34, 211, 238, 0.1)",
                      }}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        width={240}
                        height={180}
                        className="h-16 w-full object-cover transition duration-300 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specs table */}
            <div
              className="overflow-hidden rounded-2xl"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(34, 211, 238, 0.1)",
              }}
            >
              <div
                className="px-6 py-4"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  Thông số kỹ thuật
                </h2>
              </div>

              {specsEntries.length > 0 ? (
                specsEntries.map(([key, value], idx) => (
                  <div
                    key={key}
                    className="grid grid-cols-[0.45fr_0.55fr] gap-3 px-6 py-3 text-sm"
                    style={{
                      background: idx % 2 === 1 ? "rgba(255,255,255,0.02)" : "transparent",
                      borderBottom:
                        idx !== specsEntries.length - 1
                          ? "1px solid var(--border-subtle)"
                          : "none",
                    }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {key}
                    </p>
                    <p style={{ color: "var(--text-secondary)" }}>{formatSpecValue(value)}</p>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  Chưa có thông số kỹ thuật chi tiết.
                </div>
              )}

              {/* Sensors badge list */}
              {isSmartPot && Array.isArray(product.specs?.sensors) && (
                <div
                  className="px-6 py-4"
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    background: "rgba(16,185,129,0.04)",
                  }}
                >
                  <p
                    className="mb-3 text-xs font-bold uppercase tracking-widest"
                    style={{ color: "var(--emerald-500)" }}
                  >
                    Sensors Included
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(product.specs?.sensors as string[]).map((sensor) => (
                      <span key={sensor} className="badge badge-emerald">
                        {sensor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live demo widget (smart pot only) */}
            {isSmartPot && (
              <div
                className="overflow-hidden rounded-2xl"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(34, 211, 238, 0.2)",
                }}
              >
                <div
                  className="flex items-center justify-between px-6 py-4"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    Live Demo Widget
                  </h2>
                  <Link
                    href="/dashboard"
                    className="text-xs font-semibold"
                    style={{ color: "var(--emerald-400)" }}
                  >
                    Mở Dashboard →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 p-5">
                  {[
                    { label: "TDS",      value: "1180 ppm", color: "var(--blue-400)" },
                    { label: "pH",       value: "6.2",      color: "var(--emerald-400)" },
                    { label: "Temp",     value: "24.1°C",   color: "var(--gold-400)" },
                    { label: "Humidity", value: "67%",      color: "var(--emerald-400)" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="stat-card"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        {m.label}
                      </p>
                      <p className="mt-2 text-xl font-black" style={{ color: m.color }}>
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>
                <p
                  className="px-5 pb-4 text-xs"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                >
                  // Dữ liệu demo mô phỏng realtime trong 24 giờ gần nhất.
                </p>
              </div>
            )}
          </div>

          {/* Right column: Purchase card (sticky) */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
            <div
              className="overflow-hidden rounded-2xl p-6 md:p-8"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(34, 211, 238, 0.1)",
              }}
            >
              {/* Category badge */}
              <span className="badge badge-emerald">{product.category}</span>

              {/* Product name */}
              <h1
                className="mt-3 text-3xl font-bold md:text-4xl"
                style={{ color: "var(--text-primary)" }}
              >
                {product.name}
              </h1>

              {/* Description */}
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {product.description || "Sản phẩm chất lượng cao cho hệ Smart Garden."}
              </p>

              {/* Rating + stock row */}
              <div
                className="mt-5 flex flex-wrap items-center gap-4 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <span className="flex items-center gap-1.5">
                  <Star size={14} fill="var(--gold-400)" style={{ color: "var(--gold-400)" }} />
                  <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                    {Number(product.rating || 0).toFixed(1)}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>
                    ({product.reviewCount || reviews.length} đánh giá)
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={13} style={{ color: "var(--emerald-500)" }} />
                  Tồn kho:{" "}
                  <span className="font-semibold" style={{ color: "var(--emerald-400)" }}>
                    {product.stock || 0}
                  </span>
                </span>
              </div>

              {/* Price block */}
              <div
                className="mt-6 rounded-xl p-4"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(34, 211, 238, 0.1)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Giá ưu đãi
                </p>
                <p className="mt-2 text-3xl font-black" style={{ color: "var(--gold-400)" }}>
                  {activePrice.toLocaleString("vi-VN")}đ
                </p>
                {hasDiscount && (
                  <p className="mt-1 text-sm line-through" style={{ color: "var(--text-muted)" }}>
                    {Number(product.price).toLocaleString("vi-VN")}đ
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button className="btn-gold flex flex-1 items-center justify-center gap-2 py-3">
                  <ShoppingCart size={16} />
                  Thêm vào giỏ
                </button>
                <button className="btn-emerald flex flex-1 items-center justify-center gap-2 py-3">
                  <Zap size={16} />
                  Mua ngay
                </button>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {/* ── Reviews ── */}
      <section className="container-app pb-10">
        <div
          className="mb-6 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1.25rem" }}
        >
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Đánh giá
          </h2>
          <span className="badge badge-slate">{reviews.length} nhận xét</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {reviews.length > 0 ? (
            reviews.map((review, idx) => (
              <div
                key={`${review.author}-${idx}`}
                className="dark-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {review.author}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <p className="text-sm" style={{ color: "var(--gold-400)" }}>
                    {"★".repeat(review.rating)}
                    <span style={{ color: "var(--border-normal)" }}>
                      {"★".repeat(5 - review.rating)}
                    </span>
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {review.content}
                </p>
                {review.verified && (
                  <span className="badge badge-emerald mt-3">
                    <CheckCircle size={10} />
                    Đã mua hàng
                  </span>
                )}
              </div>
            ))
          ) : (
            <div
              className="col-span-2 rounded-2xl py-12 text-center text-sm"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                backdropFilter: "blur(4px)",
                border: "1px dashed rgba(34, 211, 238, 0.15)",
                color: "var(--text-muted)",
              }}
            >
              Chưa có đánh giá — hãy là người đầu tiên nhận xét sản phẩm này.
            </div>
          )}
        </div>
      </section>

      {/* ── Related products ── */}
      {relatedProducts.length > 0 && (
        <section
          className="container-app pb-16"
          style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "2.5rem" }}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Mua kèm gợi ý
            </h2>
            <Link
              href="/products"
              className="text-sm font-semibold"
              style={{ color: "var(--emerald-400)" }}
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {relatedProducts.map((item) => (
              <Link
                key={item.slug}
                href={`/products/${item.slug}`}
                className="dark-card block p-4"
              >
                <div
                  className="overflow-hidden rounded-xl"
                  style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
                >
                  <Image
                    src={(item.images && item.images[0]) || "/window.svg"}
                    alt={item.name}
                    width={320}
                    height={220}
                    className="h-32 w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>
                <p
                  className="mt-3 line-clamp-2 text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.name}
                </p>
                <p className="mt-1 text-sm font-bold" style={{ color: "var(--gold-400)" }}>
                  {Number(item.salePrice || item.price).toLocaleString("vi-VN")}đ
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}

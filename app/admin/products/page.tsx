import ProductModel from "@/models/Product";
import { dbConnect } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/require-admin";
import AdminProductDeleteButton from "@/components/admin/AdminProductDeleteButton";
import Link from "next/link";

export default async function AdminProductsPage() {
  await requireAdminSession();
  await dbConnect();

  const products = await ProductModel.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Product Management</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Product list</p>
      </div>

      <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        <div
          className="flex items-center justify-end px-4 py-3"
          style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}
        >
          <Link
            href="/admin/products/new"
            className="rounded-md px-3 py-1.5 text-xs font-semibold"
            style={{
              border: "1px solid rgba(16,185,129,0.35)",
              color: "var(--emerald-400)",
              background: "rgba(16,185,129,0.10)",
            }}
          >
            Add Product
          </Link>
        </div>
        <table className="min-w-full text-sm">
          <thead style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border-subtle)" }}>
            <tr>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Name</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Slug</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Category</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Price</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Stock</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={String(product._id)} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{product.name}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{product.slug}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{product.category}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{product.price.toLocaleString("en-US")} VND</td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{product.stock}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${String(product._id)}/edit`}
                      className="rounded-md px-2.5 py-1.5 text-xs font-medium"
                      style={{
                        border: "1px solid rgba(59,130,246,0.35)",
                        color: "#60A5FA",
                        background: "rgba(59,130,246,0.10)",
                      }}
                    >
                      Edit
                    </Link>
                    <AdminProductDeleteButton productId={String(product._id)} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }} colSpan={6}>
                  No products yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

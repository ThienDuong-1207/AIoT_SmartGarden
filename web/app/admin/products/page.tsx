import ProductModel from "@/models/Product";
import { dbConnect } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/require-admin";
import AdminProductDeleteButton from "@/components/admin/AdminProductDeleteButton";

export default async function AdminProductsPage() {
  await requireAdminSession();
  await dbConnect();

  const products = await ProductModel.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Quản lý sản phẩm</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Danh sách sản phẩm</p>
      </div>

      <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        <table className="min-w-full text-sm">
          <thead style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border-subtle)" }}>
            <tr>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Tên</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Slug</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Category</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Giá</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Stock</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={String(product._id)} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{product.name}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{product.slug}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{product.category}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{product.price.toLocaleString("vi-VN")}đ</td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{product.stock}</td>
                <td className="px-4 py-3">
                  <AdminProductDeleteButton productId={String(product._id)} />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }} colSpan={6}>
                  Chưa có sản phẩm nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

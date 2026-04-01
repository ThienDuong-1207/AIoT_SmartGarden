import OrderModel from "@/models/Order";
import { dbConnect } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/require-admin";
import AdminOrderActions from "@/components/admin/AdminOrderActions";

export default async function AdminOrdersPage() {
  await requireAdminSession();
  await dbConnect();

  const orders = await OrderModel.find({})
    .populate({ path: "userId", select: "name email" })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Order Management</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Track and update order statuses</p>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const user = order.userId as { name?: string; email?: string } | null;
          return (
            <div key={String(order._id)} className="rounded-xl p-4" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
              <div className="grid gap-4 lg:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Order code</p>
                  <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{order.orderCode}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Customer</p>
                  <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{user?.name || "Unknown"}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{user?.email || "No email"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Payment / Order</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{order.paymentStatus} / {order.orderStatus}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{order.totalAmount.toLocaleString("en-US")} VND</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Quick update</p>
                  <div className="mt-1">
                    <AdminOrderActions
                      orderId={String(order._id)}
                      currentOrderStatus={order.orderStatus}
                      currentPaymentStatus={order.paymentStatus}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="rounded-xl p-8 text-center text-sm" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
            No orders yet
          </div>
        )}
      </div>
    </div>
  );
}

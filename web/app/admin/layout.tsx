import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { requireAdminSession } from "@/lib/require-admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminSession();

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-base)" }}>
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

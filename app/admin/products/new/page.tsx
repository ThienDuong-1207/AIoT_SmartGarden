import { requireAdminSession } from "@/lib/require-admin";
import AdminProductForm from "@/components/admin/AdminProductForm";

export default async function AdminNewProductPage() {
  await requireAdminSession();

  return <AdminProductForm mode="create" />;
}

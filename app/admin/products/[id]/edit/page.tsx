import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { dbConnect } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import AdminProductForm from "@/components/admin/AdminProductForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProductPage({ params }: Props) {
  await requireAdminSession();
  await dbConnect();

  const { id } = await params;
  const product = await ProductModel.findById(id).lean();

  if (!product) {
    notFound();
  }

  return (
    <AdminProductForm
      mode="edit"
      productId={String(product._id)}
      initialValues={{
        name: product.name,
        slug: product.slug,
        category: product.category,
        price: product.price,
        stock: product.stock,
        salePrice: product.salePrice ?? undefined,
        image: product.images?.[0] ?? "",
        description: product.description ?? "",
      }}
    />
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProductCategory = "seeds" | "nutrients" | "smart-pots";

type ProductFormValues = {
  name: string;
  slug: string;
  category: ProductCategory;
  price: number;
  stock: number;
  salePrice?: number;
  image?: string;
  description?: string;
};

type AdminProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: Partial<ProductFormValues>;
};

export default function AdminProductForm({ mode, productId, initialValues }: AdminProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(initialValues?.name ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [category, setCategory] = useState<ProductCategory>(initialValues?.category ?? "seeds");
  const [price, setPrice] = useState(String(initialValues?.price ?? ""));
  const [stock, setStock] = useState(String(initialValues?.stock ?? 0));
  const [salePrice, setSalePrice] = useState(
    initialValues?.salePrice !== undefined ? String(initialValues.salePrice) : ""
  );
  const [image, setImage] = useState(initialValues?.image ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");

  const title = mode === "create" ? "Add Product" : "Edit Product";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedSalePrice = salePrice.trim() === "" ? undefined : Number(salePrice);

    if (!name.trim() || !slug.trim() || Number.isNaN(parsedPrice)) {
      alert("Please fill required fields: name, slug, price");
      return;
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      alert("Stock must be a valid non-negative number");
      return;
    }

    if (parsedSalePrice !== undefined && Number.isNaN(parsedSalePrice)) {
      alert("Sale price must be a valid number");
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      category,
      price: parsedPrice,
      stock: parsedStock,
      salePrice: parsedSalePrice,
      image: image.trim() || undefined,
      description: description.trim() || "",
    };

    setLoading(true);
    try {
      const endpoint = mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Save product failed");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {mode === "create" ? "Create a new product in catalog" : "Update product information"}
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-xl p-5"
        style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}
      >
        <div className="grid gap-2">
          <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ border: "1px solid var(--border-normal)", background: "var(--bg-base)", color: "var(--text-primary)" }}
            placeholder="Product name"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Slug *</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ border: "1px solid var(--border-normal)", background: "var(--bg-base)", color: "var(--text-primary)" }}
            placeholder="product-slug"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ border: "1px solid var(--border-normal)", background: "var(--bg-base)", color: "var(--text-primary)" }}
            >
              <option value="seeds">Seeds</option>
              <option value="nutrients">Nutrients</option>
              <option value="smart-pots">Smart pots</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Stock *</label>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ border: "1px solid var(--border-normal)", background: "var(--bg-base)", color: "var(--text-primary)" }}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Price *</label>
            <input
              type="number"
              min={0}
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ border: "1px solid var(--border-normal)", background: "var(--bg-base)", color: "var(--text-primary)" }}
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Sale price</label>
            <input
              type="number"
              min={0}
              step="any"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ border: "1px solid var(--border-normal)", background: "var(--bg-base)", color: "var(--text-primary)" }}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Image URL</label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ border: "1px solid var(--border-normal)", background: "var(--bg-base)", color: "var(--text-primary)" }}
            placeholder="https://... or /products/your-image.png"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ border: "1px solid var(--border-normal)", background: "var(--bg-base)", color: "var(--text-primary)" }}
            placeholder="Short product description"
          />
        </div>

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="rounded-md px-3 py-2 text-sm font-medium"
            style={{ border: "1px solid var(--border-normal)", color: "var(--text-secondary)", background: "transparent" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md px-3 py-2 text-sm font-semibold disabled:opacity-60"
            style={{ border: "1px solid rgba(16,185,129,0.35)", color: "var(--emerald-400)", background: "rgba(16,185,129,0.10)" }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

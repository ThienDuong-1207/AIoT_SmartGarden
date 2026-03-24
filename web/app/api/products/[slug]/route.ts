import { NextResponse } from "next/server";
import ProductModel from "@/models/Product";
import { dbConnect } from "@/lib/mongodb";
import { sampleProducts } from "@/lib/mock-data";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  try {
    await dbConnect();
    const product = await ProductModel.findOne({ slug }).lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch {
    const product = sampleProducts.find((item) => item.slug === slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ data: product });
  }
}

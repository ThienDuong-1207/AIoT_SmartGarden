import { NextResponse } from "next/server";
import ProductModel from "@/models/Product";
import { dbConnect } from "@/lib/mongodb";
import { sampleProducts } from "@/lib/mock-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const sort = searchParams.get("sort");
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER);

  try {
    await dbConnect();

    const query: Record<string, unknown> = {
      price: { $gte: minPrice, $lte: maxPrice },
    };

    if (category) {
      query.category = category;
    }

    const sortMap: Record<string, 1 | -1> = {
      newest: -1,
      price_asc: 1,
      price_desc: -1,
      best_selling: -1,
    };

    const products = await ProductModel.find(query)
      .sort({ price: sortMap[sort || ""] || 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ data: products });
  } catch {
    const filtered = sampleProducts
      .filter((p) => !category || p.category === category)
      .filter((p) => p.price >= minPrice && p.price <= maxPrice);
    return NextResponse.json({ data: filtered });
  }
}

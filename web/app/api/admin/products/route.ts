import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import ProductModel from "@/models/Product";
import { dbConnect } from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const products = await ProductModel.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ data: products });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    slug?: string;
    name?: string;
    category?: "seeds" | "nutrients" | "smart-pots";
    price?: number;
    stock?: number;
    description?: string;
    image?: string;
  };

  if (!body.slug || !body.name || !body.category || typeof body.price !== "number") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await dbConnect();

  const exists = await ProductModel.findOne({ slug: body.slug }).lean();
  if (exists) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const product = await ProductModel.create({
    slug: body.slug,
    name: body.name,
    category: body.category,
    price: body.price,
    stock: body.stock ?? 0,
    description: body.description ?? "",
    images: body.image ? [body.image] : [],
    specs: {},
    tags: [],
  });

  return NextResponse.json({ data: product, message: "Product created" }, { status: 201 });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import OrderModel from "@/models/Order";
import ProductModel from "@/models/Product";

type CheckoutItem = {
  slug: string;
  qty: number;
};

function makeOrderCode() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SG-${year}${month}-${suffix}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    items?: CheckoutItem[];
  };

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const normalizedItems = body.items
    .filter((i) => i && typeof i.slug === "string" && Number(i.qty) > 0)
    .map((i) => ({ slug: i.slug, qty: Math.floor(Number(i.qty)) }));

  if (normalizedItems.length === 0) {
    return NextResponse.json({ error: "No valid cart items" }, { status: 400 });
  }

  await dbConnect();

  const slugs = [...new Set(normalizedItems.map((i) => i.slug))];
  const products = await ProductModel.find({ slug: { $in: slugs } })
    .select("_id slug name price salePrice")
    .lean();

  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  const orderItems: Array<{
    productId: unknown;
    name: string;
    qty: number;
    price: number;
  }> = [];

  let totalAmount = 0;
  for (const item of normalizedItems) {
    const product = productBySlug.get(item.slug);
    if (!product) {
      return NextResponse.json(
        { error: `Product not found for slug: ${item.slug}` },
        { status: 400 }
      );
    }

    const unitPrice = Number(product.salePrice ?? product.price);
    orderItems.push({
      productId: product._id,
      name: product.name,
      qty: item.qty,
      price: unitPrice,
    });
    totalAmount += unitPrice * item.qty;
  }

  const orderCode = makeOrderCode();
  const order = await OrderModel.create({
    userId: session.user.id,
    orderCode,
    items: orderItems,
    totalAmount,
    paymentMethod: "cod",
    paymentStatus: "paid",
    orderStatus: "pending",
    shippingAddress: {},
  });

  return NextResponse.json({
    data: {
      id: String(order._id),
      orderCode: order.orderCode,
    },
  });
}

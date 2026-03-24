import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import OrderModel from "@/models/Order";
import { dbConnect } from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const orders = await OrderModel.find({})
    .populate({ path: "userId", select: "name email" })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ data: orders });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    orderId?: string;
    orderStatus?: "pending" | "processing" | "completed" | "cancelled";
    paymentStatus?: "pending" | "paid" | "failed";
    activationCode?: string;
  };

  if (!body.orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.orderStatus) updates.orderStatus = body.orderStatus;
  if (body.paymentStatus) updates.paymentStatus = body.paymentStatus;
  if (body.activationCode) updates.deviceActivationCode = body.activationCode;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid updates provided" }, { status: 400 });
  }

  await dbConnect();
  const order = await OrderModel.findByIdAndUpdate(body.orderId, updates, { new: true }).lean();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ data: order, message: "Order updated" });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import UserModel from "@/models/User";
import DeviceModel from "@/models/Device";
import OrderModel from "@/models/Order";
import { dbConnect } from "@/lib/mongodb";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  await dbConnect();

  const [user, devices, orders] = await Promise.all([
    UserModel.findById(id).select("name email role status provider image createdAt").lean(),
    DeviceModel.find({ userId: id }).select("name deviceId status createdAt").sort({ createdAt: -1 }).lean(),
    OrderModel.find({ userId: id })
      .select("orderCode totalAmount paymentStatus orderStatus createdAt")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: { user, devices, orders } });
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const body = (await req.json()) as {
    role?: "customer" | "admin";
    status?: "active" | "banned";
  };

  const updates: Record<string, unknown> = {};
  if (body.role && ["customer", "admin"].includes(body.role)) {
    updates.role = body.role;
  }
  if (body.status && ["active", "banned"].includes(body.status)) {
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid updates provided" }, { status: 400 });
  }

  await dbConnect();
  const user = await UserModel.findByIdAndUpdate(id, updates, { new: true })
    .select("name email role status provider")
    .lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: user, message: "User updated successfully" });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  await dbConnect();
  const user = await UserModel.findByIdAndUpdate(
    id,
    { status: "banned", role: "customer" },
    { new: true }
  )
    .select("name email role status")
    .lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: user, message: "User soft-deleted (banned)" });
}

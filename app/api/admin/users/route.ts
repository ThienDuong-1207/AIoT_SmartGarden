import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import UserModel from "@/models/User";
import { dbConnect } from "@/lib/mongodb";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";

  await dbConnect();

  const query: Record<string, unknown> = {};
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }
  if (role) query.role = role;
  if (status) query.status = status;

  const users = await UserModel.find(query)
    .select("name email role status provider createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ data: users });
}

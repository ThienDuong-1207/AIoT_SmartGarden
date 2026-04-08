import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import UserModel from "@/models/User";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = (body.password || "").trim();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "name, email, and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  await dbConnect();

  const existing = await UserModel.findOne({
    email: { $regex: `^${email.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`, $options: "i" },
  }).lean();

  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    provider: "credentials",
    role: "customer",
    status: "active",
  });

  return NextResponse.json({
    data: {
      id: String(user._id),
      email: user.email,
      role: user.role,
    },
  });
}

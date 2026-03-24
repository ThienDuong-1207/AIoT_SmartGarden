import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import DeviceModel from "@/models/Device";
import { Types } from "mongoose";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const devices = await DeviceModel.find({ userId: session.user.id }).lean();
    return NextResponse.json({ data: devices });
  } catch {
    return NextResponse.json({ data: [] });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { activationCode?: string; name?: string };

  if (!body.activationCode) {
    return NextResponse.json(
      { error: "activationCode is required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const existing = await DeviceModel.findOne({
      activationCode: body.activationCode,
    });

    if (!existing) {
      return NextResponse.json({ error: "Invalid activation code" }, { status: 404 });
    }

    existing.userId = new Types.ObjectId(session.user.id);
    if (body.name) {
      existing.name = body.name;
    }
    await existing.save();

    return NextResponse.json({ data: existing });
  } catch {
    return NextResponse.json({ error: "Failed to add device" }, { status: 500 });
  }
}

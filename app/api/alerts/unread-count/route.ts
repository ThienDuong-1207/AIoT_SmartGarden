import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import AlertModel from "@/models/Alert";

/*
  GET /api/alerts/unread-count
  Returns count of unread alerts for the logged-in user
*/
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  // Count unread alerts for this user
  const count = await AlertModel.countDocuments({
    userId: session.user.id,
    isRead: false,
  });

  return NextResponse.json({ count });
}

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import AIdiagnosticModel from "@/models/AIdiagnostic";
import { authorizeDevice } from "@/lib/deviceAuth";

type Params = { params: Promise<{ deviceId: string; diagId: string }> };

/* GET: lấy 1 record đầy đủ kể cả imageBase64 */
export async function GET(req: NextRequest, { params }: Params) {
  const { deviceId, diagId } = await params;

  const auth = await authorizeDevice(req, deviceId);
  if (auth.error) return auth.error;

  await dbConnect();

  const doc = await AIdiagnosticModel.findById(diagId).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(doc);
}

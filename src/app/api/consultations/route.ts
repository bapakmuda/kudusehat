import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.consultationLog.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const log = await prisma.consultationLog.create({
    data: {
      childId: body.childId,
      sender: body.sender,
      text: body.text,
      timestamp: body.timestamp,
    },
  });
  return NextResponse.json(log, { status: 201 });
}

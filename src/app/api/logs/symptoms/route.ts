import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.symptomLog.findMany({
    orderBy: [{ date: "desc" }, { time: "desc" }],
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const log = await prisma.symptomLog.create({
    data: {
      childId: body.childId,
      symptom: body.symptom,
      severity: body.severity,
      date: body.date,
      time: body.time,
      notes: body.notes,
    },
  });
  return NextResponse.json(log, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.symptomLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, symptom, severity, date, time, notes } = body;
  
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  
  const log = await prisma.symptomLog.update({
    where: { id },
    data: {
      ...(symptom && { symptom }),
      ...(severity && { severity }),
      ...(date && { date }),
      ...(time && { time }),
      ...(notes !== undefined && { notes }),
    }
  });
  return NextResponse.json(log);
}

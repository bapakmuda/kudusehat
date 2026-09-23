import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getIndication(temp: number): string {
  if (temp < 36.5) return "Hipotermia";
  if (temp <= 37.5) return "Normal";
  if (temp <= 38.5) return "Demam Ringan";
  return "Demam Tinggi";
}

export async function GET() {
  const logs = await prisma.temperatureLog.findMany({
    orderBy: [{ date: "desc" }, { time: "desc" }],
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const log = await prisma.temperatureLog.create({
    data: {
      childId: body.childId,
      temperature: body.temperature,
      date: body.date,
      time: body.time,
      indication: getIndication(body.temperature),
    },
  });
  return NextResponse.json(log, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.temperatureLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, temperature, date, time } = body;
  
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  
  const log = await prisma.temperatureLog.update({
    where: { id },
    data: {
      ...(temperature && { temperature, indication: getIndication(temperature) }),
      ...(date && { date }),
      ...(time && { time }),
    }
  });
  return NextResponse.json(log);
}

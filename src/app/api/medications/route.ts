import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const meds = await prisma.medication.findMany({ orderBy: { scheduleTime: "asc" } });
  return NextResponse.json(meds);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const nameToUse = body.medicationName || body.name;

  const existing = await prisma.medication.findFirst({
    where: {
      childId: body.childId,
      name: nameToUse,
    }
  });

  if (existing) {
    // If medication exists, just increase its givenCount and update the schedule time
    const updated = await prisma.medication.update({
      where: { id: existing.id },
      data: {
        givenCount: (existing.givenCount ?? 0) + 1,
        status: "Diberikan",
        scheduleTime: body.scheduleTime || existing.scheduleTime,
        dosage: body.dosage || existing.dosage,
      },
    });
    return NextResponse.json(updated, { status: 200 });
  }

  const med = await prisma.medication.create({
    data: {
      childId: body.childId,
      name: body.name || body.medicationName,
      medicationName: body.medicationName || body.name,
      type: body.type,
      dosage: body.dosage,
      instructions: body.instructions,
      scheduleTime: body.scheduleTime,
      frequency: body.frequency ?? 1,
      status: "Belum Diberikan",
    },
  });
  return NextResponse.json(med, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const med = await prisma.medication.update({
    where: { id: body.id },
    data: {
      name: body.name,
      medicationName: body.medicationName || body.name,
      type: body.type,
      dosage: body.dosage,
      instructions: body.instructions,
      scheduleTime: body.scheduleTime,
      frequency: body.frequency ?? 1,
    },
  });
  return NextResponse.json(med);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const existing = await prisma.medication.findUnique({ where: { id: body.id } });
  const med = await prisma.medication.update({
    where: { id: body.id },
    data: {
      status: body.status,
      givenCount: body.status === "Diberikan"
        ? (existing?.givenCount ?? 0) + 1
        : existing?.givenCount ?? 0,
    },
  });
  return NextResponse.json(med);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.medication.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

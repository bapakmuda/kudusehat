import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const foods = await prisma.foodLog.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(foods);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const food = await prisma.foodLog.create({
    data: {
      childId: body.childId,
      foodName: body.foodName,
      date: body.date,
      time: body.time,
      notes: body.notes,
    },
  });
  return NextResponse.json(food, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.foodLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

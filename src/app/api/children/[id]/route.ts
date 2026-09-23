import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const child = await prisma.child.update({
    where: { id },
    data: {
      name: body.name,
      birthDate: body.birthDate,
      gender: body.gender,
      weight: body.weight,
    },
  });
  return NextResponse.json(child);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.child.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

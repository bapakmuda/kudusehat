import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const children = await prisma.child.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(children);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const child = await prisma.child.create({
    data: {
      name: body.name,
      birthDate: body.birthDate,
      gender: body.gender,
      weight: body.weight,
    },
  });
  return NextResponse.json(child, { status: 201 });
}

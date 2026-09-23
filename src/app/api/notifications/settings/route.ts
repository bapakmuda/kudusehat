import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    let settings = await prisma.notificationSetting.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.notificationSetting.create({
        data: { userId },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, webPush, whatsapp, quietHours } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const settings = await prisma.notificationSetting.upsert({
      where: { userId },
      update: {
        ...(webPush !== undefined && { webPush }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(quietHours !== undefined && { quietHours }),
      },
      create: {
        userId,
        webPush: webPush ?? true,
        whatsapp: whatsapp ?? false,
        quietHours: quietHours ?? false,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

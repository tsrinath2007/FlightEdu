import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as {
      id: string;
      email: string;
      name?: string;
      avatarUrl?: string;
    };

    if (body.id !== user.id) {
      return NextResponse.json({ error: "Forbidden: Cannot sync different user profile" }, { status: 403 });
    }

    const authHeader = request.headers.get("authorization");
    const isApp = !!(authHeader && authHeader.startsWith("Bearer "));
    const now = new Date();

    // Fetch existing user to check firstAppLoginAt
    const existingUser = await prisma.user.findUnique({
      where: { id: body.id },
      select: { firstAppLoginAt: true },
    });

    const updateData: any = {
      name: body.name ?? undefined,
      avatarUrl: body.avatarUrl ?? undefined,
    };

    if (isApp) {
      updateData.lastAppLoginAt = now;
      if (!existingUser || !existingUser.firstAppLoginAt) {
        updateData.firstAppLoginAt = now;
      }
    } else {
      updateData.lastWebLoginAt = now;
    }

    const dbUser = await prisma.user.upsert({
      where: { id: body.id },
      update: updateData,
      create: {
        id: body.id,
        email: body.email,
        name: body.name,
        avatarUrl: body.avatarUrl,
        coins: 0,
        firstAppLoginAt: isApp ? now : null,
        lastAppLoginAt: isApp ? now : null,
        lastWebLoginAt: !isApp ? now : null,
      },
    });

    return NextResponse.json({ user: dbUser });
  } catch (err) {
    console.error("User sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

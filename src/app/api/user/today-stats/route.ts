import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const user = await getUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const completedSessions = await prisma.session.findMany({
      where: {
        completedAt: {
          gte: todayStart,
          lt: todayEnd,
        },
        status: "COMPLETED",
        participants: {
          some: {
            userId: user.id,
            completed: true,
          },
        },
      },
      select: {
        duration: true,
      },
    });

    const todayFocusMinutes = completedSessions.reduce((acc, s) => acc + s.duration, 0);

    return NextResponse.json({ todayFocusMinutes });
  } catch (error) {
    console.error("Get today stats error:", error);
    return NextResponse.json({ error: "Failed to fetch today stats" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flights = await prisma.sessionParticipant.findMany({
      where: {
        userId: user.id,
        completed: true,
      },
      include: {
        session: {
          select: {
            origin: true,
            originCode: true,
            destination: true,
            destinationCode: true,
            transportMode: true,
            duration: true,
            mode: true,
            completedAt: true,
            startedAt: true,
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    return NextResponse.json({ success: true, flights });
  } catch (err) {
    console.error("Failed to fetch completed flights:", err);
    return NextResponse.json({ error: "Failed to fetch flights" }, { status: 500 });
  }
}

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

    // Fetch completed session participant records
    const history = await prisma.sessionParticipant.findMany({
      where: {
        userId: user.id,
      },
      include: {
        session: true,
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Get travel history error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

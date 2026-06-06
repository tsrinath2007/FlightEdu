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

    // Fetch transactions representing admin grants (where amount is greater than 0)
    const adminNotifs = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        amount: { gt: 0 },
        OR: [
          { reason: { contains: "admin", mode: "insensitive" } },
          { reason: { contains: "reward", mode: "insensitive" } },
          { reason: { contains: "welcome", mode: "insensitive" } },
          { reason: { contains: "gift", mode: "insensitive" } },
          { reason: { contains: "bonus", mode: "insensitive" } },
          { reason: { contains: "grant", mode: "insensitive" } },
        ]
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    });

    return NextResponse.json({ notifications: adminNotifs });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { coinsEarned } = await request.json() as { coinsEarned: number };
    const amount = Math.max(0, Math.round(coinsEarned || 0));

    if (amount === 0) {
      return NextResponse.json({ success: true, coins: 0 });
    }

    try {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { coins: { increment: amount } },
        select: { coins: true },
      });
      return NextResponse.json({ success: true, coins: updated.coins });
    } catch (dbErr) {
      console.warn("DB coin sync failed:", dbErr);
      return NextResponse.json({ success: false, error: "DB unavailable" }, { status: 503 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Failed to sync coins" }, { status: 500 });
  }
}

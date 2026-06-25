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

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        coins: true,
        streakFreezes: true,
        freezeCooldownStart: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentFreezes = dbUser.streakFreezes ?? 2;

    if (currentFreezes >= 3) {
      return NextResponse.json({ error: "Maximum capacity reached (3 freezes)" }, { status: 400 });
    }

    if (dbUser.coins < 450) {
      return NextResponse.json({ error: "Insufficient coins. Streak freeze costs 450 coins." }, { status: 400 });
    }

    const newFreezes = currentFreezes + 1;
    const newCoins = dbUser.coins - 450;
    
    // Clear cooldown if max reached, otherwise preserve/start cooldown if less than 3
    const newCooldownStart = newFreezes >= 3 ? null : (dbUser.freezeCooldownStart ?? new Date());

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        coins: newCoins,
        streakFreezes: newFreezes,
        freezeCooldownStart: newCooldownStart,
      },
      select: {
        coins: true,
        streakFreezes: true,
        freezeCooldownStart: true,
      },
    });

    return NextResponse.json({
      success: true,
      coins: updated.coins,
      streakFreezes: updated.streakFreezes,
      freezeCooldownStart: updated.freezeCooldownStart,
    });
  } catch (err: any) {
    console.error("Streak freeze purchase failed:", err);
    return NextResponse.json({ error: "Failed to purchase streak freeze" }, { status: 500 });
  }
}

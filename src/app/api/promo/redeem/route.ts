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

    const body = await request.json() as { code?: string };
    const rawCode = body.code?.trim() || "";

    if (!rawCode) {
      return NextResponse.json({ error: "Promo code is required." }, { status: 400 });
    }

    const upperCode = rawCode.toUpperCase();

    if (upperCode !== "WELCOME2026") {
      return NextResponse.json({ error: "Invalid promo code." }, { status: 400 });
    }

    // Check if this user has already redeemed the WELCOME2026 code
    const alreadyRedeemed = await prisma.transaction.findFirst({
      where: {
        userId: user.id,
        reason: {
          contains: "WELCOME2026",
          mode: "insensitive"
        }
      }
    });

    if (alreadyRedeemed) {
      return NextResponse.json({ error: "Promo code has already been redeemed." }, { status: 400 });
    }

    // Award 2500 coins to user, set receivedWelcomeBonus to true, and log the transaction
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        coins: { increment: 2500 },
        receivedWelcomeBonus: true,
        transactions: {
          create: {
            amount: 2500,
            reason: "Promo code WELCOME2026 redeemed! +2500 Focus Coins credited to your cockpit treasury. Time to lock in, no cap! ✈️🔥",
          }
        }
      },
      select: {
        coins: true
      }
    });

    return NextResponse.json({
      success: true,
      coins: updatedUser.coins,
      message: "Promo code WELCOME2026 redeemed successfully! +2500 Focus Coins added."
    });
  } catch (error) {
    console.error("Promo redeem error:", error);
    return NextResponse.json({ error: "Failed to redeem promo code." }, { status: 500 });
  }
}

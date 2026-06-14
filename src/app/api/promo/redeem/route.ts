import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limiter = rateLimit(ip, 5, 60000); // 5 requests per minute
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

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

    // Query the database to find the promo code dynamically
    const promo = await prisma.promoCode.findUnique({
      where: { code: upperCode }
    });

    if (!promo) {
      return NextResponse.json({ error: "Invalid promo code." }, { status: 400 });
    }

    if (!promo.isActive) {
      return NextResponse.json({ error: "This promo code has been disabled." }, { status: 400 });
    }

    // Check if this user has already redeemed or has been blocked from this specific code
    const existingPromoTx = await prisma.transaction.findFirst({
      where: {
        userId: user.id,
        reason: {
          contains: `Promo code ${promo.code}`,
          mode: "insensitive"
        }
      }
    });

    if (existingPromoTx) {
      const reasonLower = existingPromoTx.reason.toLowerCase();
      if (reasonLower.includes("blocked") || reasonLower.includes("disabled")) {
        return NextResponse.json({ error: "The Bonus 2500 is already given by admin" }, { status: 400 });
      }
      return NextResponse.json({ error: "Promo code has already been redeemed." }, { status: 400 });
    }

    // Award coins dynamically from the promo code record and log the transaction
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        coins: { increment: promo.coins },
        // If they redeem the welcome promo code, we can flag receivedWelcomeBonus as true
        receivedWelcomeBonus: promo.code === "WELCOME2026" ? true : undefined,
        transactions: {
          create: {
            amount: promo.coins,
            reason: `Promo code ${promo.code} redeemed! +${promo.coins} Focus Coins credited to your cockpit treasury. Time to lock in, no cap! ✈️🔥`,
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
      message: `Promo code ${promo.code} redeemed successfully! +${promo.coins} Focus Coins added.`
    });
  } catch (error) {
    console.error("Promo redeem error:", error);
    return NextResponse.json({ error: "Failed to redeem promo code." }, { status: 500 });
  }
}

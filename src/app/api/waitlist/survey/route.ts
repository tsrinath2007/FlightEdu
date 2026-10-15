import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const votes = await prisma.pricingSurveyVote.findMany({
      select: { duration: true, price: true },
    });

    const totalVotes = votes.length;

    // Group votes by duration and price
    const tally: Record<string, Record<number, number>> = {
      "1_month": { 70: 0, 80: 0, 90: 0 },
      "6_months": { 300: 0, 400: 0, 500: 0 },
      "1_year": { 700: 0, 800: 0, 900: 0, 1000: 0 },
    };

    votes.forEach((v) => {
      if (tally[v.duration]) {
        tally[v.duration][v.price] = (tally[v.duration][v.price] || 0) + 1;
      }
    });

    return NextResponse.json({
      totalVotes,
      tally,
    });
  } catch (error) {
    console.error("Survey GET error:", error);
    return NextResponse.json({ totalVotes: 0, tally: {} });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { duration, price, email } = body;

    if (!duration || !price) {
      return NextResponse.json({ error: "Please select a duration and price." }, { status: 400 });
    }

    const priceNum = Number(price);

    // 1. Record the vote in PricingSurveyVote table
    await prisma.pricingSurveyVote.create({
      data: {
        duration: String(duration),
        price: priceNum,
        email: email ? String(email).trim().toLowerCase() : null,
      },
    });

    // 2. If an email is provided, also update their AppWaitlist preference
    if (email && typeof email === "string" && email.includes("@")) {
      const normalizedEmail = email.trim().toLowerCase();
      try {
        await prisma.appWaitlist.updateMany({
          where: { email: normalizedEmail },
          data: {
            planDuration: String(duration),
            willingPrice: priceNum,
          },
        });
      } catch (err) {
        // AppWaitlist might not have the record yet, which is fine
      }
    }

    return NextResponse.json({
      success: true,
      message: `Vote recorded for ₹${priceNum}! Thank you for shaping GoFocusGen.`,
    });
  } catch (error) {
    console.error("Survey POST error:", error);
    return NextResponse.json({ error: "Failed to record vote." }, { status: 500 });
  }
}

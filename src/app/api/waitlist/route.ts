import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BASE_COUNT = 120; // Starts with base registrations count as requested

export async function GET() {
  try {
    const totalInDb = await prisma.appWaitlist.count();
    const count = BASE_COUNT + totalInDb;

    return NextResponse.json({
      count,
      displayCount: `${count}+`,
    });
  } catch (error) {
    console.error("Waitlist count error:", error);
    return NextResponse.json({ count: BASE_COUNT, displayCount: `${BASE_COUNT}+` });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, platform = "all", pilotId, name, avatarUrl, provider = "email", googleId } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Upsert into waitlist
    await prisma.appWaitlist.upsert({
      where: { email: normalizedEmail },
      create: {
        email: normalizedEmail,
        name: name ? String(name).trim() : null,
        avatarUrl: avatarUrl ? String(avatarUrl).trim() : null,
        platform: String(platform || "all"),
        pilotId: pilotId ? String(pilotId).trim() : null,
        provider: String(provider || "email"),
        googleId: googleId ? String(googleId).trim() : null,
      },
      update: {
        name: name ? String(name).trim() : undefined,
        avatarUrl: avatarUrl ? String(avatarUrl).trim() : undefined,
        platform: String(platform || "all"),
        pilotId: pilotId ? String(pilotId).trim() : undefined,
        provider: String(provider || "email"),
        googleId: googleId ? String(googleId).trim() : undefined,
      },
    });

    const totalInDb = await prisma.appWaitlist.count();
    const position = BASE_COUNT + totalInDb;

    return NextResponse.json({
      success: true,
      position,
      message: `You're on the flight list! Position #${position}. We'll email you the moment the app takes off!`,
    });
  } catch (error) {
    console.error("Waitlist registration error:", error);
    return NextResponse.json({ error: "Failed to join waitlist. Please try again." }, { status: 500 });
  }
}

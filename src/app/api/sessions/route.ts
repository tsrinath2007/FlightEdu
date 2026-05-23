import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "@/lib/nanoid";

export async function POST(request: Request) {
  let userId: string | null = null;
  let userEmail: string = "guest@flightedu.com";
  let userName: string = "Simulated Guest";

  try {
    const supabase = await createClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        userEmail = user.email || "guest@flightedu.com";
        userName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Pilot";
      }
    }
  } catch (err) {
    console.warn("Supabase auth check failed in session creation, falling back to simulated guest:", err);
  }

  // Fallback to simulated guest user if not authenticated (enables the Simulation Takeoff to work!)
  if (!userId) {
    userId = "simulated-guest-user-id";
  }

  const body = await request.json() as {
    origin: string;
    originCode: string;
    destination: string;
    destinationCode: string;
    transportMode: string;
    duration: number;
    mode: "CHILL" | "HARDCORE";
  };

  // Upsert the user into the database first to prevent foreign key errors
  try {
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: userEmail,
        name: userName,
        coins: 100, // Give guests some starter coins
        onboarded: true,
      },
    });
  } catch (dbErr) {
    console.warn("Database upsert failed during session creation, continuing anyway:", dbErr);
  }

  const session = await prisma.session.create({
    data: {
      hostId: userId,
      origin: body.origin,
      originCode: body.originCode,
      destination: body.destination,
      destinationCode: body.destinationCode,
      transportMode: body.transportMode as "FLIGHT" | "BUS" | "TRAIN" | "CAR",
      duration: body.duration,
      mode: body.mode,
      inviteCode: nanoid(8),
      participants: {
        create: { userId: userId },
      },
    },
    include: { participants: true },
  });

  return NextResponse.json({ session });
}

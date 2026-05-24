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

    const { inviteCode } = await request.json() as { inviteCode: string };

    if (!inviteCode) {
      return NextResponse.json({ error: "Flight Pass Code is required" }, { status: 400 });
    }

    const cleanCode = inviteCode.trim();

    // 1. Find the flight session by inviteCode or direct ID
    const session = await prisma.session.findFirst({
      where: {
        OR: [
          { inviteCode: { equals: cleanCode, mode: "insensitive" } },
          { id: cleanCode.toLowerCase() }
        ]
      },
      include: {
        participants: true
      }
    });

    if (!session) {
      return NextResponse.json({ error: "Flight not found. Double check your Boarding Pass Code." }, { status: 404 });
    }

    if (session.status === "CANCELLED") {
      return NextResponse.json({ error: "This flight has been cancelled." }, { status: 400 });
    }

    // 2. Check if already a participant
    const existingParticipant = session.participants.find(p => p.userId === user.id);

    if (existingParticipant) {
      if (existingParticipant.isAccepted) {
        return NextResponse.json({
          success: true,
          status: "BOARDED",
          sessionId: session.id,
          message: "You have already boarded this flight!"
        });
      } else {
        return NextResponse.json({
          success: true,
          status: "PENDING",
          sessionId: session.id,
          message: "Your boarding request is pending host approval."
        });
      }
    }

    // 3. Assign an available seat
    const occupiedSeats = session.participants.map(p => p.seat).filter(Boolean) as string[];
    const allSeats = [
      "1A", "1D", "2A", "2D",
      "4A", "4C", "4F", "8A", "8C", "8F",
      "12A", "12B", "12D", "12J", "14A", "14B", "14D", "14J",
      "26A", "26B", "26D", "26J", "32A", "32B", "32D", "32J"
    ];
    const availableSeats = allSeats.filter(s => !occupiedSeats.includes(s));
    const seatNumber = availableSeats[Math.floor(Math.random() * availableSeats.length)] || "12B";

    // 4. Create participant record depending on privacy level
    const autoAccept = !session.isPrivate; // Public = auto-accept, Private = pending

    const participant = await prisma.sessionParticipant.create({
      data: {
        sessionId: session.id,
        userId: user.id,
        isAccepted: autoAccept,
        seat: seatNumber
      }
    });

    return NextResponse.json({
      success: true,
      status: autoAccept ? "BOARDED" : "PENDING",
      sessionId: session.id,
      participant,
      message: autoAccept
        ? "Flight boarded successfully!"
        : "Boarding request sent. Waiting for host approval..."
    });

  } catch (error) {
    console.error("Join flight error:", error);
    return NextResponse.json({ error: "Failed to join flight" }, { status: 500 });
  }
}

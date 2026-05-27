import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure the Session exists in the database first (resilient to simulated/mock routes)
    try {
      const dbSession = await prisma.session.findUnique({
        where: { id: sessionId }
      });
      if (!dbSession) {
        await prisma.session.create({
          data: {
            id: sessionId,
            hostId: user.id,
            origin: "Dubai Intl Airport",
            originCode: "DXB",
            destination: "Changi Airport",
            destinationCode: "SIN",
            transportMode: "FLIGHT",
            duration: 360,
            mode: "CHILL",
          }
        });
      }
    } catch (e) {
      console.warn("Failed to ensure Session record exists, proceeding anyway:", e);
    }

    const { seatNumber, studySubject } = await request.json() as {
      seatNumber: string;
      studySubject?: string;
    };

    if (!seatNumber) {
      return NextResponse.json({ error: "Seat number is required" }, { status: 400 });
    }

    // 1. Check double-booking protection (ensure seat is not already taken by another accepted participant)
    const takenSeat = await prisma.sessionParticipant.findFirst({
      where: {
        sessionId,
        seat: seatNumber,
        userId: { not: user.id },
        isAccepted: true,
        leftAt: null,
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    if (takenSeat) {
      const occupantName = takenSeat.user?.name || "another pilot";
      return NextResponse.json(
        { error: `Seat ${seatNumber} is already occupied by ${occupantName}!` },
        { status: 400 }
      );
    }

    // 2. If studySubject is specified, update user's studyTime subject in DB
    if (studySubject) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { studyTime: studySubject },
        });
      } catch (err) {
        console.warn("Failed to sync study subject to user profile:", err);
      }
    }

    // 3. Update the seat inside the SessionParticipant record
    const participant = await prisma.sessionParticipant.upsert({
      where: {
        sessionId_userId: {
          sessionId,
          userId: user.id,
        },
      },
      update: {
        seat: seatNumber,
      },
      create: {
        sessionId,
        userId: user.id,
        seat: seatNumber,
        isAccepted: true,
      },
    });

    return NextResponse.json({ success: true, participant });
  } catch (error) {
    console.error("Update seat error:", error);
    return NextResponse.json({ error: "Failed to update seat" }, { status: 500 });
  }
}


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

    const { seatNumber } = await request.json() as { seatNumber: string };

    if (!seatNumber) {
      return NextResponse.json({ error: "Seat number is required" }, { status: 400 });
    }

    // Update the seat inside the SessionParticipant record
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

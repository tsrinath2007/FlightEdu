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

    const { targetUserId, approve } = await request.json() as { targetUserId: string; approve: boolean };

    if (!targetUserId) {
      return NextResponse.json({ error: "Target User ID is required" }, { status: 400 });
    }

    // Verify current user is the host of the session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { hostId: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.hostId !== user.id) {
      return NextResponse.json({ error: "Only the session host can approve boarding requests" }, { status: 403 });
    }

    if (approve) {
      // Approve: set isAccepted to true
      await prisma.sessionParticipant.update({
        where: {
          sessionId_userId: {
            sessionId,
            userId: targetUserId
          }
        },
        data: {
          isAccepted: true
        }
      });
      return NextResponse.json({ success: true, message: "Boarding request approved!" });
    } else {
      // Decline: delete the participant record
      await prisma.sessionParticipant.delete({
        where: {
          sessionId_userId: {
            sessionId,
            userId: targetUserId
          }
        }
      });
      return NextResponse.json({ success: true, message: "Boarding request declined." });
    }

  } catch (error) {
    console.error("Approve boarding error:", error);
    return NextResponse.json({ error: "Failed to process boarding request" }, { status: 500 });
  }
}

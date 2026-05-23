import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
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

    const { targetUserId } = await request.json() as { targetUserId: string };

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
      return NextResponse.json({ error: "Only the session host can kick participants" }, { status: 403 });
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: "Cannot kick yourself" }, { status: 400 });
    }

    // Find and delete session participant record
    const participant = await prisma.sessionParticipant.findFirst({
      where: { sessionId, userId: targetUserId },
    });

    if (!participant) {
      return NextResponse.json({ error: "Participant not found in session" }, { status: 404 });
    }

    await prisma.sessionParticipant.delete({
      where: { id: participant.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Kick participant error:", error);
    return NextResponse.json({ error: "Failed to kick participant" }, { status: 500 });
  }
}

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

    const { friendId } = await request.json() as { friendId: string };

    if (!friendId) {
      return NextResponse.json({ error: "Friend ID is required" }, { status: 400 });
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
      return NextResponse.json({ error: "Only the session host can invite pilots" }, { status: 403 });
    }

    // Check if already a participant
    const existing = await prisma.sessionParticipant.findFirst({
      where: { sessionId, userId: friendId },
    });

    if (existing) {
      return NextResponse.json({ error: "Pilot is already in the cabin" }, { status: 400 });
    }

    // Add friend to session
    const participant = await prisma.sessionParticipant.create({
      data: {
        sessionId,
        userId: friendId,
      },
    });

    return NextResponse.json({ success: true, participant });
  } catch (error) {
    console.error("Invite friend error:", error);
    return NextResponse.json({ error: "Failed to invite friend" }, { status: 500 });
  }
}

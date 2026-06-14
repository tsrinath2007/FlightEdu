import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                pilotId: true,
                avatarUrl: true,
                coins: true,
                age: true,
                studyTime: true,
                studyDuration: true,
                distractibility: true,
                callDistraction: true,
                dream: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isHost = session.hostId === user.id;
    const isParticipant = session.participants.some((p) => p.userId === user.id);
    const isAcceptedParticipant = session.participants.some((p) => p.userId === user.id && p.isAccepted);

    // If it's private, only allow host or users who have a participant record (invited or joined)
    if (session.isPrivate && !isHost && !isParticipant) {
      return NextResponse.json({ error: "Access denied to private flight charter" }, { status: 403 });
    }

    // Strip out other participants' details if they are not yet fully accepted/boarded
    let responseSession = session;
    if (!isHost && !isAcceptedParticipant) {
      responseSession = {
        ...session,
        participants: [],
      };
    }

    return NextResponse.json({ session: responseSession });
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}


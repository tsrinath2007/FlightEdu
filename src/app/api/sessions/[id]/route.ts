import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient, getUser } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getUser(request);

    if (!user) {
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as {
      status?: "WAITING" | "BOARDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
    };

    if (!body.status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const updateData: any = {
      status: body.status,
    };

    if (body.status === "COMPLETED") {
      updateData.completedAt = new Date();
    } else if (body.status === "ACTIVE") {
      updateData.startedAt = new Date();
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data: updateData,
    });

    // If status is updated to COMPLETED, increment the user's totalXp by 10 + Math.floor(session.duration / 5)
    if (body.status === "COMPLETED") {
      const xpReward = 10 + Math.floor(session.duration / 5);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalXp: { increment: xpReward },
        },
      });
    }

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error("Update session error:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}


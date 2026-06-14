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

    const { type, targetSeat } = await request.json() as {
      type: string;
      targetSeat: string;
    };

    if (!type || !targetSeat) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch sender's name from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true }
    });
    const senderName = dbUser?.name || "Co-pilot";

    // Create the session event
    const event = await prisma.sessionEvent.create({
      data: {
        sessionId,
        senderId: user.id,
        senderName,
        targetSeat,
        type,
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Create session event error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const sinceStr = searchParams.get("since");

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is session host or an accepted participant
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { hostId: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isHost = session.hostId === user.id;
    const isParticipant = await prisma.sessionParticipant.findFirst({
      where: {
        sessionId,
        userId: user.id,
        isAccepted: true,
      },
      select: { id: true },
    });

    if (!isHost && !isParticipant) {
      return NextResponse.json({ error: "Access denied to session events" }, { status: 403 });
    }
    
    // Default to events from the last 30 seconds if since parameter is not provided
    const sinceDate = sinceStr 
      ? new Date(parseInt(sinceStr)) 
      : new Date(Date.now() - 30000);

    const events = await prisma.sessionEvent.findMany({
      where: {
        sessionId,
        createdAt: {
          gt: sinceDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Run pruning in the background (older than 10 minutes)
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      await prisma.sessionEvent.deleteMany({
        where: {
          sessionId,
          createdAt: {
            lt: tenMinutesAgo,
          },
        },
      });
    } catch (pruneErr) {
      console.warn("SessionEvent background pruning failed:", pruneErr);
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Get session events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

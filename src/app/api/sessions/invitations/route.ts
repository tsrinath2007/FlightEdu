import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// 1. GET: Fetch all pending invitations for the logged-in user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invites = await prisma.sessionParticipant.findMany({
      where: {
        userId: user.id,
        isAccepted: false,
      },
      include: {
        session: {
          include: {
            host: {
              select: {
                id: true,
                name: true,
                pilotId: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    return NextResponse.json({ invites });
  } catch (error) {
    console.error("Get session invites error:", error);
    return NextResponse.json({ error: "Failed to fetch session invites" }, { status: 500 });
  }
}

// 2. PUT: Accept a pending session invitation
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json() as { sessionId: string };

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Verify invitation exists
    const invitation = await prisma.sessionParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId: user.id,
        },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Update isAccepted to true
    const updated = await prisma.sessionParticipant.update({
      where: {
        id: invitation.id,
      },
      data: {
        isAccepted: true,
      },
    });

    return NextResponse.json({ success: true, participant: updated });
  } catch (error) {
    console.error("Accept session invite error:", error);
    return NextResponse.json({ error: "Failed to accept session invite" }, { status: 500 });
  }
}

// 3. DELETE: Decline/Reject a pending session invitation
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json() as { sessionId: string };

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Delete the session participant record (declines the invitation)
    await prisma.sessionParticipant.delete({
      where: {
        sessionId_userId: {
          sessionId,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Decline session invite error:", error);
    return NextResponse.json({ error: "Failed to decline session invite" }, { status: 500 });
  }
}

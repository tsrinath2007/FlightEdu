import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const publicProfileSelection = {
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
  totalHours: true,
  currentStreak: true,
  longestStreak: true,
  badges: {
    include: {
      badge: true,
    },
  },
  sessionParticipants: {
    where: { completed: true },
    select: {
      session: {
        select: {
          originCode: true,
          destinationCode: true,
          duration: true,
          completedAt: true,
        }
      }
    }
  }
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const pilotIdOrId = resolvedParams.id;

    if (!pilotIdOrId) {
      return NextResponse.json({ error: "Invalid ID parameter" }, { status: 400 });
    }

    // Query User by pilotId (unique field) first, then by id (unique primary key)
    const profileUser = await prisma.user.findFirst({
      where: {
        OR: [
          { pilotId: pilotIdOrId },
          { id: pilotIdOrId },
        ],
      },
      select: publicProfileSelection,
    });

    if (!profileUser) {
      return NextResponse.json({ error: "Pilot not found in GoFocusGen database" }, { status: 404 });
    }

    // Check relationship with current logged-in user
    let relationshipStatus = "NONE"; // NONE, ACCEPTED, PENDING_SENT, PENDING_RECEIVED, SELF
    let currentUserId = "";

    try {
      const supabase = await createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser) {
        currentUserId = currentUser.id;
        if (currentUser.id === profileUser.id) {
          relationshipStatus = "SELF";
        } else {
          const friendship = await prisma.friendship.findFirst({
            where: {
              OR: [
                { senderId: currentUser.id, receiverId: profileUser.id },
                { senderId: profileUser.id, receiverId: currentUser.id },
              ],
            },
          });

          if (friendship) {
            if (friendship.status === "ACCEPTED") {
              relationshipStatus = "ACCEPTED";
            } else {
              relationshipStatus = friendship.senderId === currentUser.id ? "PENDING_SENT" : "PENDING_RECEIVED";
            }
          }
        }
      }
    } catch (authErr) {
      console.warn("Auth check in public profile failed:", authErr);
    }

    // Extract formatted flights matching profile stamp log logic
    const flights = profileUser.sessionParticipants.map((p: any) => ({
      id: p.id,
      sessionId: p.session?.id,
      joinedAt: p.session?.startedAt || p.joinedAt,
      session: p.session,
    }));

    return NextResponse.json({
      success: true,
      profile: {
        id: profileUser.id,
        name: profileUser.name,
        pilotId: profileUser.pilotId,
        avatarUrl: profileUser.avatarUrl,
        coins: profileUser.coins,
        totalHours: profileUser.totalHours,
        currentStreak: profileUser.currentStreak,
        longestStreak: profileUser.longestStreak,
        age: profileUser.age,
        studyTime: profileUser.studyTime,
        studyDuration: profileUser.studyDuration,
        distractibility: profileUser.distractibility,
        callDistraction: profileUser.callDistraction,
        badges: profileUser.badges,
      },
      flights,
      relationshipStatus,
      currentUserId,
    });
  } catch (error) {
    console.error("Public profile query error:", error);
    return NextResponse.json({ error: "Failed to load pilot license" }, { status: 500 });
  }
}

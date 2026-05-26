import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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

// 1. GET: List all active friends, incoming pending requests, and outgoing pending requests
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
      },
      include: {
        sender: {
          select: publicProfileSelection,
        },
        receiver: {
          select: publicProfileSelection,
        },
      },
    });

    const friends: any[] = [];
    const incoming: any[] = [];
    const outgoing: any[] = [];

    friendships.forEach((f) => {
      const isSender = f.senderId === user.id;
      const otherUser = isSender ? f.receiver : f.sender;

      const friendshipData = {
        friendshipId: f.id,
        status: f.status,
        createdAt: f.createdAt,
        user: otherUser,
      };

      if (f.status === "ACCEPTED") {
        friends.push(friendshipData);
      } else if (f.status === "PENDING") {
        if (isSender) {
          outgoing.push(friendshipData);
        } else {
          incoming.push(friendshipData);
        }
      }
    });

    return NextResponse.json({ friends, incoming, outgoing });
  } catch (error) {
    console.error("Get friendships error:", error);
    return NextResponse.json({ error: "Failed to fetch friendships" }, { status: 500 });
  }
}

// 2. POST: Send a new friend request
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId } = await request.json() as { receiverId: string };

    if (!receiverId || receiverId === user.id) {
      return NextResponse.json({ error: "Invalid receiver" }, { status: 400 });
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    });

    if (!receiver) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for existing friendship
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId },
          { senderId: receiverId, receiverId: user.id },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Relationship already exists", status: existing.status }, { status: 400 });
    }

    // Create pending request
    const newRequest = await prisma.friendship.create({
      data: {
        senderId: user.id,
        receiverId,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, friendship: newRequest });
  } catch (error) {
    console.error("Create friendship error:", error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}

// 3. PUT: Accept a friend request
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { senderId } = await request.json() as { senderId: string };

    if (!senderId) {
      return NextResponse.json({ error: "Sender ID is required" }, { status: 400 });
    }

    // Find the pending request where the current user is the receiver
    const pendingRequest = await prisma.friendship.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId: user.id,
        },
      },
    });

    if (!pendingRequest || pendingRequest.status !== "PENDING") {
      return NextResponse.json({ error: "No pending friend request found" }, { status: 404 });
    }

    // Update status to ACCEPTED
    const updated = await prisma.friendship.update({
      where: {
        id: pendingRequest.id,
      },
      data: {
        status: "ACCEPTED",
      },
    });

    return NextResponse.json({ success: true, friendship: updated });
  } catch (error) {
    console.error("Accept friendship error:", error);
    return NextResponse.json({ error: "Failed to accept request" }, { status: 500 });
  }
}

// 4. DELETE: Decline/Cancel request or Unfriend
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { otherUserId } = await request.json() as { otherUserId: string };

    if (!otherUserId) {
      return NextResponse.json({ error: "Other user ID is required" }, { status: 400 });
    }

    // Find friendship between these two users in either direction
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: user.id },
        ],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Relationship not found" }, { status: 404 });
    }

    // Delete the friendship
    await prisma.friendship.delete({
      where: {
        id: existing.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete friendship error:", error);
    return NextResponse.json({ error: "Failed to delete relationship" }, { status: 500 });
  }
}

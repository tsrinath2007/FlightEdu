import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json({ users: [] });
    }

    // Search users by name or pilotId (case-insensitive), excluding self
    const matchingUsers = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { pilotId: { contains: query, mode: "insensitive" } },
        ],
      },
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
      },
      take: 20,
    });

    // Check relationship status for each matching user
    const userIds = matchingUsers.map((u) => u.id);
    const relationships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: { in: userIds } },
          { senderId: { in: userIds }, receiverId: user.id },
        ],
      },
    });

    const usersWithStatus = matchingUsers.map((u) => {
      const relationship = relationships.find(
        (r) => (r.senderId === user.id && r.receiverId === u.id) || (r.senderId === u.id && r.receiverId === user.id)
      );

      let status = "NONE";
      let isSender = false;

      if (relationship) {
        status = relationship.status;
        isSender = relationship.senderId === user.id;
      }

      return {
        ...u,
        friendshipStatus: status, // "NONE", "PENDING", "ACCEPTED"
        isOutgoingRequest: status === "PENDING" && isSender,
        isIncomingRequest: status === "PENDING" && !isSender,
      };
    });

    return NextResponse.json({ users: usersWithStatus });
  } catch (error) {
    console.error("Search friends error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

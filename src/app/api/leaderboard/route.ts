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
    const scope = searchParams.get("scope") || "world"; // "world" or "friends"
    const metric = searchParams.get("metric") || "coins"; // "coins", "hours", "streak"

    // Validate parameters
    if (!["world", "friends"].includes(scope)) {
      return NextResponse.json({ error: "Invalid scope parameter" }, { status: 400 });
    }
    if (!["coins", "hours", "streak"].includes(metric)) {
      return NextResponse.json({ error: "Invalid metric parameter" }, { status: 400 });
    }

    // Determine the sorting field
    let orderByField: "coins" | "totalHours" | "currentStreak" = "coins";
    if (metric === "hours") orderByField = "totalHours";
    if (metric === "streak") orderByField = "currentStreak";

    // Public fields to select for privacy
    const selectFields = {
      id: true,
      name: true,
      pilotId: true,
      avatarUrl: true,
      coins: true,
      totalHours: true,
      currentStreak: true,
      longestStreak: true,
    };

    let rankings: any[] = [];
    let currentUserRankIndex = -1;

    if (scope === "world") {
      // Fetch all onboarded users, sorted by the selected metric
      const allUsers = await prisma.user.findMany({
        where: {
          onboarded: true,
        },
        select: selectFields,
        orderBy: {
          [orderByField]: "desc",
        },
      });

      rankings = allUsers;
    } else {
      // Friends scope: Fetch accepted friendships
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { senderId: user.id },
            { receiverId: user.id },
          ],
          status: "ACCEPTED",
        },
      });

      // Gather friend IDs
      const friendIds = friendships.map((f) =>
        f.senderId === user.id ? f.receiverId : f.senderId
      );

      // Always include current user in the friends list
      friendIds.push(user.id);

      // Fetch details of all friends (+ current user)
      const friendUsers = await prisma.user.findMany({
        where: {
          id: { in: friendIds },
          onboarded: true,
        },
        select: selectFields,
        orderBy: {
          [orderByField]: "desc",
        },
      });

      rankings = friendUsers;
    }

    // Find the rank index of the current user
    currentUserRankIndex = rankings.findIndex((r) => r.id === user.id);

    return NextResponse.json({
      success: true,
      rankings,
      currentUserRank: currentUserRankIndex !== -1 ? currentUserRankIndex + 1 : null,
      currentUser: rankings[currentUserRankIndex] || null,
    });
  } catch (error: any) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { coinsEarned, secondsFocused, sessionId, completed } = await request.json() as {
      coinsEarned: number;
      secondsFocused?: number;
      sessionId?: string;
      completed?: boolean;
    };
    const amount = Math.round(coinsEarned || 0);

    try {
      // Fetch the current user details for streak calculations
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          coins: true,
          currentStreak: true,
          longestStreak: true,
          streakFreezes: true,
          lastStudyDate: true,
          totalHours: true,
        },
      });

      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Calculate total hours increment
      const totalHoursIncrement = secondsFocused ? Number((secondsFocused / 3600).toFixed(4)) : 0;

      // --- STREAK & FREEZE ACCRUAL ENGINE ---
      let newStreak = dbUser.currentStreak;
      let newStreakFreezes = dbUser.streakFreezes ?? 2;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let newLastStudyDate = now;

      if (!dbUser.lastStudyDate) {
        // First study session ever
        newStreak = 1;
      } else {
        const lastDate = new Date(dbUser.lastStudyDate);
        const lastStudyDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());

        const diffTime = today.getTime() - lastStudyDay.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Continued study streak (yesterday to today)
          newStreak = dbUser.currentStreak + 1;
          // Award 1 streak freeze for completing a week of streak (7 days)
          if (newStreak % 7 === 0) {
            newStreakFreezes = Math.min(3, newStreakFreezes + 1);
          }
        } else if (diffDays === 0) {
          // Already studied today, maintain the current streak
          newStreak = dbUser.currentStreak;
        } else {
          // Streak broken (diffDays > 1), restart streak at 1
          newStreak = 1;
        }
      }

      const newCoins = Math.max(0, dbUser.coins + amount);

      // 1. Update the SessionParticipant focus logs if flight is connected
      if (sessionId) {
        const actualHours = secondsFocused ? Number((secondsFocused / 3600).toFixed(4)) : 0;
        try {
          await prisma.sessionParticipant.update({
            where: {
              sessionId_userId: {
                sessionId,
                userId: user.id
              }
            },
            data: {
              hoursCompleted: actualHours,
              completed: !!completed,
              coinsEarned: amount
            }
          });
        } catch (err) {
          console.warn("Failed to update session participant details:", err);
        }
      }

      // 2. Persist coins, streaks, and focus metrics to the User record
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          coins: newCoins,
          totalHours: { increment: totalHoursIncrement },
          currentStreak: newStreak,
          longestStreak: Math.max(dbUser.longestStreak, newStreak),
          streakFreezes: newStreakFreezes,
          lastStudyDate: newLastStudyDate,
        },
        select: { coins: true, currentStreak: true, streakFreezes: true },
      });

      return NextResponse.json({
        success: true,
        coins: updated.coins,
        currentStreak: updated.currentStreak,
        streakFreezes: updated.streakFreezes,
      });
    } catch (dbErr) {
      console.warn("DB coin and streak sync failed:", dbErr);
      return NextResponse.json({ success: false, error: "DB unavailable" }, { status: 503 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Failed to sync coins" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limiter = rateLimit(ip, 10, 60000); // 10 requests per minute
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

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
          freezeCooldownStart: true,
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
          // Award 1 streak freeze for completing a week of streak (7 days) ONLY if they haven't run out of freezes entirely (count > 0)
          if (newStreak % 7 === 0 && newStreakFreezes > 0) {
            newStreakFreezes = Math.min(3, newStreakFreezes + 1);
          }
        } else if (diffDays === 0) {
          // Already studied today, maintain the current streak
          newStreak = dbUser.currentStreak;
        } else {
          // Streak is endangered / broken! (diffDays > 1)
          const daysToFreeze = diffDays - 1;
          if (newStreakFreezes >= daysToFreeze) {
            // We have enough streak freezes to cover the idle period up to yesterday!
            newStreakFreezes -= daysToFreeze;
            // Now, they are studying TODAY, so their new streak continues!
            newStreak = dbUser.currentStreak + 1;
            // Also award weekly streak completion if applicable
            if (newStreak % 7 === 0 && newStreakFreezes > 0) {
              newStreakFreezes = Math.min(3, newStreakFreezes + 1);
            }
          } else {
            // Not enough freezes, streak is broken!
            newStreakFreezes = 0;
            newStreak = 1; // Restart streak at 1 because they are studying today!
          }
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
              coinsEarned: amount,
              leftAt: new Date()
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
          freezeCooldownStart: newStreakFreezes >= 3 ? null : (dbUser.freezeCooldownStart || now),
        },
        select: { coins: true, currentStreak: true, streakFreezes: true, freezeCooldownStart: true },
      });

      return NextResponse.json({
        success: true,
        coins: updated.coins,
        currentStreak: updated.currentStreak,
        streakFreezes: updated.streakFreezes,
        freezeCooldownStart: updated.freezeCooldownStart,
      });
    } catch (dbErr) {
      console.warn("DB coin and streak sync failed:", dbErr);
      return NextResponse.json({ success: false, error: "DB unavailable" }, { status: 503 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Failed to sync coins" }, { status: 500 });
  }
}

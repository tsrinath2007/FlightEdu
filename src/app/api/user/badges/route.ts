import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Seed badges if none exist
    const badgeCount = await prisma.badge.count();
    if (badgeCount === 0) {
      await prisma.badge.createMany({
        data: [
          {
            id: "silk_road",
            name: "Silk Road Scholar",
            description: "Complete 10 study flights to or from Asian destinations.",
            icon: "🕌",
            requirement: "Complete 10 Asian flights",
          },
          {
            id: "transatlantic",
            name: "Transatlantic Grind",
            description: "Complete a continuous cruise session of 8 hours (480 minutes) or more.",
            icon: "🌊",
            requirement: "Single focus session >= 8 hours",
          },
          {
            id: "frequent_flyer",
            name: "Frequent Flyer",
            description: "Maintain an active focus study streak of 7 days or more.",
            icon: "🔥",
            requirement: "Streak >= 7 days",
          },
          {
            id: "around_the_world",
            name: "Around The World",
            description: "Explore the globe by studying in 15 or more unique airports.",
            icon: "🌍",
            requirement: "Explore 15+ unique airports",
          },
          {
            id: "red_eye",
            name: "Red-Eye Warrior",
            description: "Navigate through the dark hours by landing a study run between 00:00 and 05:00 AM.",
            icon: "🦉",
            requirement: "Land flight between 12 AM and 5 AM",
          },
        ],
        skipDuplicates: true,
      });
    }

    // 2. Fetch user flights and details to auto-grant badges
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { currentStreak: true, longestStreak: true },
    });

    const flights = await prisma.sessionParticipant.findMany({
      where: { userId: user.id, completed: true },
      include: { session: true },
    });

    // Calculations
    const uniqueAirports = new Set<string>();
    let asiaRoutesCount = 0;
    let maxFlightDuration = 0;
    let hasRedEye = false;

    const ASIAN_AIRPORTS = new Set([
      "BLR", "DEL", "BOM", "HYD", "MAA", "CCU", "COK", "AMD", "GOI", "PNQ", "TRV", "BDQ", "CCJ", "COB", "GAU", "JAI", "LKO", "NAG", "PAT", "IXC", "IXJ", "SXR",
      "SIN", "BKK", "DMK", "HKT", "CNX", "KUL", "BKI", "PEN", "CGK", "DPS", "SUB", "SGN", "HAN", "DAD", "MNL", "CEB", "RGN", "PNH", "REP", "LPQ", "VTE", "BWN",
      "DXB", "AUH", "SHJ", "DOH", "MCT", "RUH", "JED", "DMM", "MED", "KWI", "BAH", "TLV", "AMM", "BEY", "MCT", "SLL", "THR", "IKA", "BGW", "EBL",
      "CMB", "DAC", "KTM", "MLE", "ISB", "LHE", "KHI", "TAS", "ALA", "NQZ", "FRU", "DYU", "ASB", "KBL",
      "IST", "SAW", "ESB", "AYT", "ADB", "NRT", "HND", "KIX", "ITM", "FUK", "CTS", "NGO", "OKA", "PEK", "PKX", "PVG", "SHA", "CAN", "SZX", "CTU", "KMG", "XIY", "HGH", "WUH", "HKG", "TPE", "TSA", "ICN", "GMP", "PUS", "CJU"
    ]);

    flights.forEach((f) => {
      const s = f.session;
      if (!s) return;

      const origin = s.originCode || "";
      const dest = s.destinationCode || "";
      const duration = s.duration || 0;
      const completedAt = s.completedAt || null;

      if (origin) uniqueAirports.add(origin);
      if (dest) uniqueAirports.add(dest);

      if (ASIAN_AIRPORTS.has(origin) || ASIAN_AIRPORTS.has(dest)) {
        asiaRoutesCount++;
      }

      if (duration > maxFlightDuration) {
        maxFlightDuration = duration;
      }

      if (completedAt) {
        const d = new Date(completedAt);
        const hr = d.getHours();
        if (hr >= 0 && hr <= 5) {
          hasRedEye = true;
        }
      }
    });

    const uniqueAirportsCount = uniqueAirports.size;
    const streak = Math.max(dbUser?.currentStreak || 0, dbUser?.longestStreak || 0);

    // Auto-grant logic
    const earnPromises = [];
    if (asiaRoutesCount >= 10) {
      earnPromises.push(prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: user.id, badgeId: "silk_road" } },
        update: {},
        create: { userId: user.id, badgeId: "silk_road" },
      }));
    }
    if (maxFlightDuration >= 480) {
      earnPromises.push(prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: user.id, badgeId: "transatlantic" } },
        update: {},
        create: { userId: user.id, badgeId: "transatlantic" },
      }));
    }
    if (streak >= 7) {
      earnPromises.push(prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: user.id, badgeId: "frequent_flyer" } },
        update: {},
        create: { userId: user.id, badgeId: "frequent_flyer" },
      }));
    }
    if (uniqueAirportsCount >= 15) {
      earnPromises.push(prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: user.id, badgeId: "around_the_world" } },
        update: {},
        create: { userId: user.id, badgeId: "around_the_world" },
      }));
    }
    if (hasRedEye) {
      earnPromises.push(prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: user.id, badgeId: "red_eye" } },
        update: {},
        create: { userId: user.id, badgeId: "red_eye" },
      }));
    }

    if (earnPromises.length > 0) {
      await Promise.all(earnPromises);
    }

    // 3. Fetch all user badges (including custom database ones)
    const earnedBadges = await prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    });

    return NextResponse.json({ success: true, badges: earnedBadges });
  } catch (err) {
    console.error("Failed to fetch user badges:", err);
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getUserRank } from "@/lib/userRankServer";

const SIMULATED_PILOTS = [
  {
    id: "sim-1",
    name: "Co-Pilot Jessica T.",
    originCode: "JFK",
    destinationCode: "LHR",
    duration: 360,
    elapsed: 145,
    subject: "Distributed Systems & Raft Consensus",
    mode: "HARDCORE",
    avatarUrl: "👩‍✈️",
    isSimulated: true,
  },
  {
    id: "sim-2",
    name: "Captain Emily R.",
    originCode: "NRT",
    destinationCode: "LAX",
    duration: 600,
    elapsed: 320,
    subject: "Organic Chemistry Synthesis",
    mode: "CHILL",
    avatarUrl: "👩‍🔬",
    isSimulated: true,
  },
  {
    id: "sim-3",
    name: "Co-Pilot Liam W.",
    originCode: "DXB",
    destinationCode: "SIN",
    duration: 450,
    elapsed: 80,
    subject: "Advanced Rust Web Frameworks",
    mode: "HARDCORE",
    avatarUrl: "👨‍💻",
    isSimulated: true,
  },
  {
    id: "sim-4",
    name: "Cadet Sophia M.",
    originCode: "CDG",
    destinationCode: "MAD",
    duration: 120,
    elapsed: 45,
    subject: "Aerodynamics & Flight Dynamics",
    mode: "CHILL",
    avatarUrl: "👩‍🎓",
    isSimulated: true,
  }
];

const SIMULATED_LEADERBOARD = [
  { userId: "sim-lb-1", name: "Captain Emily R.", avatarUrl: "👩‍🔬", totalHours: 42.5, completedFlights: 12 },
  { userId: "sim-lb-2", name: "Co-Pilot Jessica T.", avatarUrl: "👩‍✈️", totalHours: 35.0, completedFlights: 8 },
  { userId: "sim-lb-3", name: "Co-Pilot Liam W.", avatarUrl: "👨‍💻", totalHours: 28.2, completedFlights: 7 },
];

const SIMULATED_LOGS = [
  {
    id: "sim-log-1",
    name: "Captain Emily R.",
    avatarUrl: "👩‍🔬",
    flightLog: "Cruising through physical chemistry lecture notes. Trying to model molecular orbitals.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "sim-log-2",
    name: "Co-Pilot Jessica T.",
    avatarUrl: "👩‍✈️",
    flightLog: "Prepping for AWS Certified Solutions Architect. 3 flights scheduled today!",
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "sim-log-3",
    name: "Cadet Sophia M.",
    avatarUrl: "👩‍🎓",
    flightLog: "Studying aerodynamics equations for the upcoming midterms. Lift and drag coefficients are tricky.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  }
];

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get rank details
    const { rankInfo, completedFlightsCount, totalHours, uniqueAirportsCount } = await getUserRank(user.id);
    const isGated = rankInfo.name === "Student Pilot" || rankInfo.name === "Cadet";

    // Calculate requirements metrics for locked door view
    const flightsRemaining = Math.max(0, 30 - completedFlightsCount);
    const hoursRemaining = Math.max(0, 45 - totalHours);

    if (isGated) {
      return NextResponse.json({
        gated: true,
        currentRank: rankInfo.name,
        flightsRemaining,
        hoursRemaining,
        completedFlightsCount,
        totalHours,
      }, { status: 403 });
    }

    // 2. Fetch Active Flight Deck Presence
    const activeSessions = await prisma.session.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                pilotId: true,
                avatarUrl: true,
                studyTime: true,
              }
            }
          }
        }
      }
    });

    const activePresence: any[] = [];
    activeSessions.forEach((s) => {
      const started = s.startedAt ? new Date(s.startedAt).getTime() : Date.now();
      const elapsedMins = Math.floor((Date.now() - started) / (1000 * 60));
      
      s.participants.forEach((p) => {
        if (p.user) {
          activePresence.push({
            id: p.id,
            name: p.user.name || p.user.pilotId || "Focus Cadet",
            originCode: s.originCode,
            destinationCode: s.destinationCode,
            duration: s.duration,
            elapsed: Math.min(s.duration, elapsedMins),
            subject: p.user.studyTime || "Focus Cruise",
            mode: s.mode,
            avatarUrl: p.user.avatarUrl || "✈️",
            isSimulated: false,
          });
        }
      });
    });

    // Merge simulated active pilots to keep the Lounge active if there's low user activity
    const combinedPresence = [...activePresence];
    SIMULATED_PILOTS.forEach((sim) => {
      if (combinedPresence.length < 5) {
        combinedPresence.push(sim);
      }
    });

    // 3. Fetch Weekly Leaderboard
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyParticipants = await prisma.sessionParticipant.findMany({
      where: {
        completed: true,
        session: {
          completedAt: {
            gte: sevenDaysAgo,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            pilotId: true,
            avatarUrl: true,
          },
        },
        session: {
          select: {
            duration: true,
          },
        },
      },
    });

    const leaderboardMap = new Map<string, {
      userId: string;
      name: string;
      avatarUrl: string;
      totalHours: number;
      completedFlights: number;
    }>();

    weeklyParticipants.forEach((p) => {
      if (!p.user) return;
      const existing = leaderboardMap.get(p.userId);
      const hours = p.hoursCompleted || (p.session ? p.session.duration / 60 : 0);
      if (existing) {
        existing.totalHours += hours;
        existing.completedFlights += 1;
      } else {
        leaderboardMap.set(p.userId, {
          userId: p.userId,
          name: p.user.name || p.user.pilotId || "Focus Pilot",
          avatarUrl: p.user.avatarUrl || "✈️",
          totalHours: hours,
          completedFlights: 1,
        });
      }
    });

    const weeklyLeaderboard = Array.from(leaderboardMap.values())
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 10);

    // Merge with simulated leaderboard entries if low count
    const combinedLeaderboard = [...weeklyLeaderboard];
    SIMULATED_LEADERBOARD.forEach((sim) => {
      if (combinedLeaderboard.length < 5 && !combinedLeaderboard.some(x => x.name === sim.name)) {
        combinedLeaderboard.push(sim);
      }
    });
    combinedLeaderboard.sort((a, b) => b.totalHours - a.totalHours);

    // 4. Fetch Flight Logs Feed
    const logs = await prisma.user.findMany({
      where: {
        AND: [
          { flightLog: { not: null } },
          { flightLog: { not: "" } },
        ],
      },
      select: {
        id: true,
        name: true,
        pilotId: true,
        avatarUrl: true,
        flightLog: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 15,
    });

    const combinedLogs = [...logs.map(l => ({
      id: l.id,
      name: l.name || l.pilotId || "Focus Pilot",
      avatarUrl: l.avatarUrl || "✈️",
      flightLog: l.flightLog,
      updatedAt: l.updatedAt.toISOString(),
    }))];

    SIMULATED_LOGS.forEach((sim) => {
      if (combinedLogs.length < 6) {
        combinedLogs.push(sim);
      }
    });
    combinedLogs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({
      success: true,
      gated: false,
      currentRank: rankInfo.name,
      completedFlightsCount,
      totalHours,
      activePresence: combinedPresence,
      weeklyLeaderboard: combinedLeaderboard,
      flightLogs: combinedLogs,
    });
  } catch (err) {
    console.error("Lounge API GET failed:", err);
    return NextResponse.json({ error: "Failed to load lounge dashboard" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rank
    const { rankInfo } = await getUserRank(user.id);
    const isGated = rankInfo.name === "Student Pilot" || rankInfo.name === "Cadet";
    if (isGated) {
      return NextResponse.json({ error: "Lounge access is gated. Reach Co-Pilot rank first." }, { status: 403 });
    }

    const { log } = await req.json();
    if (!log || typeof log !== "string") {
      return NextResponse.json({ error: "Invalid log content" }, { status: 400 });
    }

    const trimmedLog = log.trim();
    if (trimmedLog.length === 0 || trimmedLog.length > 200) {
      return NextResponse.json({ error: "Log must be between 1 and 200 characters" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        flightLog: trimmedLog,
      },
    });

    return NextResponse.json({ success: true, log: trimmedLog });
  } catch (err) {
    console.error("Lounge API POST failed:", err);
    return NextResponse.json({ error: "Failed to post flight log" }, { status: 500 });
  }
}

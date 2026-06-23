import { prisma } from "@/lib/prisma";
import { computePilotRank } from "@/lib/pilotRank";

export async function getUserRank(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalHours: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Count completed flights
  const completedFlightsCount = await prisma.sessionParticipant.count({
    where: {
      userId,
      completed: true,
    },
  });

  // Calculate unique airports from completed sessions
  const participants = await prisma.sessionParticipant.findMany({
    where: {
      userId,
      completed: true,
    },
    include: {
      session: {
        select: {
          originCode: true,
          destinationCode: true,
        },
      },
    },
  });

  const uniqueAirports = new Set<string>();
  participants.forEach((p) => {
    if (p.session?.originCode) uniqueAirports.add(p.session.originCode);
    if (p.session?.destinationCode) uniqueAirports.add(p.session.destinationCode);
  });

  const uniqueAirportsCount = uniqueAirports.size;
  const totalHours = user.totalHours;

  const rankInfo = computePilotRank(completedFlightsCount, totalHours, uniqueAirportsCount);

  return {
    rankInfo,
    completedFlightsCount,
    totalHours,
    uniqueAirportsCount,
  };
}

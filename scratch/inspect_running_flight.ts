import { prisma } from "../src/lib/prisma";

async function inspect() {
  if (!prisma) {
    console.error("Prisma is not initialized.");
    return;
  }
  try {
    console.log("--- Searching for ACTIVE Sessions ---");
    const activeSessions = await prisma.session.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });
    console.log(JSON.stringify(activeSessions, null, 2));

    console.log("\n--- Searching for WAITING Sessions ---");
    const waitingSessions = await prisma.session.findMany({
      where: {
        status: "WAITING",
      },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });
    console.log(`Found ${waitingSessions.length} waiting sessions.`);

  } catch (err) {
    console.error("Prisma query failed:", err);
  }
}

inspect();

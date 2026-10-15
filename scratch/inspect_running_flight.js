const { PrismaClient } = require('../src/generated/prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  try {
    console.log("--- Users ---");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        pilotId: true,
        onboarded: true,
      }
    });
    console.log(JSON.stringify(users, null, 2));

    console.log("\n--- Active Sessions & Participants ---");
    const sessions = await prisma.session.findMany({
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                pilotId: true,
              }
            }
          }
        }
      }
    });
    console.log(JSON.stringify(sessions, null, 2));

  } catch (err) {
    console.error("Prisma query failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

inspect();

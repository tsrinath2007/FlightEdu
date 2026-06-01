const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.session.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log("RECENT SESSIONS:\n", JSON.stringify(sessions, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

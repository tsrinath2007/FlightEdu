import fs from "fs";
import path from "path";

// Manually load .env variables
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envFileContent = fs.readFileSync(envPath, "utf-8");
  envFileContent.split("\n").forEach((line) => {
    const matched = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
    if (matched) {
      const key = matched[1];
      let val = matched[2] || "";
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val.trim();
    }
  });
}

const publicProfileSelection = {
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
  totalHours: true,
  currentStreak: true,
  longestStreak: true,
  badges: {
    include: {
      badge: true,
    },
  },
  sessionParticipants: {
    where: { completed: true },
    select: {
      session: {
        select: {
          originCode: true,
          destinationCode: true,
          duration: true,
          completedAt: true,
        }
      }
    }
  }
};

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const pilotIdOrId = "tsrinath";
  
  const profileUser = await prisma.user.findFirst({
    where: {
      OR: [
        { pilotId: pilotIdOrId },
        { id: pilotIdOrId },
      ],
    },
    select: publicProfileSelection,
  });

  console.log("QUERY RESULT:");
  console.log(JSON.stringify(profileUser, null, 2));
}

main().catch(console.error);

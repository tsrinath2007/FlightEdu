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

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      participants: {
        include: {
          user: true
        }
      }
    }
  });

  console.log("LAST 5 SESSIONS:");
  console.log(JSON.stringify(sessions, null, 2));
}

main().catch(console.error);

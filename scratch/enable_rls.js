const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Manually load .env variables
const envPath = path.resolve(process.cwd(), ".env");
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
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ Error: DIRECT_URL / DATABASE_URL is not configured in .env file.");
    process.exit(1);
  }

  console.log("Connecting to PostgreSQL database...");
  const client = new Client({ connectionString });
  await client.connect();
  console.log("Connected successfully!");

  const tables = [
    "User",
    "Session",
    "SessionParticipant",
    "Transaction",
    "LeaderboardEntry",
    "Badge",
    "UserBadge",
    "Friendship",
    "ChatMessage"
  ];

  console.log("Enabling Row Level Security (RLS) on all public tables...");

  for (const table of tables) {
    try {
      await client.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✅ Successfully enabled RLS on table: "${table}"`);
    } catch (error) {
      console.error(`❌ Failed to enable RLS on table: "${table}":`, error.message);
    }
  }

  await client.end();
  console.log("RLS activation process completed!");
}

main().catch(console.error);

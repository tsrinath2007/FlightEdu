const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Load env
const envPath = path.join(process.cwd(), ".env");
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

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

async function main() {
  if (!connectionString) {
    console.error("No database URL.");
    return;
  }
  const client = new Client({ connectionString });
  await client.connect();

  console.log("--- 1. Users who have pilotId but are marked onboarded=false ---");
  const res1 = await client.query('SELECT id, email, name, "pilotId", onboarded, coins, "createdAt" FROM "User" WHERE "pilotId" IS NOT NULL AND onboarded = false;');
  console.log(JSON.stringify(res1.rows, null, 2));

  console.log("\n--- 2. Duplicate pilotId counts ---");
  const res2 = await client.query('SELECT "pilotId", COUNT(*) FROM "User" WHERE "pilotId" IS NOT NULL GROUP BY "pilotId" HAVING COUNT(*) > 1;');
  console.log(JSON.stringify(res2.rows, null, 2));

  console.log("\n--- 3. Total users and count of onboarded vs not ---");
  const res3 = await client.query('SELECT onboarded, COUNT(*) FROM "User" GROUP BY onboarded;');
  console.log(JSON.stringify(res3.rows, null, 2));

  await client.end();
}

main().catch(console.error);

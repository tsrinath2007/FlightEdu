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
  const client = new Client({ connectionString });
  await client.connect();

  console.log("Updating Vince's onboarding status...");
  const res = await client.query('UPDATE "User" SET onboarded = true WHERE email = \'vancampvince2013@gmail.com\' RETURNING id, email, onboarded;');
  console.log("Updated row:", JSON.stringify(res.rows[0], null, 2));

  await client.end();
}

main().catch(console.error);

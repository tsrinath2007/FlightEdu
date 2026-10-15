const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env");
let dbUrl = "";
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("DATABASE_URL=")) {
      dbUrl = trimmed.substring("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
    }
  });
}

async function main() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  const res = await client.query("SELECT id, email, created_at, confirmed_at FROM auth.users WHERE email = $1", ["gofocusgen@gmail.com"]);
  console.log("USERS MATCHING gofocusgen@gmail.com:", res.rows);
  await client.end();
}

main().catch(console.error);

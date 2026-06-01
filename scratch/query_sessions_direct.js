require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!connectionString) {
    console.error("No DATABASE_URL or DIRECT_URL found in process.env");
    return;
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const res = await client.query("SELECT id FROM \"Session\" WHERE id LIKE 'cmpnnt%';");
    console.log("MATCHING SESSIONS:");
    console.log(res.rows.map(r => r.id));
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await client.end();
  }
}

main();

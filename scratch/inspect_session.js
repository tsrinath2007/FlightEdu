require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const res = await client.query("SELECT * FROM \"Session\" WHERE id = 'cmppxam6b000004l4ryo1x0uy';");
    console.log("SESSION:");
    console.log(JSON.stringify(res.rows[0], null, 2));

    const res2 = await client.query("SELECT * FROM \"SessionParticipant\" WHERE \"sessionId\" = 'cmppxam6b000004l4ryo1x0uy';");
    console.log("PARTICIPANTS:");
    console.log(JSON.stringify(res2.rows, null, 2));
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await client.end();
  }
}

main();

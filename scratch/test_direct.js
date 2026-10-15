const { Client } = require("pg");
const connectionString = "postgresql://postgres.lfmuizngwtdhsfaoffyk:AXUKZzUlNX3yO1Z6@db.lfmuizngwtdhsfaoffyk.supabase.co:5432/postgres";

async function main() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected directly to database!");
    const res = await client.query("SELECT COUNT(*) FROM \"User\";");
    console.log("User count:", res.rows[0].count);
  } catch (err) {
    console.error("Direct connection failed:", err);
  } finally {
    await client.end();
  }
}
main();

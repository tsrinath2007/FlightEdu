require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const pilotId = process.argv[2] || 'tsrinath';
  const amount = 2500;
  
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL or DIRECT_URL is not set in your .env file!");
    process.exit(1);
  }

  console.log(`Connecting to database for pilot: "${pilotId}"...`);
  const client = new Client({ connectionString });
  await client.connect();

  try {
    // 1. Fetch user by pilotId to get their raw internal ID
    const userRes = await client.query('SELECT id, coins FROM "User" WHERE "pilotId" = $1;', [pilotId]);
    if (userRes.rows.length === 0) {
      console.error(`Error: User with pilotId "${pilotId}" not found in database!`);
      return;
    }

    const dbUser = userRes.rows[0];
    const userId = dbUser.id;
    const currentCoins = dbUser.coins || 0;
    const newCoins = currentCoins + amount;

    console.log(`Found User: ${userId} with current balance: ${currentCoins} coins.`);

    // 2. Start transaction block
    await client.query('BEGIN;');

    // 3. Update User coins and set receivedWelcomeBonus to true
    await client.query('UPDATE "User" SET coins = $1, "receivedWelcomeBonus" = true WHERE id = $2;', [newCoins, userId]);

    // 4. Insert welcome transaction entry with exact multi-line formatting and emojis
    const welcomeMessage = `yo 👋

welcome to the fam 🚀

you’ve just unlocked a **₹2500 welcome bonus** 💸 — use it anywhere on the site (yeah, go crazy 😎)

explore, book, try stuff… it’s all yours 🔥

got questions or stuck somewhere?
just drop us a mail ✉️ — we got you

let’s make this fun 🫶`;

    const txId = `welcome-${Math.random().toString(36).substring(2, 15)}`;
    await client.query(
      'INSERT INTO "Transaction" (id, "userId", amount, reason, "createdAt") VALUES ($1, $2, $3, $4, NOW());',
      [txId, userId, amount, welcomeMessage]
    );

    // 5. Commit transaction
    await client.query('COMMIT;');

    console.log(`\n🎉 Success! Added 2500 coins to pilot "${pilotId}".`);
    console.log(`New balance: ${newCoins} coins.`);
    console.log(`Added historic transaction log with ID: ${txId}.`);

  } catch (err) {
    await client.query('ROLLBACK;');
    console.error("Failed to execute welcome bonus transaction:", err);
  } finally {
    await client.end();
  }
}

main();

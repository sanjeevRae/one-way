/**
 * Create (or reset) an admin user in the admin_users table.
 *
 * Usage (run on the server, from the project root with .env present):
 *   node scripts/create-admin.js <username> <password>
 *
 * Example:
 *   node scripts/create-admin.js admin 'My$ecurepass123!'
 *
 * The password is hashed with scrypt and stored as `scrypt$<salt>$<hash>`.
 * The insert/update uses a parameterized query (SQL-injection safe).
 */

const crypto = require("crypto");

// Load ./.env so DATABASE_* are available (best effort).
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch {
    // .env not present — rely on exported env vars.
  }
}

const [, , username, password] = process.argv;

if (!username || !password) {
  console.error("Usage: node scripts/create-admin.js <username> <password>");
  process.exit(1);
}

const host = process.env.DATABASE_HOST;
const user = process.env.DATABASE_USER;
if (!host || !user) {
  console.error("Database is not configured (DATABASE_HOST / DATABASE_USER missing).");
  process.exit(1);
}

// scrypt hash — must match the scheme used by src/lib/auth.ts.
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 };
const KEYLEN = 32;
const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, KEYLEN, SCRYPT_OPTS).toString("hex");
const passwordHash = `scrypt$${salt}$${hash}`;

(async () => {
  const mysql = require("mysql2/promise");
  const conn = await mysql.createConnection({
    host,
    user,
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
  });

  try {
    // Parameterized: no user input is ever concatenated into SQL.
    await conn.execute(
      "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
      [username, passwordHash]
    );
    console.log(`Created admin user "${username}".`);
  } catch (err) {
    // Duplicate key → reset the existing account's password.
    if (/duplicate|ER_DUP_ENTRY/i.test(String(err))) {
      await conn.execute(
        "UPDATE admin_users SET password_hash = ? WHERE username = ?",
        [passwordHash, username]
      );
      console.log(`Updated existing admin user "${username}" password.`);
    } else {
      throw err;
    }
  } finally {
    await conn.end();
  }
})().catch((err) => {
  console.error("Failed to create admin user:", err);
  process.exit(1);
});
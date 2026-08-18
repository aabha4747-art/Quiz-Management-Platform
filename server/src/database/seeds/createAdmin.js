require("dotenv").config();

const bcrypt = require("bcrypt");
const { pool } = require("../../config/db");

const createAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in .env"
    );
  }

  if (ADMIN_PASSWORD.length < 8) {
    throw new Error("Admin password must contain at least 8 characters");
  }

  const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();

  const existingUser = await pool.query(
    "SELECT id, email, role FROM users WHERE email = $1",
    [normalizedEmail]
  );

  if (existingUser.rowCount > 0) {
    console.log(`User already exists: ${normalizedEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const result = await pool.query(
    `
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES ($1, $2, $3, 'ADMIN', 'ACTIVE')
      RETURNING id, name, email, role, status, created_at
    `,
    [ADMIN_NAME.trim(), normalizedEmail, passwordHash]
  );

  console.log("Admin account created:");
  console.table(result.rows);
};

createAdmin()
  .catch((error) => {
    console.error("Failed to create Admin account:");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
require("dotenv").config();

const bcrypt = require("bcrypt");
const { pool } = require("../../config/db");

const resetAdminPassword = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  if (password.length < 8) {
    throw new Error("Admin password must contain at least 8 characters");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `
      UPDATE users
      SET password_hash = $1,
          updated_at = NOW()
      WHERE email = $2
        AND role = 'ADMIN'
      RETURNING id, name, email, role, status
    `,
    [passwordHash, email]
  );

  if (result.rowCount === 0) {
    throw new Error("Admin account not found");
  }

  console.log("Admin password updated successfully");
  console.table(result.rows);
};

resetAdminPassword()
  .catch((error) => {
    console.error("Failed to reset Admin password:");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
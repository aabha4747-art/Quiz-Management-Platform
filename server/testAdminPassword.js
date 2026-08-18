require("dotenv").config();

const bcrypt = require("bcrypt");
const { pool } = require("./src/config/db");

const testPassword = async () => {
  try {
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    const result = await pool.query(
      "SELECT email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      console.log("Admin user not found");
      return;
    }

    const matches = await bcrypt.compare(
      password,
      result.rows[0].password_hash
    );

    console.log("Email found:", result.rows[0].email);
    console.log("Password matches stored hash:", matches);
  } catch (error) {
    console.error(error.message);
  } finally {
    await pool.end();
  }
};

testPassword();
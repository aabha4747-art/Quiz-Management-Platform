const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error);
  process.exit(1);
});

const connectDatabase = async () => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT current_database() AS database, NOW() AS connected_at"
    );

    console.log(
      `PostgreSQL connected to database: ${result.rows[0].database}`
    );
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  connectDatabase,
};
require("dotenv").config();

const app = require("./app");
const { connectDatabase } = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
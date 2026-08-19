const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const { pool } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const quizRoutes = require("./routes/quizRoutes");
const questionRoutes = require("./routes/questionRoutes");
const attemptRoutes = require("./routes/attemptRoutes");
const studentRoutes = require("./routes/studentRoutes");
const studentProfileRoutes = require("./routes/studentProfileRoutes");
const userRoutes = require("./routes/userRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const certificateRoutes = require("./routes/certificateRoutes");

const {
  apiLimiter,
  authLimiter,
  quizAttemptLimiter,
} = require("./middleware/rateLimitMiddleware");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();
app.set("trust proxy", 1);

/* =========================================================
   SECURITY
========================================================= */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy:
        "cross-origin",
    },
  })
);

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://quiz-management-frontend-tbmj.onrender.com",
  "https://quiz-management-platform-drab.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    credentials: true,
  })
);

/* =========================================================
   BODY PARSERS
========================================================= */

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =========================================================
   STATIC UPLOADS
========================================================= */

app.use(
  "/uploads",
  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);

/* =========================================================
   LOGGING
========================================================= */

app.use(
  morgan("dev")
);

/* =========================================================
   HEALTH
========================================================= */

app.get(
  "/api/health",
  (req, res) => {
    return res
      .status(200)
      .json({
        success: true,

        message:
          "Quiz Platform API is running",
      });
  }
);

app.get(
  "/api/health/database",
  async (
    req,
    res
  ) => {
    try {
      const result =
        await pool.query(
          `
            SELECT
              current_database()
                AS database,

              NOW()
                AS server_time
          `
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "PostgreSQL connection is working",

          database:
            result.rows[0]
              .database,

          serverTime:
            result.rows[0]
              .server_time,
        });
    } catch (error) {
      console.error(
        "Database health check error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "PostgreSQL connection failed",
        });
    }
  }
);

/* =========================================================
   API LIMITER
========================================================= */

app.use(
  "/api",
  apiLimiter
);

/* =========================================================
   AUTH
========================================================= */

app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

/* =========================================================
   ADMIN
========================================================= */

app.use(
  "/api/admin",
  adminRoutes
);

/* =========================================================
   CATEGORIES
========================================================= */

app.use(
  "/api/categories",
  categoryRoutes
);

/* =========================================================
   QUIZZES
========================================================= */

app.use(
  "/api/quizzes",
  quizRoutes
);

/* =========================================================
   QUESTIONS
========================================================= */

app.use(
  "/api",
  questionRoutes
);

/* =========================================================
   ATTEMPTS
========================================================= */

app.use(
  "/api",
  quizAttemptLimiter,
  attemptRoutes
);

/* =========================================================
   STUDENT
========================================================= */

app.use(
  "/api/student",
  studentRoutes
);

app.use(
  "/api/student",
  studentProfileRoutes
);

/* =========================================================
   USERS
========================================================= */

app.use(
  "/api/users",
  userRoutes
);

/* =========================================================
   LEADERBOARD
========================================================= */

app.use(
  "/api/leaderboard",
  leaderboardRoutes
);

/* =========================================================
   CERTIFICATES
========================================================= */

app.use(
  "/api/certificates",
  certificateRoutes
);

/* =========================================================
   404
========================================================= */

app.use(
  notFound
);

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  errorHandler
);

module.exports = app;
const rateLimit = require("express-rate-limit");

const isDevelopment =
  process.env.NODE_ENV === "development";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  // High limit while developing, safer limit in production.
  max: isDevelopment ? 5000 : 300,

  standardHeaders: true,
  legacyHeaders: false,

  skip: (req) => {
    // Do not rate-limit health checks.
    return req.path.startsWith("/api/health");
  },

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  // Authentication remains stricter than normal API traffic.
  max: isDevelopment ? 500 : 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

const quizAttemptLimiter = rateLimit({
  windowMs: 60 * 1000,

  // Allows repeated testing without removing protection entirely.
  max: isDevelopment ? 500 : 30,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many quiz requests. Please wait briefly and try again.",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  quizAttemptLimiter,
};
const express = require("express");
const { query } = require("express-validator");

const {
  getLeaderboard,
} = require("../controllers/leaderboardController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const validateRequest = require(
  "../middleware/validationMiddleware"
);

const router = express.Router();

/* =========================================================
   LEADERBOARD
========================================================= */

router.get(
  "/",

  authenticate,

  [
    query("categoryId")
      .optional()
      .isInt({ min: 1 })
      .withMessage(
        "Category ID must be a positive integer"
      ),

    query("period")
      .optional()
      .isIn([
        "all",
        "weekly",
        "monthly",
      ])
      .withMessage(
        "Period must be all, weekly, or monthly"
      ),

    query("search")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage(
        "Search text cannot exceed 200 characters"
      ),

    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage(
        "Page must be a positive integer"
      ),

    query("limit")
      .optional()
      .isInt({
        min: 1,
        max: 100,
      })
      .withMessage(
        "Limit must be between 1 and 100"
      ),
  ],

  validateRequest,

  getLeaderboard
);

module.exports = router;
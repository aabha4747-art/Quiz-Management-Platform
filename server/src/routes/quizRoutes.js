const express = require("express");
const { body, param, query } = require("express-validator");

const {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  changeQuizStatus,
} = require("../controllers/quizController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const validateRequest = require("../middleware/validationMiddleware");

const router = express.Router();

const quizBodyValidation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Quiz title must contain between 3 and 200 characters"),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 3000 })
    .withMessage("Description cannot exceed 3000 characters"),

  body("categoryId")
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer"),

  body("difficulty")
    .isIn(["EASY", "MEDIUM", "HARD"])
    .withMessage("Difficulty must be EASY, MEDIUM, or HARD"),

  body("durationMinutes")
    .isInt({ min: 1, max: 300 })
    .withMessage("Duration must be between 1 and 300 minutes"),

  body("passingPercentage")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Passing percentage must be between 0 and 100"),

  body("maxAttempts")
    .isInt({ min: 1, max: 100 })
    .withMessage("Maximum attempts must be between 1 and 100"),

  body("thumbnailUrl")
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage("Thumbnail URL must be valid"),
];


router.get(
  "/",
  authenticate,
  [
    query("categoryId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Category ID must be a positive integer"),

    query("difficulty")
      .optional()
      .isIn(["EASY", "MEDIUM", "HARD"])
      .withMessage("Difficulty must be EASY, MEDIUM, or HARD"),

    query("search")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Search text cannot exceed 200 characters"),
  ],
  validateRequest,
  getQuizzes
);

router.get(
  "/:id",
  authenticate,
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Quiz ID must be a positive integer"),
  ],
  validateRequest,
  getQuizById
);

router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  quizBodyValidation,
  validateRequest,
  createQuiz
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Quiz ID must be a positive integer"),
    ...quizBodyValidation,
  ],
  validateRequest,
  updateQuiz
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("ADMIN"),
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Quiz ID must be a positive integer"),

    body("status")
      .isIn(["DRAFT", "PUBLISHED", "UNPUBLISHED"])
      .withMessage(
        "Status must be DRAFT, PUBLISHED, or UNPUBLISHED"
      ),
  ],
  validateRequest,
  changeQuizStatus
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Quiz ID must be a positive integer"),
  ],
  validateRequest,
  deleteQuiz
);

module.exports = router;
const express = require("express");
const { body, param } = require("express-validator");

const {
  getQuestionsByQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const validateRequest = require("../middleware/validationMiddleware");

const router = express.Router();

const questionValidation = [
  body("questionText")
    .trim()
    .isLength({ min: 5, max: 3000 })
    .withMessage(
      "Question text must contain between 5 and 3000 characters"
    ),

  body("marks")
    .isFloat({ min: 0.01, max: 1000 })
    .withMessage("Marks must be between 0.01 and 1000"),

  body("explanation")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 3000 })
    .withMessage("Explanation cannot exceed 3000 characters"),

  body("difficulty")
    .isIn(["EASY", "MEDIUM", "HARD"])
    .withMessage("Difficulty must be EASY, MEDIUM, or HARD"),

  body("position")
    .isInt({ min: 1 })
    .withMessage("Position must be a positive integer"),

  body("options")
    .isArray({ min: 2, max: 8 })
    .withMessage("A question must contain between 2 and 8 options"),

  body("options.*.optionText")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Each option must contain valid text"),

  body("options.*.isCorrect")
    .isBoolean()
    .withMessage("Each option must contain a Boolean isCorrect value"),
];

router.get(
  "/quizzes/:quizId/questions",
  authenticate,
  authorizeRoles("ADMIN"),
  [
    param("quizId")
      .isInt({ min: 1 })
      .withMessage("Quiz ID must be a positive integer"),
  ],
  validateRequest,
  getQuestionsByQuiz
);

router.post(
  "/quizzes/:quizId/questions",
  authenticate,
  authorizeRoles("ADMIN"),
  [
    param("quizId")
      .isInt({ min: 1 })
      .withMessage("Quiz ID must be a positive integer"),
    ...questionValidation,
  ],
  validateRequest,
  createQuestion
);

router.put(
  "/questions/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Question ID must be a positive integer"),
    ...questionValidation,
  ],
  validateRequest,
  updateQuestion
);

router.delete(
  "/questions/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Question ID must be a positive integer"),
  ],
  validateRequest,
  deleteQuestion
);

module.exports = router;
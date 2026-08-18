const express =
  require("express");

const {
  body,
  param,
} = require(
  "express-validator"
);

const {
  startQuiz,
  submitQuiz,
  saveAttemptAnswer,
  getMyAttempts,
  getMyAttemptById,
} = require(
  "../controllers/attemptController"
);

const {
  authenticate,
  authorizeRoles,
} = require(
  "../middleware/authMiddleware"
);

const validateRequest =
  require(
    "../middleware/validationMiddleware"
  );

const router =
  express.Router();

/* =========================================================
   GET MY ATTEMPTS
========================================================= */

router.get(
  "/attempts",

  authenticate,

  authorizeRoles(
    "STUDENT"
  ),

  getMyAttempts
);

/* =========================================================
   GET ATTEMPT
========================================================= */

router.get(
  "/attempts/:id",

  authenticate,

  authorizeRoles(
    "STUDENT"
  ),

  [
    param("id")
      .isInt({
        min: 1,
      })
      .withMessage(
        "Attempt ID must be a positive integer"
      ),
  ],

  validateRequest,

  getMyAttemptById
);

/* =========================================================
   AUTO-SAVE ANSWER
========================================================= */

router.put(
  "/attempts/:id/answer",

  authenticate,

  authorizeRoles(
    "STUDENT"
  ),

  [
    param("id")
      .isInt({
        min: 1,
      })
      .withMessage(
        "Attempt ID must be a positive integer"
      ),

    body("questionId")
      .isInt({
        min: 1,
      })
      .withMessage(
        "Question ID must be a positive integer"
      ),

    body(
      "selectedOptionId"
    )
      .isInt({
        min: 1,
      })
      .withMessage(
        "Selected option ID must be a positive integer"
      ),
  ],

  validateRequest,

  saveAttemptAnswer
);

/* =========================================================
   START QUIZ
========================================================= */

router.post(
  "/quizzes/:quizId/start",

  authenticate,

  authorizeRoles(
    "STUDENT"
  ),

  [
    param("quizId")
      .isInt({
        min: 1,
      })
      .withMessage(
        "Quiz ID must be a positive integer"
      ),
  ],

  validateRequest,

  startQuiz
);

/* =========================================================
   SUBMIT QUIZ
========================================================= */

router.post(
  "/quizzes/:quizId/submit",

  authenticate,

  authorizeRoles(
    "STUDENT"
  ),

  [
    param("quizId")
      .isInt({
        min: 1,
      })
      .withMessage(
        "Quiz ID must be a positive integer"
      ),

    body("attemptId")
      .isInt({
        min: 1,
      })
      .withMessage(
        "Attempt ID must be a positive integer"
      ),

    body("answers")
      .isArray()
      .withMessage(
        "Answers must be an array"
      ),

    body(
      "answers.*.questionId"
    )
      .isInt({
        min: 1,
      })
      .withMessage(
        "Every answer must contain a valid question ID"
      ),

    body(
      "answers.*.selectedOptionId"
    )
      .optional({
        nullable: true,
      })
      .isInt({
        min: 1,
      })
      .withMessage(
        "Selected option ID must be a positive integer"
      ),
  ],

  validateRequest,

  submitQuiz
);

module.exports =
  router;
const express = require("express");
const { body } = require("express-validator");

const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controllers/authController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const validateRequest = require(
  "../middleware/validationMiddleware"
);

const router = express.Router();

router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage(
        "Name must contain between 2 and 100 characters"
      ),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email address")
      .normalizeEmail(),

    body("password")
      .isLength({ min: 8 })
      .withMessage(
        "Password must contain at least 8 characters"
      ),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email address")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  validateRequest,
  login
);

router.get(
  "/me",
  authenticate,
  getCurrentUser
);

router.patch(
  "/profile",
  authenticate,
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage(
        "Name must contain between 2 and 100 characters"
      ),
  ],
  validateRequest,
  updateProfile
);

router.patch(
  "/password",
  authenticate,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),

    body("newPassword")
      .isLength({ min: 8 })
      .withMessage(
        "New password must contain at least 8 characters"
      )
      .matches(/[A-Z]/)
      .withMessage(
        "New password must contain at least one uppercase letter"
      )
      .matches(/[a-z]/)
      .withMessage(
        "New password must contain at least one lowercase letter"
      )
      .matches(/[0-9]/)
      .withMessage(
        "New password must contain at least one number"
      ),
  ],
  validateRequest,
  changePassword
);

router.post(
  "/forgot-password",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email address")
      .normalizeEmail(),
  ],
  validateRequest,
  forgotPassword
);

router.post(
  "/reset-password",
  [
    body("token")
      .trim()
      .notEmpty()
      .withMessage("Reset token is required"),

    body("newPassword")
      .isLength({ min: 8 })
      .withMessage(
        "New password must contain at least 8 characters"
      )
      .matches(/[A-Z]/)
      .withMessage(
        "New password must contain at least one uppercase letter"
      )
      .matches(/[a-z]/)
      .withMessage(
        "New password must contain at least one lowercase letter"
      )
      .matches(/[0-9]/)
      .withMessage(
        "New password must contain at least one number"
      ),
  ],
  validateRequest,
  resetPassword
);

router.post(
  "/logout",
  authenticate,
  logout
);

module.exports = router;
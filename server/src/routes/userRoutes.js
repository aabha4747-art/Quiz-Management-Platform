const express = require("express");
const { body, param, query } = require("express-validator");

const {
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
} = require("../controllers/userController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const validateRequest = require("../middleware/validationMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  [
    query("search")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Search text cannot exceed 200 characters"),

    query("status")
      .optional()
      .isIn(["ACTIVE", "INACTIVE"])
      .withMessage("Status must be ACTIVE or INACTIVE"),
  ],
  validateRequest,
  getUsers
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("User ID must be a positive integer"),
  ],
  validateRequest,
  getUserById
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("ADMIN"),
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("User ID must be a positive integer"),

    body("status")
      .isIn(["ACTIVE", "INACTIVE"])
      .withMessage("Status must be ACTIVE or INACTIVE"),
  ],
  validateRequest,
  updateUserStatus
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("User ID must be a positive integer"),
  ],
  validateRequest,
  deleteUser
);

module.exports = router;
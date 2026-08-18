const express = require("express");
const { body, param } = require("express-validator");

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const validateRequest = require("../middleware/validationMiddleware");

const router = express.Router();

const categoryIdValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer"),
];

const categoryBodyValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must contain between 2 and 100 characters"),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
];

router.get(
  "/",
  authenticate,
  getCategories
);

router.get(
  "/:id",
  authenticate,
  categoryIdValidation,
  validateRequest,
  getCategoryById
);

router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  categoryBodyValidation,
  validateRequest,
  createCategory
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  categoryIdValidation,
  categoryBodyValidation,
  validateRequest,
  updateCategory
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  categoryIdValidation,
  validateRequest,
  deleteCategory
);

module.exports = router;
const express = require("express");

const {
  getStudentDashboard,
} = require("../controllers/studentController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("STUDENT"),
  getStudentDashboard
);

module.exports = router;
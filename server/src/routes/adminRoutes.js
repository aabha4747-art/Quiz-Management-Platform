const express = require("express");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getAdminDashboard,
} = require(
  "../controllers/adminDashboardController"
);

const {
  getAdminAnalytics,
} = require(
  "../controllers/adminAnalyticsController"
);

const router = express.Router();

/* =========================================================
   DASHBOARD
========================================================= */

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("ADMIN"),
  getAdminDashboard
);

/* =========================================================
   ANALYTICS
========================================================= */

router.get(
  "/analytics",
  authenticate,
  authorizeRoles("ADMIN"),
  getAdminAnalytics
);

/* =========================================================
   TEST ADMIN ACCESS
========================================================= */

router.get(
  "/test",
  authenticate,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "Admin access granted",
      user: req.user,
    });
  }
);

module.exports = router;
const express = require("express");
const { param } = require("express-validator");

const {
  getMyCertificates,
  getMyCertificateById,
  verifyCertificate,
} = require("../controllers/certificateController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const validateRequest = require("../middleware/validationMiddleware");

const router = express.Router();

/* =========================================================
   PUBLIC CERTIFICATE VERIFICATION
========================================================= */

router.get(
  "/verify/:certificateNumber",
  [
    param("certificateNumber")
      .trim()
      .notEmpty()
      .withMessage(
        "Certificate number is required"
      ),
  ],
  validateRequest,
  verifyCertificate
);

/* =========================================================
   GET MY CERTIFICATES
========================================================= */

router.get(
  "/",
  authenticate,
  authorizeRoles("STUDENT"),
  getMyCertificates
);

/* =========================================================
   GET ONE CERTIFICATE
========================================================= */

router.get(
  "/:id",
  authenticate,
  authorizeRoles("STUDENT"),
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage(
        "Certificate ID must be a positive integer"
      ),
  ],
  validateRequest,
  getMyCertificateById
);

module.exports = router;
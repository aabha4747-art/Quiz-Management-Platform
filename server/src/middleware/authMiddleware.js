const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const authenticate = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authorizationHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      `
        SELECT id, name, email, role, status
        FROM users
        WHERE id = $1
      `,
      [decoded.userId]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    const user = result.rows[0];

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource",
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
};
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { pool } = require("../config/db");

const {
  sendPasswordResetEmail,
} = require("../services/emailService");

/* =========================================================
   JWT TOKEN
========================================================= */

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        "1d",
    }
  );
};

/* =========================================================
   REGISTER
========================================================= */

const register = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const existingUser =
      await pool.query(
        `
          SELECT id
          FROM users
          WHERE email = $1
        `,
        [normalizedEmail]
      );

    if (
      existingUser.rowCount >
      0
    ) {
      return res
        .status(409)
        .json({
          success: false,
          message:
            "An account with this email already exists",
        });
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    const result =
      await pool.query(
        `
          INSERT INTO users (
            name,
            email,
            password_hash,
            role,
            status
          )
          VALUES (
            $1,
            $2,
            $3,
            'STUDENT',
            'ACTIVE'
          )
          RETURNING
            id,
            name,
            email,
            role,
            status,
            created_at,
            updated_at
        `,
        [
          name.trim(),
          normalizedEmail,
          passwordHash,
        ]
      );

    const user =
      result.rows[0];

    const token =
      generateToken(user);

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Registration successful",
        token,
        user,
      });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Unable to register user",
      });
  }
};

/* =========================================================
   LOGIN
========================================================= */

const login = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const result =
      await pool.query(
        `
          SELECT
            id,
            name,
            email,
            password_hash,
            role,
            status,
            created_at,
            updated_at
          FROM users
          WHERE email = $1
        `,
        [normalizedEmail]
      );

    if (
      result.rowCount === 0
    ) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Invalid email or password",
        });
    }

    const user =
      result.rows[0];

    if (
      user.status !==
      "ACTIVE"
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Your account is inactive",
        });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (
      !passwordMatches
    ) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Invalid email or password",
        });
    }

    const token =
      generateToken(user);

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Login successful",
        token,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          created_at:
            user.created_at,
          updated_at:
            user.updated_at,
        },
      });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Unable to log in",
      });
  }
};

/* =========================================================
   GET CURRENT USER
========================================================= */

const getCurrentUser =
  async (
    req,
    res
  ) => {
    try {
      const result =
        await pool.query(
          `
            SELECT
              id,
              name,
              email,
              role,
              status,
              created_at,
              updated_at
            FROM users
            WHERE id = $1
          `,
          [req.user.id]
        );

      if (
        result.rowCount ===
        0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "User account not found",
          });
      }

      return res
        .status(200)
        .json({
          success: true,
          user:
            result.rows[0],
        });
    } catch (error) {
      console.error(
        "Get current user error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to retrieve current user",
        });
    }
  };

/* =========================================================
   UPDATE PROFILE
========================================================= */

const updateProfile =
  async (
    req,
    res
  ) => {
    try {
      const {
        name,
      } = req.body;

      const result =
        await pool.query(
          `
            UPDATE users
            SET
              name = $1,
              updated_at = NOW()
            WHERE id = $2
            RETURNING
              id,
              name,
              email,
              role,
              status,
              created_at,
              updated_at
          `,
          [
            name.trim(),
            req.user.id,
          ]
        );

      if (
        result.rowCount ===
        0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "User account not found",
          });
      }

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Profile updated successfully",
          user:
            result.rows[0],
        });
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to update profile",
        });
    }
  };

/* =========================================================
   CHANGE PASSWORD
========================================================= */

const changePassword =
  async (
    req,
    res
  ) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      const result =
        await pool.query(
          `
            SELECT
              id,
              password_hash,
              status
            FROM users
            WHERE id = $1
          `,
          [req.user.id]
        );

      if (
        result.rowCount ===
        0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "User account not found",
          });
      }

      const user =
        result.rows[0];

      if (
        user.status !==
        "ACTIVE"
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Your account is inactive",
          });
      }

      const passwordMatches =
        await bcrypt.compare(
          currentPassword,
          user.password_hash
        );

      if (
        !passwordMatches
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Current password is incorrect",
          });
      }

      const samePassword =
        await bcrypt.compare(
          newPassword,
          user.password_hash
        );

      if (samePassword) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "New password must be different from your current password",
          });
      }

      const newPasswordHash =
        await bcrypt.hash(
          newPassword,
          12
        );

      await pool.query(
        `
          UPDATE users
          SET
            password_hash = $1,
            updated_at = NOW()
          WHERE id = $2
        `,
        [
          newPasswordHash,
          req.user.id,
        ]
      );

      await pool.query(
        `
          UPDATE password_reset_tokens
          SET used_at = NOW()
          WHERE user_id = $1
            AND used_at IS NULL
        `,
        [req.user.id]
      );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Password changed successfully",
        });
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to change password",
        });
    }
  };

/* =========================================================
   FORGOT PASSWORD
========================================================= */

const forgotPassword =
  async (
    req,
    res
  ) => {
    try {
      const normalizedEmail =
        req.body.email
          .trim()
          .toLowerCase();

      const userResult =
        await pool.query(
          `
            SELECT
              id,
              name,
              email,
              status
            FROM users
            WHERE email = $1
          `,
          [normalizedEmail]
        );

      /*
        Keep the response generic.

        This prevents someone from
        checking whether a particular
        email address exists.
      */
      const genericResponse = {
        success: true,
        message:
          "If an active account exists with this email, password reset instructions have been sent",
      };

      if (
        userResult.rowCount ===
        0
      ) {
        return res
          .status(200)
          .json(
            genericResponse
          );
      }

      const user =
        userResult.rows[0];

      if (
        user.status !==
        "ACTIVE"
      ) {
        return res
          .status(200)
          .json(
            genericResponse
          );
      }

      /* ===============================================
         GENERATE RAW RESET TOKEN
      =============================================== */

      const resetToken =
        crypto
          .randomBytes(32)
          .toString("hex");

      /*
        Only store a SHA-256 hash of
        the token in PostgreSQL.
      */
      const tokenHash =
        crypto
          .createHash(
            "sha256"
          )
          .update(
            resetToken
          )
          .digest("hex");

      const expiryMinutes =
        Number(
          process.env
            .PASSWORD_RESET_EXPIRES_MINUTES
        ) || 15;

      /* ===============================================
         INVALIDATE OLD UNUSED TOKENS
      =============================================== */

      await pool.query(
        `
          DELETE FROM password_reset_tokens
          WHERE user_id = $1
            AND used_at IS NULL
        `,
        [user.id]
      );

      /* ===============================================
         STORE NEW TOKEN HASH
      =============================================== */

      await pool.query(
        `
          INSERT INTO password_reset_tokens (
            user_id,
            token_hash,
            expires_at
          )
          VALUES (
            $1,
            $2,
            NOW() +
            ($3 * INTERVAL '1 minute')
          )
        `,
        [
          user.id,
          tokenHash,
          expiryMinutes,
        ]
      );

      /* ===============================================
         SEND RESET EMAIL
      =============================================== */

      try {
        await sendPasswordResetEmail(
          {
            to:
              user.email,

            name:
              user.name,

            resetToken,

            expiryMinutes,
          }
        );
      } catch (
        emailError
      ) {
        console.error(
          "Password reset email error:",
          emailError
        );

        /*
          Remove the token if the
          email could not be delivered.
        */
        await pool.query(
          `
            DELETE FROM password_reset_tokens
            WHERE token_hash = $1
          `,
          [tokenHash]
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to send password reset email",
          });
      }

      return res
        .status(200)
        .json(
          genericResponse
        );
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to process password reset request",
        });
    }
  };

/* =========================================================
   RESET PASSWORD
========================================================= */

const resetPassword =
  async (
    req,
    res
  ) => {
    const client =
      await pool.connect();

    try {
      await client.query(
        "BEGIN"
      );

      const {
        token,
        newPassword,
      } = req.body;

      const tokenHash =
        crypto
          .createHash(
            "sha256"
          )
          .update(token)
          .digest("hex");

      const tokenResult =
        await client.query(
          `
            SELECT
              prt.id,
              prt.user_id,
              prt.expires_at,
              prt.used_at,
              u.status
            FROM password_reset_tokens prt
            INNER JOIN users u
              ON u.id = prt.user_id
            WHERE prt.token_hash = $1
            FOR UPDATE
          `,
          [tokenHash]
        );

      if (
        tokenResult.rowCount ===
        0
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res
          .status(400)
          .json({
            success: false,
            message:
              "Reset token is invalid or expired",
          });
      }

      const resetRecord =
        tokenResult.rows[0];

      if (
        resetRecord.used_at ||
        new Date(
          resetRecord.expires_at
        ) <=
          new Date()
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res
          .status(400)
          .json({
            success: false,
            message:
              "Reset token is invalid or expired",
          });
      }

      if (
        resetRecord.status !==
        "ACTIVE"
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res
          .status(403)
          .json({
            success: false,
            message:
              "User account is inactive",
          });
      }

      const passwordHash =
        await bcrypt.hash(
          newPassword,
          12
        );

      await client.query(
        `
          UPDATE users
          SET
            password_hash = $1,
            updated_at = NOW()
          WHERE id = $2
        `,
        [
          passwordHash,
          resetRecord.user_id,
        ]
      );

      /*
        Mark this reset token as used.
      */
      await client.query(
        `
          UPDATE password_reset_tokens
          SET used_at = NOW()
          WHERE id = $1
        `,
        [
          resetRecord.id,
        ]
      );

      /*
        Also invalidate any other
        outstanding reset tokens for
        this user.
      */
      await client.query(
        `
          UPDATE password_reset_tokens
          SET used_at = NOW()
          WHERE user_id = $1
            AND used_at IS NULL
        `,
        [
          resetRecord.user_id,
        ]
      );

      await client.query(
        "COMMIT"
      );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Password reset successful",
        });
    } catch (error) {
      await client.query(
        "ROLLBACK"
      );

      console.error(
        "Reset password error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to reset password",
        });
    } finally {
      client.release();
    }
  };

/* =========================================================
   LOGOUT
========================================================= */

const logout = async (
  req,
  res
) => {
  return res
    .status(200)
    .json({
      success: true,
      message:
        "Logout successful. Remove the token from the client.",
    });
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
};
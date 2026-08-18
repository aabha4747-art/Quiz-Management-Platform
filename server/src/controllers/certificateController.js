const { pool } = require("../config/db");

/* =========================================================
   GET MY CERTIFICATES
========================================================= */

const getMyCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
        SELECT
          cert.id,
          cert.certificate_number,
          cert.score,
          cert.grade,
          cert.status,
          cert.issued_at,
          cert.revoked_at,

          q.id AS quiz_id,
          q.title AS quiz_title,
          q.thumbnail_url,

          c.id AS category_id,
          c.name AS category_name,

          a.id AS attempt_id

        FROM certificates cert

        INNER JOIN quizzes q
          ON q.id = cert.quiz_id

        INNER JOIN categories c
          ON c.id = q.category_id

        INNER JOIN attempts a
          ON a.id = cert.attempt_id

        WHERE cert.user_id = $1

        ORDER BY cert.issued_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      certificates: result.rows,
    });
  } catch (error) {
    console.error(
      "Get my certificates error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve certificates",
    });
  }
};

/* =========================================================
   GET ONE CERTIFICATE
========================================================= */

const getMyCertificateById = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `
        SELECT
          cert.id,
          cert.certificate_number,
          cert.score,
          cert.grade,
          cert.verification_token,
          cert.status,
          cert.issued_at,
          cert.revoked_at,

          u.id AS user_id,
          u.name AS student_name,
          u.email AS student_email,

          q.id AS quiz_id,
          q.title AS quiz_title,
          q.description AS quiz_description,

          c.id AS category_id,
          c.name AS category_name,

          a.id AS attempt_id,
          a.percentage,
          a.completed_at

        FROM certificates cert

        INNER JOIN users u
          ON u.id = cert.user_id

        INNER JOIN quizzes q
          ON q.id = cert.quiz_id

        INNER JOIN categories c
          ON c.id = q.category_id

        INNER JOIN attempts a
          ON a.id = cert.attempt_id

        WHERE cert.id = $1
          AND cert.user_id = $2

        LIMIT 1
      `,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Certificate not found",
      });
    }

    return res.status(200).json({
      success: true,
      certificate: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Get certificate error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve certificate",
    });
  }
};

/* =========================================================
   VERIFY CERTIFICATE
========================================================= */

const verifyCertificate = async (
  req,
  res
) => {
  try {
    const {
      certificateNumber,
    } = req.params;

    const result = await pool.query(
      `
        SELECT
          cert.id,
          cert.certificate_number,
          cert.score,
          cert.grade,
          cert.status,
          cert.issued_at,

          u.name AS student_name,

          q.title AS quiz_title,

          c.name AS category_name

        FROM certificates cert

        INNER JOIN users u
          ON u.id = cert.user_id

        INNER JOIN quizzes q
          ON q.id = cert.quiz_id

        INNER JOIN categories c
          ON c.id = q.category_id

        WHERE cert.certificate_number = $1

        LIMIT 1
      `,
      [certificateNumber]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        verified: false,
        message:
          "Certificate not found",
      });
    }

    const certificate =
      result.rows[0];

    const verified =
      certificate.status === "ACTIVE";

    return res.status(200).json({
      success: true,
      verified,
      certificate,
    });
  } catch (error) {
    console.error(
      "Verify certificate error:",
      error
    );

    return res.status(500).json({
      success: false,
      verified: false,
      message:
        "Unable to verify certificate",
    });
  }
};

module.exports = {
  getMyCertificates,
  getMyCertificateById,
  verifyCertificate,
};
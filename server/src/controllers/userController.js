const { pool } = require("../config/db");

/**
 * GET /api/users
 * Admin only
 *
 * Optional query parameters:
 * - search: filter by student name or email
 * - status: ACTIVE or INACTIVE
 */
const getUsers = async (req, res) => {
  try {
    const { search, status } = req.query;

    const values = [];
    const conditions = ["u.role = 'STUDENT'"];

    if (search) {
      values.push(`%${search.trim()}%`);

      conditions.push(`
        (
          u.name ILIKE $${values.length}
          OR u.email ILIKE $${values.length}
        )
      `);
    }

    if (status) {
      values.push(status);
      conditions.push(`u.status = $${values.length}`);
    }

    const result = await pool.query(
      `
        SELECT
          u.id,
          u.name,
          u.email,
          u.role,
          u.status,
          u.created_at,
          u.updated_at,

          COUNT(a.id)::INTEGER AS total_attempts,

          COUNT(DISTINCT a.quiz_id)::INTEGER
            AS quizzes_attempted,

          COALESCE(
            ROUND(
              (
                AVG(a.percentage) FILTER (
                  WHERE a.status IN ('PASSED', 'FAILED')
                )
              )::NUMERIC,
              2
            ),
            0
          ) AS average_score,

          COALESCE(
            (
              MAX(a.percentage) FILTER (
                WHERE a.status IN ('PASSED', 'FAILED')
              )
            )::NUMERIC,
            0
          ) AS highest_score

        FROM users u

        LEFT JOIN attempts a
          ON a.user_id = u.id

        WHERE ${conditions.join(" AND ")}

        GROUP BY
          u.id,
          u.name,
          u.email,
          u.role,
          u.status,
          u.created_at,
          u.updated_at

        ORDER BY u.created_at DESC
      `,
      values
    );

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      users: result.rows,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve users",
    });
  }
};

/**
 * GET /api/users/:id
 * Admin only
 *
 * Returns the selected student and their attempt history.
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query(
      `
        SELECT
          u.id,
          u.name,
          u.email,
          u.role,
          u.status,
          u.created_at,
          u.updated_at,

          COUNT(a.id)::INTEGER AS total_attempts,

          COUNT(DISTINCT a.quiz_id)::INTEGER
            AS quizzes_attempted,

          COALESCE(
            ROUND(
              (
                AVG(a.percentage) FILTER (
                  WHERE a.status IN ('PASSED', 'FAILED')
                )
              )::NUMERIC,
              2
            ),
            0
          ) AS average_score,

          COALESCE(
            (
              MAX(a.percentage) FILTER (
                WHERE a.status IN ('PASSED', 'FAILED')
              )
            )::NUMERIC,
            0
          ) AS highest_score

        FROM users u

        LEFT JOIN attempts a
          ON a.user_id = u.id

        WHERE u.id = $1
          AND u.role = 'STUDENT'

        GROUP BY
          u.id,
          u.name,
          u.email,
          u.role,
          u.status,
          u.created_at,
          u.updated_at
      `,
      [id]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const attemptsResult = await pool.query(
      `
        SELECT
          a.id,
          a.attempt_number,
          a.total_marks,
          a.obtained_marks,
          a.percentage,
          a.status,
          a.correct_answers,
          a.incorrect_answers,
          a.unanswered,
          a.time_taken_seconds,
          a.started_at,
          a.expires_at,
          a.completed_at,

          q.id AS quiz_id,
          q.title AS quiz_title,
          q.difficulty,

          c.id AS category_id,
          c.name AS category_name

        FROM attempts a

        INNER JOIN quizzes q
          ON q.id = a.quiz_id

        INNER JOIN categories c
          ON c.id = q.category_id

        WHERE a.user_id = $1

        ORDER BY a.started_at DESC
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      user: userResult.rows[0],
      attempts: attemptsResult.rows,
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve student",
    });
  }
};

/**
 * PATCH /api/users/:id/status
 * Admin only
 *
 * Body:
 * {
 *   "status": "ACTIVE"
 * }
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `
        UPDATE users

        SET
          status = $1,
          updated_at = NOW()

        WHERE id = $2
          AND role = 'STUDENT'

        RETURNING
          id,
          name,
          email,
          role,
          status,
          created_at,
          updated_at
      `,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Student account changed to ${status}`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update user status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update student status",
    });
  }
};

/**
 * DELETE /api/users/:id
 * Admin only
 */
const deleteUser = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const userResult = await client.query(
      `
        SELECT
          id,
          name,
          email,
          role

        FROM users

        WHERE id = $1
          AND role = 'STUDENT'
      `,
      [id]
    );

    if (userResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    /*
      If your foreign keys already use ON DELETE CASCADE,
      deleting the user is enough.

      If they do not, PostgreSQL may reject the deletion.
      In that case, delete related attempt records first.
    */
    await client.query(
      `
        DELETE FROM users

        WHERE id = $1
          AND role = 'STUDENT'
      `,
      [id]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Student account deleted successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Delete user error:", error);

    if (error.code === "23503") {
      return res.status(409).json({
        success: false,
        message:
          "This student cannot be deleted because related quiz records still exist",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to delete student account",
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
};
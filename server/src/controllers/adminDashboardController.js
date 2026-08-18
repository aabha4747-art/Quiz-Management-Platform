const { pool } = require("../config/db");

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

const getAdminDashboard = async (
  req,
  res
) => {
  try {
    const [
      statisticsResult,
      popularQuizzesResult,
      popularCategoriesResult,
      recentStudentsResult,
      recentAttemptsResult,
    ] = await Promise.all([
      /* =====================================================
         STATISTICS
      ===================================================== */

      pool.query(`
        SELECT
          (
            SELECT COUNT(*)::INTEGER
            FROM users
            WHERE role = 'STUDENT'
          ) AS total_students,

          (
            SELECT COUNT(*)::INTEGER
            FROM users
            WHERE role = 'STUDENT'
              AND status = 'ACTIVE'
          ) AS active_students,

          (
            SELECT COUNT(*)::INTEGER
            FROM users
            WHERE role = 'STUDENT'
              AND status <> 'ACTIVE'
          ) AS inactive_students,

          (
            SELECT COUNT(*)::INTEGER
            FROM quizzes
          ) AS total_quizzes,

          (
            SELECT COUNT(*)::INTEGER
            FROM quizzes
            WHERE status = 'PUBLISHED'
          ) AS published_quizzes,

          (
            SELECT COUNT(*)::INTEGER
            FROM quizzes
            WHERE status = 'DRAFT'
          ) AS draft_quizzes,

          (
            SELECT COUNT(*)::INTEGER
            FROM quizzes
            WHERE status = 'UNPUBLISHED'
          ) AS unpublished_quizzes,

          (
            SELECT COUNT(*)::INTEGER
            FROM questions
          ) AS total_questions,

          (
            SELECT COUNT(*)::INTEGER
            FROM attempts
          ) AS total_attempts,

          (
            SELECT COUNT(*)::INTEGER
            FROM attempts
            WHERE status IN (
              'PASSED',
              'FAILED'
            )
          ) AS completed_attempts,

          COALESCE(
            (
              SELECT ROUND(
                AVG(percentage),
                2
              )
              FROM attempts
              WHERE status IN (
                'PASSED',
                'FAILED'
              )
            ),
            0
          ) AS average_score,

          (
            SELECT COUNT(*)::INTEGER
            FROM attempts
            WHERE status = 'PASSED'
          ) AS passed_attempts,

          (
            SELECT COUNT(*)::INTEGER
            FROM attempts
            WHERE status = 'FAILED'
          ) AS failed_attempts,

          (
            SELECT COUNT(*)::INTEGER
            FROM attempts
            WHERE status = 'IN_PROGRESS'
          ) AS in_progress_attempts,

          (
            SELECT COUNT(*)::INTEGER
            FROM attempts
            WHERE status = 'EXPIRED'
          ) AS expired_attempts,

          COALESCE(
            (
              SELECT ROUND(
                (
                  COUNT(*) FILTER (
                    WHERE status = 'PASSED'
                  )::NUMERIC
                  /
                  NULLIF(
                    COUNT(*) FILTER (
                      WHERE status IN (
                        'PASSED',
                        'FAILED'
                      )
                    ),
                    0
                  )
                ) * 100,
                2
              )
              FROM attempts
            ),
            0
          ) AS pass_rate
      `),

      /* =====================================================
         POPULAR QUIZZES
      ===================================================== */

      pool.query(`
        SELECT
          q.id,
          q.title,
          q.status,
          q.difficulty,

          c.id AS category_id,
          c.name AS category_name,

          COUNT(a.id) FILTER (
            WHERE a.status IN (
              'PASSED',
              'FAILED'
            )
          )::INTEGER AS attempt_count,

          COUNT(DISTINCT a.user_id) FILTER (
            WHERE a.status IN (
              'PASSED',
              'FAILED'
            )
          )::INTEGER AS unique_students,

          COALESCE(
            ROUND(
              AVG(a.percentage) FILTER (
                WHERE a.status IN (
                  'PASSED',
                  'FAILED'
                )
              ),
              2
            ),
            0
          ) AS average_score,

          COUNT(a.id) FILTER (
            WHERE a.status = 'PASSED'
          )::INTEGER AS passed_attempts,

          COUNT(a.id) FILTER (
            WHERE a.status = 'FAILED'
          )::INTEGER AS failed_attempts

        FROM quizzes q

        INNER JOIN categories c
          ON c.id = q.category_id

        LEFT JOIN attempts a
          ON a.quiz_id = q.id

        GROUP BY
          q.id,
          q.title,
          q.status,
          q.difficulty,
          c.id,
          c.name

        ORDER BY
          attempt_count DESC,
          average_score DESC,
          q.title ASC

        LIMIT 5
      `),

      /* =====================================================
         POPULAR CATEGORIES
      ===================================================== */

      pool.query(`
        SELECT
          c.id,
          c.name,

          COUNT(
            DISTINCT q.id
          )::INTEGER AS quiz_count,

          COUNT(a.id) FILTER (
            WHERE a.status IN (
              'PASSED',
              'FAILED'
            )
          )::INTEGER AS attempt_count,

          COUNT(
            DISTINCT a.user_id
          ) FILTER (
            WHERE a.status IN (
              'PASSED',
              'FAILED'
            )
          )::INTEGER AS unique_students,

          COALESCE(
            ROUND(
              AVG(a.percentage) FILTER (
                WHERE a.status IN (
                  'PASSED',
                  'FAILED'
                )
              ),
              2
            ),
            0
          ) AS average_score

        FROM categories c

        LEFT JOIN quizzes q
          ON q.category_id = c.id

        LEFT JOIN attempts a
          ON a.quiz_id = q.id

        GROUP BY
          c.id,
          c.name

        ORDER BY
          attempt_count DESC,
          quiz_count DESC,
          c.name ASC

        LIMIT 5
      `),

      /* =====================================================
         RECENT STUDENTS
      ===================================================== */

      pool.query(`
        SELECT
          id,
          name,
          email,
          status,
          created_at
        FROM users
        WHERE role = 'STUDENT'
        ORDER BY created_at DESC
        LIMIT 5
      `),

      /* =====================================================
         RECENT ATTEMPTS
      ===================================================== */

      pool.query(`
        SELECT
          a.id,
          a.percentage,
          a.status,
          a.correct_answers,
          a.incorrect_answers,
          a.unanswered,
          a.started_at,
          a.completed_at,

          u.id AS user_id,
          u.name AS student_name,
          u.email AS student_email,

          q.id AS quiz_id,
          q.title AS quiz_title,

          c.id AS category_id,
          c.name AS category_name

        FROM attempts a

        INNER JOIN users u
          ON u.id = a.user_id

        INNER JOIN quizzes q
          ON q.id = a.quiz_id

        INNER JOIN categories c
          ON c.id = q.category_id

        ORDER BY
          COALESCE(
            a.completed_at,
            a.started_at
          ) DESC

        LIMIT 5
      `),
    ]);

    return res
      .status(200)
      .json({
        success: true,

        dashboard: {
          statistics:
            statisticsResult.rows[0],

          popularQuizzes:
            popularQuizzesResult.rows,

          popularCategories:
            popularCategoriesResult.rows,

          recentStudents:
            recentStudentsResult.rows,

          recentAttempts:
            recentAttemptsResult.rows,
        },
      });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Unable to retrieve Admin dashboard",
      });
  }
};

module.exports = {
  getAdminDashboard,
};
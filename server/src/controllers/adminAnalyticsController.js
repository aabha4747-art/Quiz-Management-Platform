const { pool } = require("../config/db");

/* =========================================================
   ADMIN ANALYTICS
========================================================= */

const getAdminAnalytics = async (req, res) => {
  try {
    const [
      overviewResult,
      studentPerformanceResult,
      quizPerformanceResult,
      categoryPerformanceResult,
      attemptStatusResult,
      monthlyAttemptsResult,
      dailyAttemptsResult,
      difficultyPerformanceResult,
      topStudentsResult,
    ] = await Promise.all([
      /* =====================================================
         1. OVERVIEW STATISTICS
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
            FROM quizzes
          ) AS total_quizzes,

          (
            SELECT COUNT(*)::INTEGER
            FROM quizzes
            WHERE status = 'PUBLISHED'
          ) AS published_quizzes,

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
         2. STUDENT PERFORMANCE
      ===================================================== */

      pool.query(`
        SELECT
          u.id,
          u.name,
          u.email,
          u.status,

          COUNT(a.id) FILTER (
            WHERE a.status IN (
              'PASSED',
              'FAILED'
            )
          )::INTEGER AS completed_attempts,

          COUNT(
            DISTINCT a.quiz_id
          ) FILTER (
            WHERE a.status IN (
              'PASSED',
              'FAILED'
            )
          )::INTEGER AS unique_quizzes,

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

          COALESCE(
            MAX(a.percentage) FILTER (
              WHERE a.status IN (
                'PASSED',
                'FAILED'
              )
            ),
            0
          ) AS highest_score,

          COUNT(a.id) FILTER (
            WHERE a.status = 'PASSED'
          )::INTEGER AS passed_attempts,

          COUNT(a.id) FILTER (
            WHERE a.status = 'FAILED'
          )::INTEGER AS failed_attempts

        FROM users u

        LEFT JOIN attempts a
          ON a.user_id = u.id

        WHERE u.role = 'STUDENT'

        GROUP BY
          u.id,
          u.name,
          u.email,
          u.status

        ORDER BY
          average_score DESC,
          completed_attempts DESC,
          u.name ASC

        LIMIT 20
      `),

      /* =====================================================
         3. QUIZ PERFORMANCE
      ===================================================== */

      pool.query(`
        SELECT
          q.id,
          q.title,
          q.status,

          q.difficulty::TEXT
            AS difficulty,

          c.id AS category_id,
          c.name AS category_name,

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
          ) AS average_score,

          COALESCE(
            MAX(a.percentage) FILTER (
              WHERE a.status IN (
                'PASSED',
                'FAILED'
              )
            ),
            0
          ) AS highest_score,

          COUNT(a.id) FILTER (
            WHERE a.status = 'PASSED'
          )::INTEGER AS passed_attempts,

          COUNT(a.id) FILTER (
            WHERE a.status = 'FAILED'
          )::INTEGER AS failed_attempts,

          COALESCE(
            ROUND(
              (
                COUNT(a.id) FILTER (
                  WHERE a.status = 'PASSED'
                )::NUMERIC
                /
                NULLIF(
                  COUNT(a.id) FILTER (
                    WHERE a.status IN (
                      'PASSED',
                      'FAILED'
                    )
                  ),
                  0
                )
              ) * 100,
              2
            ),
            0
          ) AS pass_rate

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

        LIMIT 20
      `),

      /* =====================================================
         4. CATEGORY PERFORMANCE
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
          ) AS average_score,

          COUNT(a.id) FILTER (
            WHERE a.status = 'PASSED'
          )::INTEGER AS passed_attempts,

          COUNT(a.id) FILTER (
            WHERE a.status = 'FAILED'
          )::INTEGER AS failed_attempts,

          COALESCE(
            ROUND(
              (
                COUNT(a.id) FILTER (
                  WHERE a.status = 'PASSED'
                )::NUMERIC
                /
                NULLIF(
                  COUNT(a.id) FILTER (
                    WHERE a.status IN (
                      'PASSED',
                      'FAILED'
                    )
                  ),
                  0
                )
              ) * 100,
              2
            ),
            0
          ) AS pass_rate

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
          average_score DESC,
          c.name ASC
      `),

      /* =====================================================
         5. ATTEMPT STATUS DISTRIBUTION
      ===================================================== */

      pool.query(`
        SELECT
          status::TEXT AS status,
          COUNT(*)::INTEGER AS count

        FROM attempts

        GROUP BY status

        ORDER BY count DESC
      `),

      /* =====================================================
         6. MONTHLY ATTEMPT TREND
         Last 12 months
      ===================================================== */

      pool.query(`
        SELECT
          TO_CHAR(
            DATE_TRUNC(
              'month',
              started_at
            ),
            'YYYY-MM'
          ) AS month,

          COUNT(*)::INTEGER
            AS total_attempts,

          COUNT(*) FILTER (
            WHERE status = 'PASSED'
          )::INTEGER
            AS passed_attempts,

          COUNT(*) FILTER (
            WHERE status = 'FAILED'
          )::INTEGER
            AS failed_attempts,

          COALESCE(
            ROUND(
              AVG(percentage) FILTER (
                WHERE status IN (
                  'PASSED',
                  'FAILED'
                )
              ),
              2
            ),
            0
          ) AS average_score

        FROM attempts

        WHERE started_at >=
          CURRENT_DATE
          - INTERVAL '12 months'

        GROUP BY
          DATE_TRUNC(
            'month',
            started_at
          )

        ORDER BY
          DATE_TRUNC(
            'month',
            started_at
          ) ASC
      `),

      /* =====================================================
         7. DAILY ATTEMPT TREND
         Last 30 days
      ===================================================== */

      pool.query(`
        SELECT
          DATE(started_at)
            AS date,

          COUNT(*)::INTEGER
            AS total_attempts,

          COUNT(*) FILTER (
            WHERE status = 'PASSED'
          )::INTEGER
            AS passed_attempts,

          COUNT(*) FILTER (
            WHERE status = 'FAILED'
          )::INTEGER
            AS failed_attempts,

          COALESCE(
            ROUND(
              AVG(percentage) FILTER (
                WHERE status IN (
                  'PASSED',
                  'FAILED'
                )
              ),
              2
            ),
            0
          ) AS average_score

        FROM attempts

        WHERE started_at >=
          CURRENT_DATE
          - INTERVAL '30 days'

        GROUP BY
          DATE(started_at)

        ORDER BY
          DATE(started_at) ASC
      `),

      /* =====================================================
         8. DIFFICULTY PERFORMANCE

         IMPORTANT:
         difficulty is converted to TEXT.

         We do NOT compare the PostgreSQL enum
         against BEGINNER / INTERMEDIATE / etc.
         This prevents enum errors.
      ===================================================== */

      pool.query(`
        SELECT
          q.difficulty::TEXT
            AS difficulty,

          COUNT(a.id) FILTER (
            WHERE a.status IN (
              'PASSED',
              'FAILED'
            )
          )::INTEGER
            AS attempts,

          COUNT(
            DISTINCT a.user_id
          ) FILTER (
            WHERE a.status IN (
              'PASSED',
              'FAILED'
            )
          )::INTEGER
            AS unique_students,

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
          )::INTEGER
            AS passed,

          COUNT(a.id) FILTER (
            WHERE a.status = 'FAILED'
          )::INTEGER
            AS failed,

          COALESCE(
            ROUND(
              (
                COUNT(a.id) FILTER (
                  WHERE a.status = 'PASSED'
                )::NUMERIC
                /
                NULLIF(
                  COUNT(a.id) FILTER (
                    WHERE a.status IN (
                      'PASSED',
                      'FAILED'
                    )
                  ),
                  0
                )
              ) * 100,
              2
            ),
            0
          ) AS pass_rate

        FROM quizzes q

        LEFT JOIN attempts a
          ON a.quiz_id = q.id

        GROUP BY
          q.difficulty

        ORDER BY
          q.difficulty::TEXT ASC
      `),

      /* =====================================================
         9. TOP STUDENTS
      ===================================================== */

      pool.query(`
        SELECT
          u.id,
          u.name,
          u.email,

          COUNT(a.id) FILTER (
            WHERE a.status IN (
              'PASSED',
              'FAILED'
            )
          )::INTEGER
            AS completed_attempts,

          COUNT(
            DISTINCT a.quiz_id
          ) FILTER (
            WHERE a.status IN (
              'PASSED',
              'FAILED'
            )
          )::INTEGER
            AS unique_quizzes,

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

          COALESCE(
            MAX(a.percentage) FILTER (
              WHERE a.status IN (
                'PASSED',
                'FAILED'
              )
            ),
            0
          ) AS highest_score,

          COUNT(a.id) FILTER (
            WHERE a.status = 'PASSED'
          )::INTEGER
            AS passed_attempts

        FROM users u

        INNER JOIN attempts a
          ON a.user_id = u.id

        WHERE
          u.role = 'STUDENT'
          AND a.status IN (
            'PASSED',
            'FAILED'
          )

        GROUP BY
          u.id,
          u.name,
          u.email

        ORDER BY
          average_score DESC,
          passed_attempts DESC,
          completed_attempts DESC

        LIMIT 10
      `),
    ]);

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res
      .status(200)
      .json({
        success: true,

        analytics: {
          overview:
            overviewResult.rows[0],

          studentPerformance:
            studentPerformanceResult.rows,

          quizPerformance:
            quizPerformanceResult.rows,

          categoryPerformance:
            categoryPerformanceResult.rows,

          attemptStatus:
            attemptStatusResult.rows,

          monthlyAttempts:
            monthlyAttemptsResult.rows,

          dailyAttempts:
            dailyAttemptsResult.rows,

          difficultyPerformance:
            difficultyPerformanceResult.rows,

          topStudents:
            topStudentsResult.rows,
        },
      });
  } catch (error) {
    console.error(
      "Admin analytics error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Unable to retrieve admin analytics",

        /*
         * Helpful while developing.
         * Remove this field before
         * production deployment.
         */
        error:
          process.env.NODE_ENV ===
          "production"
            ? undefined
            : error.message,
      });
  }
};

module.exports = {
  getAdminAnalytics,
};
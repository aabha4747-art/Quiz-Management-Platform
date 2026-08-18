const { pool } = require("../config/db");

const allowedPeriods = [
  "all",
  "weekly",
  "monthly",
];

/* =========================================================
   GET LEADERBOARD
========================================================= */

const getLeaderboard = async (
  req,
  res
) => {
  try {
    const {
      categoryId,
      period = "all",
      search = "",
      page = "1",
      limit = "10",
    } = req.query;

    const normalizedPeriod =
      allowedPeriods.includes(
        period
      )
        ? period
        : "all";

    const parsedPage =
      Math.max(
        Number.parseInt(
          page,
          10
        ) || 1,
        1
      );

    const parsedLimit =
      Math.min(
        Math.max(
          Number.parseInt(
            limit,
            10
          ) || 10,
          1
        ),
        100
      );

    const offset =
      (parsedPage - 1) *
      parsedLimit;

    /* =====================================================
       FILTER PARAMS
    ===================================================== */

    const values = [];

    const userConditions = [
      "u.role = 'STUDENT'",
      "u.status = 'ACTIVE'",
    ];

    const attemptConditions = [
      "a.status IN ('PASSED', 'FAILED')",
    ];

    /* =====================================================
       CATEGORY
    ===================================================== */

    if (categoryId) {
      values.push(
        categoryId
      );

      attemptConditions.push(
        `q.category_id = $${values.length}`
      );
    }

    /* =====================================================
       PERIOD
    ===================================================== */

    if (
      normalizedPeriod ===
      "weekly"
    ) {
      attemptConditions.push(`
        a.completed_at >=
        NOW() - INTERVAL '7 days'
      `);
    }

    if (
      normalizedPeriod ===
      "monthly"
    ) {
      attemptConditions.push(`
        a.completed_at >=
        NOW() - INTERVAL '30 days'
      `);
    }

    /* =====================================================
       SEARCH
    ===================================================== */

    if (search.trim()) {
      values.push(
        `%${search.trim()}%`
      );

      userConditions.push(`
        (
          u.name ILIKE $${values.length}
          OR
          u.email ILIKE $${values.length}
        )
      `);
    }

    const userWhereClause =
      userConditions.join(
        " AND "
      );

    const attemptWhereClause =
      attemptConditions.join(
        " AND "
      );

    /* =====================================================
       COUNT FILTERED USERS
    ===================================================== */

    const countResult =
      await pool.query(
        `
          SELECT
            COUNT(
              DISTINCT u.id
            )::INTEGER AS total

          FROM users u

          LEFT JOIN attempts a
            ON a.user_id =
               u.id

          LEFT JOIN quizzes q
            ON q.id =
               a.quiz_id

          WHERE
            ${userWhereClause}

            AND (
              a.id IS NULL

              OR (
                ${attemptWhereClause}
              )
            )
        `,
        values
      );

    /* =====================================================
       COMMON CTE
    ===================================================== */

    const rankingCte = `
      WITH student_stats AS (
        SELECT
          u.id
            AS user_id,

          u.name
            AS student_name,

          u.email,

          COALESCE(
            u.xp,
            0
          )::INTEGER
            AS xp,

          COALESCE(
            u.level,
            1
          )::INTEGER
            AS level,

          COALESCE(
            u.current_streak,
            0
          )::INTEGER
            AS current_streak,

          COALESCE(
            u.longest_streak,
            0
          )::INTEGER
            AS longest_streak,

          u.last_quiz_date,

          COUNT(
            a.id
          ) FILTER (
            WHERE
              ${attemptWhereClause}
          )::INTEGER
            AS total_attempts,

          COUNT(
            DISTINCT a.quiz_id
          ) FILTER (
            WHERE
              ${attemptWhereClause}
          )::INTEGER
            AS quizzes_attempted,

          COUNT(
            a.id
          ) FILTER (
            WHERE
              ${attemptWhereClause}

              AND
              a.status = 'PASSED'
          )::INTEGER
            AS passed_quizzes,

          COUNT(
            a.id
          ) FILTER (
            WHERE
              ${attemptWhereClause}

              AND
              a.status = 'FAILED'
          )::INTEGER
            AS failed_quizzes,

          COALESCE(
            ROUND(
              AVG(
                a.percentage
              ) FILTER (
                WHERE
                  ${attemptWhereClause}
              ),
              2
            ),
            0
          ) AS average_score,

          COALESCE(
            MAX(
              a.percentage
            ) FILTER (
              WHERE
                ${attemptWhereClause}
            ),
            0
          ) AS highest_score,

          COALESCE(
            SUM(
              a.correct_answers
            ) FILTER (
              WHERE
                ${attemptWhereClause}
            ),
            0
          )::INTEGER
            AS total_correct_answers,

          COALESCE(
            SUM(
              a.incorrect_answers
            ) FILTER (
              WHERE
                ${attemptWhereClause}
            ),
            0
          )::INTEGER
            AS total_incorrect_answers,

          COALESCE(
            SUM(
              a.unanswered
            ) FILTER (
              WHERE
                ${attemptWhereClause}
            ),
            0
          )::INTEGER
            AS total_unanswered,

          (
            SELECT
              COUNT(*)

            FROM
              user_achievements ua

            WHERE
              ua.user_id =
                u.id
          )::INTEGER
            AS achievement_count

        FROM users u

        LEFT JOIN attempts a
          ON a.user_id =
             u.id

        LEFT JOIN quizzes q
          ON q.id =
             a.quiz_id

        WHERE
          ${userWhereClause}

        GROUP BY
          u.id,
          u.name,
          u.email,
          u.xp,
          u.level,
          u.current_streak,
          u.longest_streak,
          u.last_quiz_date
      ),

      ranked_students AS (
        SELECT
          *,

          RANK() OVER (
            ORDER BY
              xp DESC,
              level DESC,
              average_score DESC,
              quizzes_attempted DESC,
              highest_score DESC
          )::INTEGER
            AS rank

        FROM student_stats
      )
    `;

    /* =====================================================
       PAGE DATA
    ===================================================== */

    const queryValues = [
      ...values,
    ];

    queryValues.push(
      parsedLimit
    );

    const limitParameter =
      `$${queryValues.length}`;

    queryValues.push(
      offset
    );

    const offsetParameter =
      `$${queryValues.length}`;

    const result =
      await pool.query(
        `
          ${rankingCte}

          SELECT
            user_id,
            student_name,
            email,

            xp,
            level,

            current_streak,
            longest_streak,

            last_quiz_date,

            achievement_count,

            total_attempts,
            quizzes_attempted,

            passed_quizzes,
            failed_quizzes,

            average_score,
            highest_score,

            total_correct_answers,
            total_incorrect_answers,
            total_unanswered,

            rank

          FROM ranked_students

          ORDER BY
            rank ASC,
            student_name ASC

          LIMIT ${limitParameter}

          OFFSET ${offsetParameter}
        `,
        queryValues
      );

    /* =====================================================
       CURRENT USER RANK

       Separate query so the student's
       own rank still appears even if
       they are on another page.
    ===================================================== */

    const currentUserValues = [
      ...values,
    ];

    currentUserValues.push(
      req.user.id
    );

    const currentUserParameter =
      `$${currentUserValues.length}`;

    const currentUserResult =
      await pool.query(
        `
          ${rankingCte}

          SELECT
            user_id,
            student_name,
            email,

            xp,
            level,

            current_streak,
            longest_streak,

            last_quiz_date,

            achievement_count,

            total_attempts,
            quizzes_attempted,

            passed_quizzes,
            failed_quizzes,

            average_score,
            highest_score,

            total_correct_answers,
            total_incorrect_answers,
            total_unanswered,

            rank

          FROM ranked_students

          WHERE
            user_id =
              ${currentUserParameter}

          LIMIT 1
        `,
        currentUserValues
      );

    const currentUser =
      currentUserResult.rows[0] ||
      null;

    /* =====================================================
       PAGINATION
    ===================================================== */

    const totalStudents =
      Number(
        countResult.rows[0]
          ?.total ||
          0
      );

    const totalPages =
      Math.max(
        Math.ceil(
          totalStudents /
            parsedLimit
        ),
        1
      );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res
      .status(200)
      .json({
        success: true,

        filters: {
          categoryId:
            categoryId ||
            null,

          period:
            normalizedPeriod,

          search:
            search.trim() ||
            null,
        },

        pagination: {
          page:
            parsedPage,

          limit:
            parsedLimit,

          totalStudents,

          totalPages,

          hasPreviousPage:
            parsedPage > 1,

          hasNextPage:
            parsedPage <
            totalPages,
        },

        count:
          result.rowCount,

        currentUser,

        leaderboard:
          result.rows,
      });
  } catch (error) {
    console.error(
      "Leaderboard error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Unable to retrieve leaderboard",
      });
  }
};

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  getLeaderboard,
};
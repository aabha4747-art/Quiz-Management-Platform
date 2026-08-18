const { pool } = require("../config/db");

const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      statisticsResult,
      recentAttemptsResult,
      recommendedQuizzesResult,
      categoryPerformanceResult,
      activeAttemptResult,
      gamificationResult,
      achievementCountResult,
      recentAchievementsResult,
    ] = await Promise.all([
      /* ===================================================
         GENERAL STATISTICS
      =================================================== */

      pool.query(
        `
          SELECT
            COUNT(*) FILTER (
              WHERE status IN (
                'PASSED',
                'FAILED'
              )
            )::INTEGER
            AS total_quizzes_attempted,

            COUNT(DISTINCT quiz_id) FILTER (
              WHERE status IN (
                'PASSED',
                'FAILED'
              )
            )::INTEGER
            AS unique_quizzes_attempted,

            COUNT(*) FILTER (
              WHERE status = 'PASSED'
            )::INTEGER
            AS total_passed,

            COUNT(*) FILTER (
              WHERE status = 'FAILED'
            )::INTEGER
            AS total_failed,

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
            )
            AS average_score,

            COALESCE(
              MAX(percentage) FILTER (
                WHERE status IN (
                  'PASSED',
                  'FAILED'
                )
              ),
              0
            )
            AS highest_score,

            COALESCE(
              SUM(
                correct_answers +
                incorrect_answers +
                unanswered
              ) FILTER (
                WHERE status IN (
                  'PASSED',
                  'FAILED'
                )
              ),
              0
            )::INTEGER
            AS total_questions_seen,

            COALESCE(
              SUM(correct_answers) FILTER (
                WHERE status IN (
                  'PASSED',
                  'FAILED'
                )
              ),
              0
            )::INTEGER
            AS total_correct_answers,

            COALESCE(
              SUM(incorrect_answers) FILTER (
                WHERE status IN (
                  'PASSED',
                  'FAILED'
                )
              ),
              0
            )::INTEGER
            AS total_incorrect_answers,

            COALESCE(
              SUM(unanswered) FILTER (
                WHERE status IN (
                  'PASSED',
                  'FAILED'
                )
              ),
              0
            )::INTEGER
            AS total_unanswered

          FROM attempts

          WHERE user_id = $1
        `,
        [userId]
      ),

      /* ===================================================
         RECENT ATTEMPTS
      =================================================== */

      pool.query(
        `
          SELECT
            a.id,
            a.attempt_number,
            a.percentage,
            a.status,

            a.correct_answers,
            a.incorrect_answers,
            a.unanswered,

            a.time_taken_seconds,

            a.started_at,
            a.completed_at,

            a.xp_awarded,
            a.xp_multiplier,
            a.is_repeat_attempt,

            q.id
              AS quiz_id,

            q.title
              AS quiz_title,

            q.difficulty,

            q.thumbnail_url,

            c.id
              AS category_id,

            c.name
              AS category_name

          FROM attempts a

          INNER JOIN quizzes q
            ON q.id = a.quiz_id

          INNER JOIN categories c
            ON c.id = q.category_id

          WHERE a.user_id = $1

            AND a.status IN (
              'PASSED',
              'FAILED'
            )

          ORDER BY
            a.completed_at DESC
            NULLS LAST

          LIMIT 5
        `,
        [userId]
      ),

      /* ===================================================
         RECOMMENDED QUIZZES
      =================================================== */

      pool.query(
        `
          SELECT
            q.id,
            q.title,
            q.description,
            q.difficulty,

            q.duration_minutes,
            q.passing_percentage,
            q.max_attempts,

            q.status,

            q.thumbnail_url,

            c.id
              AS category_id,

            c.name
              AS category_name,

            COUNT(
              DISTINCT qu.id
            )::INTEGER
              AS question_count

          FROM quizzes q

          INNER JOIN categories c
            ON c.id =
               q.category_id

          LEFT JOIN questions qu
            ON qu.quiz_id =
               q.id

          WHERE q.status =
                'PUBLISHED'

            AND NOT EXISTS (
              SELECT 1

              FROM attempts a

              WHERE a.quiz_id =
                    q.id

                AND a.user_id =
                    $1

                AND a.status IN (
                  'PASSED',
                  'FAILED'
                )
            )

          GROUP BY
            q.id,
            c.id

          HAVING
            COUNT(
              DISTINCT qu.id
            ) > 0

          ORDER BY
            q.created_at DESC

          LIMIT 4
        `,
        [userId]
      ),

      /* ===================================================
         CATEGORY PERFORMANCE
      =================================================== */

      pool.query(
        `
          SELECT
            c.id
              AS category_id,

            c.name
              AS category_name,

            COUNT(
              a.id
            )::INTEGER
              AS attempts,

            COUNT(*) FILTER (
              WHERE a.status =
                    'PASSED'
            )::INTEGER
              AS passed,

            COALESCE(
              ROUND(
                AVG(
                  a.percentage
                ),
                2
              ),
              0
            )
              AS average_score,

            COALESCE(
              MAX(
                a.percentage
              ),
              0
            )
              AS highest_score

          FROM attempts a

          INNER JOIN quizzes q
            ON q.id =
               a.quiz_id

          INNER JOIN categories c
            ON c.id =
               q.category_id

          WHERE a.user_id =
                $1

            AND a.status IN (
              'PASSED',
              'FAILED'
            )

          GROUP BY
            c.id,
            c.name

          ORDER BY
            average_score DESC,
            attempts DESC
        `,
        [userId]
      ),

      /* ===================================================
         ACTIVE ATTEMPT
      =================================================== */

      pool.query(
        `
          SELECT
            a.id,
            a.started_at,
            a.expires_at,

            q.id
              AS quiz_id,

            q.title
              AS quiz_title,

            q.duration_minutes,
            q.difficulty,

            q.thumbnail_url,

            c.name
              AS category_name

          FROM attempts a

          INNER JOIN quizzes q
            ON q.id =
               a.quiz_id

          INNER JOIN categories c
            ON c.id =
               q.category_id

          WHERE a.user_id = $1

            AND a.status =
                'IN_PROGRESS'

            AND a.expires_at >
                NOW()

          ORDER BY
            a.started_at DESC

          LIMIT 1
        `,
        [userId]
      ),

      /* ===================================================
         GAMIFICATION
      =================================================== */

      pool.query(
        `
          SELECT
            xp,
            level,
            current_streak,
            longest_streak,
            last_quiz_date

          FROM users

          WHERE id = $1
        `,
        [userId]
      ),

      /* ===================================================
         ACHIEVEMENT COUNT
      =================================================== */

      pool.query(
        `
          SELECT
            COUNT(*)::INTEGER
              AS achievement_count

          FROM user_achievements

          WHERE user_id = $1
        `,
        [userId]
      ),

      /* ===================================================
         RECENT ACHIEVEMENTS
      =================================================== */

      pool.query(
        `
          SELECT
            a.id,
            a.code,
            a.title,
            a.description,
            a.icon,
            a.xp_reward,

            ua.unlocked_at

          FROM user_achievements ua

          INNER JOIN achievements a
            ON a.id =
               ua.achievement_id

          WHERE ua.user_id =
                $1

          ORDER BY
            ua.unlocked_at DESC

          LIMIT 5
        `,
        [userId]
      ),
    ]);

    /* =====================================================
       STATISTICS
    ===================================================== */

    const statistics =
      statisticsResult.rows[0];

    const completedAttempts =
      Number(
        statistics
          .total_quizzes_attempted ||
          0
      );

    const passedAttempts =
      Number(
        statistics.total_passed ||
          0
      );

    const successRate =
      completedAttempts > 0
        ? Math.round(
            (passedAttempts /
              completedAttempts) *
              100
          )
        : 0;

    /* =====================================================
       CATEGORY PERFORMANCE
    ===================================================== */

    const categoryPerformance =
      categoryPerformanceResult.rows;

    const strongestCategory =
      categoryPerformance.length > 0
        ? categoryPerformance[0]
        : null;

    const weakestCategory =
      categoryPerformance.length > 1
        ? categoryPerformance[
            categoryPerformance.length -
              1
          ]
        : categoryPerformance.length ===
          1
        ? categoryPerformance[0]
        : null;

    /* =====================================================
       GAMIFICATION
    ===================================================== */

    const userGamification =
      gamificationResult.rows[0] ||
      {};

    const totalXp =
      Number(
        userGamification.xp || 0
      );

    const level =
      Number(
        userGamification.level || 1
      );

    const currentStreak =
      Number(
        userGamification
          .current_streak || 0
      );

    const longestStreak =
      Number(
        userGamification
          .longest_streak || 0
      );

    const lastQuizDate =
      userGamification
        .last_quiz_date || null;

    const achievementCount =
      Number(
        achievementCountResult.rows[0]
          ?.achievement_count || 0
      );

    /* =====================================================
       XP LEVEL PROGRESS

       500 XP per level
    ===================================================== */

    const xpPerLevel = 500;

    const xpAtCurrentLevel =
      (level - 1) *
      xpPerLevel;

    const xpAtNextLevel =
      level *
      xpPerLevel;

    const xpIntoCurrentLevel =
      Math.max(
        totalXp -
          xpAtCurrentLevel,
        0
      );

    const xpRemaining =
      Math.max(
        xpAtNextLevel -
          totalXp,
        0
      );

    const levelProgressPercentage =
      Math.min(
        Math.max(
          Math.round(
            (xpIntoCurrentLevel /
              xpPerLevel) *
              100
          ),
          0
        ),
        100
      );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      dashboard: {
        /* -----------------------------------------------
           Existing statistics
        ----------------------------------------------- */

        statistics: {
          ...statistics,

          success_rate:
            successRate,
        },

        /* -----------------------------------------------
           Attempts
        ----------------------------------------------- */

        recentAttempts:
          recentAttemptsResult.rows,

        /* -----------------------------------------------
           Recommendations
        ----------------------------------------------- */

        recommendedQuizzes:
          recommendedQuizzesResult.rows,

        /* -----------------------------------------------
           Subject performance
        ----------------------------------------------- */

        categoryPerformance,

        strongestCategory,

        weakestCategory,

        /* -----------------------------------------------
           Active assessment
        ----------------------------------------------- */

        activeAttempt:
          activeAttemptResult.rows[0] ||
          null,

        /* -----------------------------------------------
           Gamification
        ----------------------------------------------- */

        gamification: {
          totalXp,

          level,

          currentStreak,

          longestStreak,

          lastQuizDate,

          xpPerLevel,

          xpAtCurrentLevel,

          xpAtNextLevel,

          xpIntoCurrentLevel,

          xpRemaining,

          levelProgressPercentage,
        },

        /* -----------------------------------------------
           Achievements
        ----------------------------------------------- */

        achievementCount,

        recentAchievements:
          recentAchievementsResult.rows,
      },
    });
  } catch (error) {
    console.error(
      "Student dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve student dashboard",
    });
  }
};

module.exports = {
  getStudentDashboard,
};
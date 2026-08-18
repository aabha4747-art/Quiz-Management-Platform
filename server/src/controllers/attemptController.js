const { pool } = require("../config/db");
const crypto = require("crypto");

/* =========================================================
   HELPERS
========================================================= */

function getCertificateGrade(percentage) {
  const score = Number(percentage || 0);

  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";

  return "P";
}

function createCertificateNumber(attemptId) {
  const year = new Date().getFullYear();

  return `BN-${year}-${String(
    attemptId
  ).padStart(6, "0")}`;
}

/* =========================================================
   START QUIZ
========================================================= */

const startQuiz = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      quizId,
    } = req.params;

    const userId =
      req.user.id;

    /* =====================================================
       GET QUIZ
    ===================================================== */

    const quizResult =
      await client.query(
        `
          SELECT
            id,
            title,
            description,
            duration_minutes,
            max_attempts,
            passing_percentage,
            status
          FROM quizzes
          WHERE id = $1
        `,
        [quizId]
      );

    if (
      quizResult.rowCount ===
      0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(404).json({
        success: false,
        message:
          "Quiz not found",
      });
    }

    const quiz =
      quizResult.rows[0];

    /* =====================================================
       QUIZ MUST BE PUBLISHED
    ===================================================== */

    if (
      quiz.status !==
      "PUBLISHED"
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(409).json({
        success: false,
        message:
          "This quiz is not currently available",
      });
    }

    /* =====================================================
       EXPIRE OLD ATTEMPTS FIRST
    ===================================================== */

    await client.query(
      `
        UPDATE attempts

        SET
          status = 'EXPIRED',
          completed_at =
            COALESCE(
              completed_at,
              NOW()
            )

        WHERE quiz_id = $1
          AND user_id = $2
          AND status =
              'IN_PROGRESS'
          AND expires_at <= NOW()
      `,
      [
        quizId,
        userId,
      ]
    );

    /* =====================================================
       CHECK EXISTING ACTIVE ATTEMPT
    ===================================================== */

    const activeAttemptResult =
      await client.query(
        `
          SELECT
            id,
            attempt_number,
            started_at,
            expires_at

          FROM attempts

          WHERE quiz_id = $1
            AND user_id = $2
            AND status =
                'IN_PROGRESS'
            AND expires_at > NOW()

          ORDER BY
            started_at DESC

          LIMIT 1
        `,
        [
          quizId,
          userId,
        ]
      );

    if (
      activeAttemptResult.rowCount >
      0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(409).json({
        success: false,

        message:
          "You already have an active attempt for this quiz",

        attempt:
          activeAttemptResult.rows[0],
      });
    }

    /* =====================================================
       COUNT PREVIOUS ATTEMPTS
    ===================================================== */

    const attemptCountResult =
      await client.query(
        `
          SELECT
            COUNT(*)::INTEGER
              AS attempt_count

          FROM attempts

          WHERE quiz_id = $1
            AND user_id = $2
        `,
        [
          quizId,
          userId,
        ]
      );

    const previousAttempts =
      Number(
        attemptCountResult
          .rows[0]
          ?.attempt_count ||
          0
      );

    const maxAttempts =
      Number(
        quiz.max_attempts ||
          1
      );

    /* =====================================================
       ENFORCE MAX ATTEMPTS
    ===================================================== */

    if (
      maxAttempts > 0 &&
      previousAttempts >=
        maxAttempts
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(409).json({
        success: false,

        message:
          `You have used all ${maxAttempts} allowed ${
            maxAttempts === 1
              ? "attempt"
              : "attempts"
          } for this quiz`,

        attemptsUsed:
          previousAttempts,

        maxAttempts,

        attemptsRemaining: 0,
      });
    }

    /* =====================================================
       CHECK QUESTIONS
    ===================================================== */

    const questionCountResult =
      await client.query(
        `
          SELECT
            COUNT(*)::INTEGER
              AS question_count

          FROM questions

          WHERE quiz_id = $1
        `,
        [quizId]
      );

    const questionCount =
      Number(
        questionCountResult
          .rows[0]
          ?.question_count ||
          0
      );

    if (
      questionCount === 0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(409).json({
        success: false,

        message:
          "This quiz does not contain any questions",
      });
    }

    /* =====================================================
       CREATE ATTEMPT
    ===================================================== */

    const attemptNumber =
      previousAttempts + 1;

    const attemptResult =
      await client.query(
        `
          INSERT INTO attempts (
            quiz_id,
            user_id,
            attempt_number,
            expires_at
          )

          VALUES (
            $1,
            $2,
            $3,
            NOW() +
            (
              $4 *
              INTERVAL '1 minute'
            )
          )

          RETURNING
            id,
            quiz_id,
            user_id,
            attempt_number,
            status,
            started_at,
            expires_at
        `,
        [
          quizId,
          userId,
          attemptNumber,
          quiz.duration_minutes,
        ]
      );

    /* =====================================================
       RETURN QUESTIONS

       IMPORTANT:
       Correct-answer information is
       deliberately NOT returned.
    ===================================================== */

    const questionsResult =
      await client.query(
        `
          SELECT
            q.id,
            q.question_text,
            q.marks,
            q.difficulty,
            q.position,

            COALESCE(
              JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id',
                  o.id,

                  'optionText',
                  o.option_text,

                  'option_text',
                  o.option_text,

                  'position',
                  o.position
                )

                ORDER BY
                  o.position
              )

              FILTER (
                WHERE o.id
                  IS NOT NULL
              ),

              '[]'::json
            ) AS options

          FROM questions q

          LEFT JOIN options o
            ON o.question_id =
               q.id

          WHERE q.quiz_id = $1

          GROUP BY
            q.id,
            q.question_text,
            q.marks,
            q.difficulty,
            q.position

          ORDER BY
            q.position
        `,
        [quizId]
      );

    await client.query(
      "COMMIT"
    );

    const attemptsRemaining =
      Math.max(
        maxAttempts -
          attemptNumber,
        0
      );

    return res.status(201).json({
      success: true,

      message:
        "Quiz attempt started",

      quiz: {
        id:
          quiz.id,

        title:
          quiz.title,

        description:
          quiz.description,

        durationMinutes:
          quiz.duration_minutes,

        passingPercentage:
          quiz.passing_percentage,

        maxAttempts,
      },

      attempt: {
        ...attemptResult.rows[0],

        max_attempts:
          maxAttempts,

        attempts_remaining:
          attemptsRemaining,
      },

      questions:
        questionsResult.rows,
    });
  } catch (error) {
    await client.query(
      "ROLLBACK"
    );

    console.error(
      "Start quiz error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to start quiz",
    });
  } finally {
    client.release();
  }
};

/* =========================================================
   SUBMIT QUIZ
========================================================= */

const submitQuiz = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { quizId } = req.params;

    const {
      attemptId,
      answers = [],
    } = req.body;

    const userId = req.user.id;

    /* =====================================================
       GET ATTEMPT
    ===================================================== */

    const attemptResult =
      await client.query(
        `
          SELECT
            a.id,
            a.quiz_id,
            a.user_id,
            a.status,
            a.started_at,
            a.expires_at,

            q.title,
            q.passing_percentage

          FROM attempts a

          INNER JOIN quizzes q
            ON q.id = a.quiz_id

          WHERE a.id = $1
            AND a.quiz_id = $2
            AND a.user_id = $3

          FOR UPDATE
        `,
        [
          attemptId,
          quizId,
          userId,
        ]
      );

    /* =====================================================
       ATTEMPT MUST BELONG TO USER + QUIZ
    ===================================================== */

    if (
      attemptResult.rowCount === 0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(404).json({
        success: false,
        message:
          "Quiz attempt not found",
      });
    }

    const attempt =
      attemptResult.rows[0];

    /* =====================================================
       ATTEMPT MUST STILL BE ACTIVE
    ===================================================== */

    if (
      attempt.status !==
      "IN_PROGRESS"
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(409).json({
        success: false,

        message:
          "This quiz attempt has already been completed",
      });
    }

    /* =====================================================
       SERVER-SIDE EXPIRY CHECK

       IMPORTANT:
       Never trust only the browser timer.
    ===================================================== */

    const expiryTime =
      new Date(
        attempt.expires_at
      ).getTime();

    const currentTime =
      Date.now();

    if (
      expiryTime <=
      currentTime
    ) {
      await client.query(
        `
          UPDATE attempts

          SET
            status = 'EXPIRED',

            completed_at =
              COALESCE(
                completed_at,
                NOW()
              )

          WHERE id = $1
            AND user_id = $2
            AND status = 'IN_PROGRESS'
        `,
        [
          attemptId,
          userId,
        ]
      );

      await client.query(
        "COMMIT"
      );

      return res.status(409).json({
        success: false,

        expired: true,

        message:
          "Time for this quiz has expired",
      });
    }

    /* =====================================================
       GET CORRECT ANSWERS

       Correct answers stay on backend.
    ===================================================== */

    const questionResult =
      await client.query(
        `
          SELECT
            q.id,
            q.marks,

            o.id
              AS correct_option_id

          FROM questions q

          INNER JOIN options o
            ON o.question_id =
               q.id

           AND o.is_correct =
               TRUE

          WHERE q.quiz_id = $1

          ORDER BY q.position
        `,
        [quizId]
      );

    if (
      questionResult.rowCount === 0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(409).json({
        success: false,

        message:
          "Quiz does not contain valid questions",
      });
    }

    /* =====================================================
       MAP SUBMITTED ANSWERS
    ===================================================== */

    const submittedAnswers =
      new Map();

    for (const answer of answers) {
      const questionId =
        Number(
          answer.questionId
        );

      const selectedOptionId =
        answer.selectedOptionId ===
          null ||
        answer.selectedOptionId ===
          undefined
          ? null
          : Number(
              answer.selectedOptionId
            );

      /* -------------------------------------------------
         SAME QUESTION CANNOT APPEAR TWICE
      ------------------------------------------------- */

      if (
        submittedAnswers.has(
          questionId
        )
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(400).json({
          success: false,

          message:
            `Question ${questionId} was submitted more than once`,
        });
      }

      submittedAnswers.set(
        questionId,
        selectedOptionId
      );
    }

    /* =====================================================
       VALIDATE SUBMITTED QUESTIONS
    ===================================================== */

    const validQuestionIds =
      new Set(
        questionResult.rows.map(
          (question) =>
            Number(
              question.id
            )
        )
      );

    for (
      const questionId of
      submittedAnswers.keys()
    ) {
      if (
        !validQuestionIds.has(
          questionId
        )
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(400).json({
          success: false,

          message:
            `Question ${questionId} does not belong to this quiz`,
        });
      }
    }

    /* =====================================================
       SCORE ANSWERS
    ===================================================== */

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;

    let totalMarks = 0;
    let obtainedMarks = 0;

    /*
      Remove autosaved answer rows.

      They will be recreated with final
      correctness + marks information.
    */

    await client.query(
      `
        DELETE FROM answers
        WHERE attempt_id = $1
      `,
      [attemptId]
    );

    for (
      const question of
      questionResult.rows
    ) {
      const questionId =
        Number(
          question.id
        );

      const questionMarks =
        Number(
          question.marks
        );

      const correctOptionId =
        Number(
          question.correct_option_id
        );

      totalMarks +=
        questionMarks;

      const selectedOptionId =
        submittedAnswers.get(
          questionId
        ) ?? null;

      let isCorrect = null;
      let marksAwarded = 0;

      /* -------------------------------------------------
         UNANSWERED
      ------------------------------------------------- */

      if (
        selectedOptionId ===
        null
      ) {
        unanswered += 1;
      } else {
        /* ===============================================
           VALIDATE OPTION BELONGS TO QUESTION
        =============================================== */

        const optionValidation =
          await client.query(
            `
              SELECT id

              FROM options

              WHERE id = $1
                AND question_id = $2
            `,
            [
              selectedOptionId,
              questionId,
            ]
          );

        if (
          optionValidation.rowCount ===
          0
        ) {
          await client.query(
            "ROLLBACK"
          );

          return res.status(400).json({
            success: false,

            message:
              `Selected option for question ${questionId} is invalid`,
          });
        }

        /* ===============================================
           CALCULATE CORRECTNESS
        =============================================== */

        isCorrect =
          selectedOptionId ===
          correctOptionId;

        if (isCorrect) {
          correctAnswers += 1;

          marksAwarded =
            questionMarks;

          obtainedMarks +=
            questionMarks;
        } else {
          incorrectAnswers += 1;
        }
      }

      /* =================================================
         SAVE FINAL ANSWER
      ================================================= */

      await client.query(
        `
          INSERT INTO answers (
            attempt_id,
            question_id,
            selected_option_id,
            is_correct,
            marks_awarded,
            answered_at
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
          )
        `,
        [
          attemptId,
          questionId,
          selectedOptionId,
          isCorrect,
          marksAwarded,

          selectedOptionId
            ? new Date()
            : null,
        ]
      );
    }

    /* =====================================================
       CALCULATE PERCENTAGE
    ===================================================== */

    const percentage =
      totalMarks > 0
        ? Number(
            (
              (
                obtainedMarks /
                totalMarks
              ) *
              100
            ).toFixed(2)
          )
        : 0;

    const passed =
      percentage >=
      Number(
        attempt.passing_percentage
      );

    const finalStatus =
      passed
        ? "PASSED"
        : "FAILED";

    /* =====================================================
       CALCULATE TIME TAKEN
    ===================================================== */

    const completionTimeResult =
      await client.query(
        `
          SELECT
            GREATEST(
              0,

              FLOOR(
                EXTRACT(
                  EPOCH FROM (
                    LEAST(
                      NOW(),
                      $1::TIMESTAMPTZ
                    )
                    -
                    $2::TIMESTAMPTZ
                  )
                )
              )
            )::INTEGER
              AS time_taken_seconds
        `,
        [
          attempt.expires_at,
          attempt.started_at,
        ]
      );

    const timeTakenSeconds =
      Number(
        completionTimeResult
          .rows[0]
          .time_taken_seconds ||
          0
      );

    /* =====================================================
       REPEAT ATTEMPT XP

       First completion = 100% XP
       Repeat completion = 25% XP
    ===================================================== */

    const previousCompletedResult =
      await client.query(
        `
          SELECT
            COUNT(*)::INTEGER
              AS completed_count

          FROM attempts

          WHERE user_id = $1

            AND quiz_id = $2

            AND id <> $3

            AND status IN (
              'PASSED',
              'FAILED'
            )
        `,
        [
          userId,
          quizId,
          attemptId,
        ]
      );

    const previousCompleted =
      Number(
        previousCompletedResult
          .rows[0]
          .completed_count ||
          0
      );

    const isRepeatAttempt =
      previousCompleted > 0;

    const xpMultiplier =
      isRepeatAttempt
        ? 0.25
        : 1;

    /* =====================================================
       ATTEMPT XP
    ===================================================== */

    const baseAttemptXp =
      50 +
      correctAnswers * 10;

    const attemptXpAwarded =
      Math.round(
        baseAttemptXp *
          xpMultiplier
      );

    /* =====================================================
       ACHIEVEMENTS
    ===================================================== */

    const previousAllAttemptsResult =
      await client.query(
        `
          SELECT
            COUNT(*)::INTEGER
              AS completed_count

          FROM attempts

          WHERE user_id = $1

            AND id <> $2

            AND status IN (
              'PASSED',
              'FAILED'
            )
        `,
        [
          userId,
          attemptId,
        ]
      );

    const previousAllCompleted =
      Number(
        previousAllAttemptsResult
          .rows[0]
          .completed_count ||
          0
      );

    const eligibleAchievementCodes =
      [];

    /* First quiz */

    if (
      previousAllCompleted === 0
    ) {
      eligibleAchievementCodes.push(
        "FIRST_QUIZ"
      );
    }

    /* Quiz passed */

    if (passed) {
      eligibleAchievementCodes.push(
        "QUIZ_PASSED"
      );
    }

    /* 80%+ */

    if (
      percentage >= 80
    ) {
      eligibleAchievementCodes.push(
        "STRONG_PERFORMER"
      );
    }

    /* 90%+ */

    if (
      percentage >= 90
    ) {
      eligibleAchievementCodes.push(
        "BIOTECH_ACE"
      );
    }

    /* Perfect score */

    if (
      percentage === 100
    ) {
      eligibleAchievementCodes.push(
        "PERFECT_SCORE"
      );
    }

    /* Every question answered */

    if (
      unanswered === 0
    ) {
      eligibleAchievementCodes.push(
        "FULL_ATTEMPT"
      );
    }

    let newlyUnlockedAchievements =
      [];

    if (
      eligibleAchievementCodes.length >
      0
    ) {
      const achievementResult =
        await client.query(
          `
            WITH eligible AS (
              SELECT
                id,
                code,
                title,
                description,
                icon,
                xp_reward

              FROM achievements

              WHERE code =
                ANY($1::TEXT[])
            ),

            inserted AS (
              INSERT INTO user_achievements (
                user_id,
                achievement_id
              )

              SELECT
                $2,
                eligible.id

              FROM eligible

              ON CONFLICT (
                user_id,
                achievement_id
              )
              DO NOTHING

              RETURNING
                achievement_id,
                unlocked_at
            )

            SELECT
              eligible.id,
              eligible.code,
              eligible.title,
              eligible.description,
              eligible.icon,
              eligible.xp_reward,
              inserted.unlocked_at

            FROM eligible

            INNER JOIN inserted
              ON inserted.achievement_id =
                 eligible.id

            ORDER BY eligible.id
          `,
          [
            eligibleAchievementCodes,
            userId,
          ]
        );

      newlyUnlockedAchievements =
        achievementResult.rows;
    }

    /* =====================================================
       ACHIEVEMENT XP
    ===================================================== */

    const achievementXpAwarded =
      newlyUnlockedAchievements.reduce(
        (
          total,
          achievement
        ) =>
          total +
          Number(
            achievement.xp_reward ||
            0
          ),
        0
      );

    const totalXpAwarded =
      attemptXpAwarded +
      achievementXpAwarded;

    /* =====================================================
       XP + LEVEL + STREAK
    ===================================================== */

    const userGamificationResult =
      await client.query(
        `
          UPDATE users

          SET
            xp =
              xp + $1,

            level =
              FLOOR(
                (
                  xp + $1
                ) /
                500.0
              )::INTEGER + 1,

            current_streak =
              CASE

                WHEN
                  last_quiz_date
                  IS NULL

                THEN 1

                WHEN
                  last_quiz_date =
                  CURRENT_DATE

                THEN
                  current_streak

                WHEN
                  last_quiz_date =
                  CURRENT_DATE - 1

                THEN
                  current_streak + 1

                ELSE 1
              END,

            longest_streak =
              GREATEST(
                longest_streak,

                CASE

                  WHEN
                    last_quiz_date
                    IS NULL

                  THEN 1

                  WHEN
                    last_quiz_date =
                    CURRENT_DATE

                  THEN
                    current_streak

                  WHEN
                    last_quiz_date =
                    CURRENT_DATE - 1

                  THEN
                    current_streak + 1

                  ELSE 1
                END
              ),

            last_quiz_date =
              CURRENT_DATE

          WHERE id = $2

          RETURNING
            xp,
            level,
            current_streak,
            longest_streak,
            last_quiz_date
        `,
        [
          totalXpAwarded,
          userId,
        ]
      );

    const gamification =
      userGamificationResult.rows[0];

    const totalUserXp =
      Number(
        gamification.xp ||
        0
      );

    /* =====================================================
       SAVE ATTEMPT RESULT
    ===================================================== */

    const updatedAttemptResult =
      await client.query(
        `
          UPDATE attempts

          SET
            total_marks = $1,

            obtained_marks = $2,

            percentage = $3,

            correct_answers = $4,

            incorrect_answers = $5,

            unanswered = $6,

            time_taken_seconds = $7,

            status = $8,

            completed_at = NOW(),

            xp_awarded = $9,

            xp_multiplier = $10,

            is_repeat_attempt = $11

          WHERE id = $12

          RETURNING
            id,
            quiz_id,
            user_id,
            attempt_number,

            total_marks,
            obtained_marks,
            percentage,

            correct_answers,
            incorrect_answers,
            unanswered,

            time_taken_seconds,

            status,

            started_at,
            expires_at,
            completed_at,

            xp_awarded,
            xp_multiplier,
            is_repeat_attempt
        `,
        [
          totalMarks,
          obtainedMarks,
          percentage,

          correctAnswers,
          incorrectAnswers,
          unanswered,

          timeTakenSeconds,

          finalStatus,

          totalXpAwarded,

          xpMultiplier,

          isRepeatAttempt,

          attemptId,
        ]
      );

    /* =====================================================
       CERTIFICATE GENERATION

       Only passed attempts receive certificates.
    ===================================================== */

    let certificate = null;

    if (passed) {
      const grade =
        getCertificateGrade(
          percentage
        );

      const certificateNumber =
        createCertificateNumber(
          attemptId
        );

      const verificationToken =
        crypto.randomUUID();

      /*
        One attempt can only have
        one certificate because
        attempt_id has a UNIQUE
        constraint.
      */

      const certificateResult =
        await client.query(
          `
            INSERT INTO certificates (
              certificate_number,
              user_id,
              quiz_id,
              attempt_id,
              score,
              grade,
              verification_token,
              status
            )

            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7,
              'ACTIVE'
            )

            ON CONFLICT (
              attempt_id
            )

            DO UPDATE SET
              score =
                EXCLUDED.score,

              grade =
                EXCLUDED.grade

            RETURNING
              id,

              certificate_number,

              user_id,

              quiz_id,

              attempt_id,

              score,

              grade,

              verification_token,

              status,

              issued_at,

              revoked_at
          `,
          [
            certificateNumber,

            userId,

            quizId,

            attemptId,

            percentage,

            grade,

            verificationToken,
          ]
        );

      certificate =
        certificateResult.rows[0];
    }

    /* =====================================================
       COMMIT EVERYTHING

       Attempt + score + XP +
       achievements + certificate
       stay in one transaction.
    ===================================================== */

    await client.query(
      "COMMIT"
    );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      message:
        "Quiz submitted successfully",

      result: {
        ...updatedAttemptResult
          .rows[0],

        quizTitle:
          attempt.title,

        passingPercentage:
          attempt.passing_percentage,

        /* XP */

        xpAwarded:
          totalXpAwarded,

        attemptXpAwarded,

        achievementXpAwarded,

        totalXp:
          totalUserXp,

        xpMultiplier,

        isRepeatAttempt,

        /* Gamification */

        level:
          Number(
            gamification.level
          ),

        currentStreak:
          Number(
            gamification
              .current_streak
          ),

        longestStreak:
          Number(
            gamification
              .longest_streak
          ),

        lastQuizDate:
          gamification
            .last_quiz_date,

        /* Achievements */

        newAchievements:
          newlyUnlockedAchievements,

        /* Certificate */

        certificate,
      },
    });
  } catch (error) {
    await client.query(
      "ROLLBACK"
    );

    console.error(
      "Submit quiz error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to submit quiz",
    });
  } finally {
    client.release();
  }
};

/* =========================================================
   GET MY ATTEMPTS
========================================================= */

/* =========================================================
   SAVE ACTIVE QUIZ ANSWER
========================================================= */

const saveAttemptAnswer =
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

      const attemptId =
        Number(
          req.params.id
        );

      const {
        questionId,
        selectedOptionId,
      } = req.body;

      const userId =
        req.user.id;

      /* ===================================================
         GET ATTEMPT
      =================================================== */

      const attemptResult =
        await client.query(
          `
            SELECT
              id,
              quiz_id,
              user_id,
              status,
              expires_at

            FROM attempts

            WHERE id = $1
              AND user_id = $2

            FOR UPDATE
          `,
          [
            attemptId,
            userId,
          ]
        );

      if (
        attemptResult.rowCount ===
        0
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(404).json({
          success: false,
          message:
            "Quiz attempt not found",
        });
      }

      const attempt =
        attemptResult.rows[0];

      if (
        attempt.status !==
        "IN_PROGRESS"
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(409).json({
          success: false,

          message:
            "This quiz attempt is no longer active",
        });
      }

      /* ===================================================
         SERVER-SIDE EXPIRY CHECK
      =================================================== */

      if (
        new Date(
          attempt.expires_at
        ).getTime() <=
        Date.now()
      ) {
        await client.query(
          `
            UPDATE attempts

            SET
              status = 'EXPIRED',
              completed_at =
                COALESCE(
                  completed_at,
                  NOW()
                )

            WHERE id = $1
          `,
          [attemptId]
        );

        await client.query(
          "COMMIT"
        );

        return res.status(409).json({
          success: false,
          expired: true,

          message:
            "Time for this quiz has expired",
        });
      }

      /* ===================================================
         VALIDATE QUESTION
      =================================================== */

      const questionResult =
        await client.query(
          `
            SELECT id

            FROM questions

            WHERE id = $1
              AND quiz_id = $2
          `,
          [
            questionId,
            attempt.quiz_id,
          ]
        );

      if (
        questionResult.rowCount ===
        0
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(400).json({
          success: false,

          message:
            "Question does not belong to this quiz",
        });
      }

      /* ===================================================
         VALIDATE OPTION
      =================================================== */

      const optionResult =
        await client.query(
          `
            SELECT id

            FROM options

            WHERE id = $1
              AND question_id = $2
          `,
          [
            selectedOptionId,
            questionId,
          ]
        );

      if (
        optionResult.rowCount ===
        0
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(400).json({
          success: false,

          message:
            "Selected option is invalid",
        });
      }

      /*
        We intentionally do NOT calculate
        correctness here.

        During an active assessment the
        student must not receive any
        correct-answer information.
      */

      await client.query(
        `
          DELETE FROM answers

          WHERE attempt_id = $1
            AND question_id = $2
        `,
        [
          attemptId,
          questionId,
        ]
      );

      await client.query(
        `
          INSERT INTO answers (
            attempt_id,
            question_id,
            selected_option_id,
            is_correct,
            marks_awarded,
            answered_at
          )

          VALUES (
            $1,
            $2,
            $3,
            NULL,
            0,
            NOW()
          )
        `,
        [
          attemptId,
          questionId,
          selectedOptionId,
        ]
      );

      await client.query(
        "COMMIT"
      );

      return res.status(200).json({
        success: true,

        message:
          "Answer saved",

        answer: {
          attemptId,
          questionId:
            Number(
              questionId
            ),

          selectedOptionId:
            Number(
              selectedOptionId
            ),
        },
      });
    } catch (error) {
      await client.query(
        "ROLLBACK"
      );

      console.error(
        "Save attempt answer error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to save answer",
      });
    } finally {
      client.release();
    }
  };

const getMyAttempts = async (
  req,
  res
) => {
  try {
    const result =
      await pool.query(
        `
          SELECT
            a.id,
            a.attempt_number,

            a.total_marks,
            a.obtained_marks,
            a.percentage,

            a.correct_answers,
            a.incorrect_answers,
            a.unanswered,

            a.time_taken_seconds,

            a.status,

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

            c.id
              AS category_id,

            c.name
              AS category_name,

            cert.id
              AS certificate_id,

            cert.certificate_number,

            cert.grade
              AS certificate_grade,

            cert.status
              AS certificate_status

          FROM attempts a

          INNER JOIN quizzes q
            ON q.id =
               a.quiz_id

          INNER JOIN categories c
            ON c.id =
               q.category_id

          LEFT JOIN certificates cert
            ON cert.attempt_id =
               a.id

          WHERE a.user_id = $1

          ORDER BY
            a.started_at DESC
        `,
        [req.user.id]
      );

    return res.status(200).json({
      success: true,

      count:
        result.rowCount,

      attempts:
        result.rows,
    });
  } catch (error) {
    console.error(
      "Get attempts error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve attempts",
    });
  }
};

/* =========================================================
   GET ATTEMPT BY ID
========================================================= */

const getMyAttemptById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    /* -----------------------------------------------------
       Attempt
    ----------------------------------------------------- */

    const attemptResult =
      await pool.query(
        `
          SELECT
            a.id,
            a.attempt_number,

            a.total_marks,
            a.obtained_marks,
            a.percentage,

            a.correct_answers,
            a.incorrect_answers,
            a.unanswered,

            a.time_taken_seconds,

            a.status,

            a.started_at,
            a.expires_at,
            a.completed_at,

            a.xp_awarded,
            a.xp_multiplier,
            a.is_repeat_attempt,

            q.id
              AS quiz_id,

            q.title
              AS quiz_title,

            q.description
              AS quiz_description,

            q.duration_minutes,

            q.passing_percentage,

            q.difficulty,

            q.thumbnail_url,

            c.id
              AS category_id,

            c.name
              AS category_name

          FROM attempts a

          INNER JOIN quizzes q
            ON q.id =
               a.quiz_id

          INNER JOIN categories c
            ON c.id =
               q.category_id

          WHERE a.id = $1
            AND a.user_id = $2
        `,
        [
          id,
          req.user.id,
        ]
      );

    if (
      attemptResult.rowCount === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Attempt not found",
      });
    }

    const attempt =
      attemptResult.rows[0];

    /* =====================================================
       ACTIVE ATTEMPT
    ===================================================== */

    if (
      attempt.status ===
      "IN_PROGRESS"
    ) {
      const questionsResult =
        await pool.query(
          `
            SELECT
              q.id,
              q.question_text,
              q.marks,
              q.difficulty,
              q.position,

              COALESCE(
                JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'id',
                    o.id,

                    'option_text',
                    o.option_text,

                    'optionText',
                    o.option_text,

                    'position',
                    o.position
                  )

                  ORDER BY
                    o.position
                )

                FILTER (
                  WHERE o.id
                  IS NOT NULL
                ),

                '[]'::json
              ) AS options

            FROM questions q

            LEFT JOIN options o
              ON o.question_id =
                 q.id

            WHERE q.quiz_id = $1

            GROUP BY
              q.id,
              q.question_text,
              q.marks,
              q.difficulty,
              q.position

            ORDER BY
              q.position
          `,
          [
            attempt.quiz_id,
          ]
        );

      const savedAnswersResult =
        await pool.query(
          `
            SELECT
              question_id,
              selected_option_id

            FROM answers

            WHERE attempt_id = $1
          `,
          [id]
        );

      return res.status(200).json({
        success: true,

        attempt: {
          ...attempt,

          questions:
            questionsResult.rows,
        },

        answers:
          savedAnswersResult.rows,
      });
    }

    /* =====================================================
       COMPLETED ANSWER REVIEW
    ===================================================== */

    const answersResult =
      await pool.query(
        `
          SELECT
            q.id
              AS question_id,

            q.question_text,

            q.explanation,

            q.marks,

            q.position,

            a.selected_option_id,

            selected.option_text
              AS selected_answer,

            correct.id
              AS correct_option_id,

            correct.option_text
              AS correct_answer,

            a.is_correct,

            a.marks_awarded

          FROM answers a

          INNER JOIN questions q
            ON q.id =
               a.question_id

          LEFT JOIN options selected
            ON selected.id =
               a.selected_option_id

          INNER JOIN options correct
            ON correct.question_id =
               q.id

           AND correct.is_correct =
               TRUE

          WHERE a.attempt_id = $1

          ORDER BY
            q.position
        `,
        [id]
      );

    /* =====================================================
       USER ACHIEVEMENTS
    ===================================================== */

    const achievementResult =
      await pool.query(
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

          WHERE ua.user_id = $1

          ORDER BY
            ua.unlocked_at DESC
        `,
        [req.user.id]
      );

    /* =====================================================
       GAMIFICATION
    ===================================================== */

    const gamificationResult =
      await pool.query(
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
        [req.user.id]
      );

    const gamification =
      gamificationResult.rows[0] ||
      {};

    /* =====================================================
       CERTIFICATE
    ===================================================== */

    const certificateResult =
      await pool.query(
        `
          SELECT
            cert.id,

            cert.certificate_number,

            cert.user_id,

            cert.quiz_id,

            cert.attempt_id,

            cert.score,

            cert.grade,

            cert.verification_token,

            cert.status,

            cert.issued_at,

            cert.revoked_at,

            u.name
              AS student_name,

            u.email
              AS student_email,

            q.title
              AS quiz_title,

            c.name
              AS category_name

          FROM certificates cert

          INNER JOIN users u
            ON u.id =
               cert.user_id

          INNER JOIN quizzes q
            ON q.id =
               cert.quiz_id

          INNER JOIN categories c
            ON c.id =
               q.category_id

          WHERE cert.attempt_id = $1

            AND cert.user_id = $2

          LIMIT 1
        `,
        [
          id,
          req.user.id,
        ]
      );

    const certificate =
      certificateResult.rows[0] ||
      null;

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      attempt,

      answers:
        answersResult.rows,

      achievements:
        achievementResult.rows,

      certificate,

      gamification: {
        totalXp:
          Number(
            gamification.xp || 0
          ),

        level:
          Number(
            gamification.level || 1
          ),

        currentStreak:
          Number(
            gamification
              .current_streak || 0
          ),

        longestStreak:
          Number(
            gamification
              .longest_streak || 0
          ),

        lastQuizDate:
          gamification
            .last_quiz_date ||
          null,
      },
    });
  } catch (error) {
    console.error(
      "Get attempt details error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve attempt details",
    });
  }
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  startQuiz,
  submitQuiz,
  saveAttemptAnswer,
  getMyAttempts,
  getMyAttemptById,
};
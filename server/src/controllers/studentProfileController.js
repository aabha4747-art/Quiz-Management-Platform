const { pool } = require("../config/db");

/* =========================================================
   HELPER
========================================================= */

const ensureProfileExists = async (
  userId
) => {
  const result =
    await pool.query(
      `
        INSERT INTO student_profiles (
          user_id
        )
        VALUES ($1)

        ON CONFLICT (user_id)
        DO NOTHING

        RETURNING *
      `,
      [userId]
    );

  if (
    result.rowCount > 0
  ) {
    return result.rows[0];
  }

  const existing =
    await pool.query(
      `
        SELECT *
        FROM student_profiles
        WHERE user_id = $1
        LIMIT 1
      `,
      [userId]
    );

  return (
    existing.rows[0] ||
    null
  );
};

/* =========================================================
   GET MY PROFILE
========================================================= */

const getMyStudentProfile = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.id;

    await ensureProfileExists(
      userId
    );

    const result =
      await pool.query(
        `
          SELECT
            u.id AS user_id,
            u.name,
            u.email,
            u.role,
            u.status,
            u.xp,
            u.level,
            u.current_streak,
            u.longest_streak,
            u.last_quiz_date,
            u.created_at AS account_created_at,

            sp.id AS profile_id,
            sp.profile_picture_url,
            sp.country,
            sp.college_company,
            sp.degree_profession,

            sp.learning_goal,
            sp.skill_level,
            sp.weekly_goal_hours,
            sp.interests,

            sp.email_reminders,
            sp.quiz_reminders,
            sp.streak_reminders,
            sp.weekly_progress_reports,

            sp.recommended_quizzes,
            sp.learning_path_suggestions,
            sp.progress_tracking,
            sp.achievement_badges,
            sp.leaderboard_participation,

            sp.personal_info_completed,
            sp.onboarding_step,
            sp.onboarding_completed,

            sp.created_at AS profile_created_at,
            sp.updated_at AS profile_updated_at

          FROM users u

          LEFT JOIN student_profiles sp
            ON sp.user_id = u.id

          WHERE u.id = $1

          LIMIT 1
        `,
        [userId]
      );

    if (
      result.rowCount === 0
    ) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Student not found",
        });
    }

    return res
      .status(200)
      .json({
        success: true,

        profile:
          result.rows[0],
      });
  } catch (error) {
    console.error(
      "Get student profile error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Unable to retrieve student profile",
      });
  }
};

/* =========================================================
   UPLOAD PROFILE PICTURE
========================================================= */

const uploadProfilePicture =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user.id;

      if (!req.file) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Please select a profile picture",
          });
      }

      await ensureProfileExists(
        userId
      );

      const imageUrl =
        `/uploads/profile-pictures/${req.file.filename}`;

      const result =
        await pool.query(
          `
            UPDATE student_profiles

            SET
              profile_picture_url = $1,
              updated_at =
                CURRENT_TIMESTAMP

            WHERE user_id = $2

            RETURNING *
          `,
          [
            imageUrl,
            userId,
          ]
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Profile picture uploaded successfully",

          profilePictureUrl:
            imageUrl,

          profile:
            result.rows[0],
        });
    } catch (error) {
      console.error(
        "Upload profile picture error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to upload profile picture",
        });
    }
  };

/* =========================================================
   STEP 1 — ABOUT YOU
========================================================= */

const saveAboutYou = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.id;

    const {
      profilePictureUrl = null,
      country,
      collegeCompany,
      degreeProfession,
    } = req.body;

    if (
      !country?.trim() ||
      !collegeCompany?.trim() ||
      !degreeProfession?.trim()
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Country, college/company and degree/profession are required",
        });
    }

    await ensureProfileExists(
      userId
    );

    const currentResult =
      await pool.query(
        `
          SELECT
            profile_picture_url
          FROM student_profiles
          WHERE user_id = $1
          LIMIT 1
        `,
        [userId]
      );

    const existingPicture =
      currentResult.rows[0]
        ?.profile_picture_url ||
      null;

    const result =
      await pool.query(
        `
          UPDATE student_profiles

          SET
            profile_picture_url = $1,
            country = $2,
            college_company = $3,
            degree_profession = $4,

            personal_info_completed = TRUE,

            onboarding_step =
              GREATEST(
                onboarding_step,
                2
              ),

            updated_at =
              CURRENT_TIMESTAMP

          WHERE user_id = $5

          RETURNING *
        `,
        [
          profilePictureUrl ||
            existingPicture,

          country.trim(),

          collegeCompany.trim(),

          degreeProfession.trim(),

          userId,
        ]
      );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Personal information saved",

        profile:
          result.rows[0],
      });
  } catch (error) {
    console.error(
      "Save about you error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Unable to save personal information",
      });
  }
};

/* =========================================================
   STEP 2 — LEARNING GOAL
========================================================= */

const saveLearningGoal =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user.id;

      const {
        learningGoal,
      } = req.body;

      if (!learningGoal) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Learning goal is required",
          });
      }

      await ensureProfileExists(
        userId
      );

      const result =
        await pool.query(
          `
            UPDATE student_profiles

            SET
              learning_goal = $1,

              onboarding_step =
                GREATEST(
                  onboarding_step,
                  3
                ),

              updated_at =
                CURRENT_TIMESTAMP

            WHERE user_id = $2

            RETURNING *
          `,
          [
            learningGoal,
            userId,
          ]
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Learning goal saved",

          profile:
            result.rows[0],
        });
    } catch (error) {
      console.error(
        "Save learning goal error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to save learning goal",
        });
    }
  };

/* =========================================================
   STEP 3 — INTERESTS
========================================================= */

const saveInterests =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user.id;

      const {
        interests = [],
      } = req.body;

      if (
        !Array.isArray(
          interests
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Interests must be an array",
          });
      }

      await ensureProfileExists(
        userId
      );

      const result =
        await pool.query(
          `
            UPDATE student_profiles

            SET
              interests = $1,

              onboarding_step =
                GREATEST(
                  onboarding_step,
                  4
                ),

              updated_at =
                CURRENT_TIMESTAMP

            WHERE user_id = $2

            RETURNING *
          `,
          [
            interests,
            userId,
          ]
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Interests saved",

          profile:
            result.rows[0],
        });
    } catch (error) {
      console.error(
        "Save interests error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to save interests",
        });
    }
  };

/* =========================================================
   STEP 4 — SKILL LEVEL
========================================================= */

const saveSkillLevel =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user.id;

      const {
        skillLevel,
      } = req.body;

      if (!skillLevel) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Skill level is required",
          });
      }

      await ensureProfileExists(
        userId
      );

      const result =
        await pool.query(
          `
            UPDATE student_profiles

            SET
              skill_level = $1,

              onboarding_step =
                GREATEST(
                  onboarding_step,
                  5
                ),

              updated_at =
                CURRENT_TIMESTAMP

            WHERE user_id = $2

            RETURNING *
          `,
          [
            skillLevel,
            userId,
          ]
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Skill level saved",

          profile:
            result.rows[0],
        });
    } catch (error) {
      console.error(
        "Save skill level error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to save skill level",
        });
    }
  };

/* =========================================================
   STEP 5 — WEEKLY GOAL
========================================================= */

const saveWeeklyGoal =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user.id;

      const {
        weeklyGoalHours,
      } = req.body;

      const parsedHours =
        Number(
          weeklyGoalHours
        );

      if (
        Number.isNaN(
          parsedHours
        ) ||
        parsedHours <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Weekly goal must be greater than 0",
          });
      }

      await ensureProfileExists(
        userId
      );

      const result =
        await pool.query(
          `
            UPDATE student_profiles

            SET
              weekly_goal_hours = $1,

              onboarding_step =
                GREATEST(
                  onboarding_step,
                  6
                ),

              updated_at =
                CURRENT_TIMESTAMP

            WHERE user_id = $2

            RETURNING *
          `,
          [
            parsedHours,
            userId,
          ]
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Weekly goal saved",

          profile:
            result.rows[0],
        });
    } catch (error) {
      console.error(
        "Save weekly goal error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to save weekly goal",
        });
    }
  };

/* =========================================================
   STEP 6 — NOTIFICATIONS
========================================================= */

const saveNotifications =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user.id;

      const {
        emailReminders = true,
        quizReminders = true,
        streakReminders = true,
        weeklyProgressReports = true,
      } = req.body;

      await ensureProfileExists(
        userId
      );

      const result =
        await pool.query(
          `
            UPDATE student_profiles

            SET
              email_reminders = $1,
              quiz_reminders = $2,
              streak_reminders = $3,
              weekly_progress_reports = $4,

              onboarding_step =
                GREATEST(
                  onboarding_step,
                  7
                ),

              updated_at =
                CURRENT_TIMESTAMP

            WHERE user_id = $5

            RETURNING *
          `,
          [
            Boolean(
              emailReminders
            ),

            Boolean(
              quizReminders
            ),

            Boolean(
              streakReminders
            ),

            Boolean(
              weeklyProgressReports
            ),

            userId,
          ]
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Notification preferences saved",

          profile:
            result.rows[0],
        });
    } catch (error) {
      console.error(
        "Save notifications error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to save notification preferences",
        });
    }
  };

/* =========================================================
   STEP 7 — PERSONALIZATION
========================================================= */

const savePersonalization =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user.id;

      const {
        recommendedQuizzes = true,
        learningPathSuggestions = true,
        progressTracking = true,
        achievementBadges = true,
        leaderboardParticipation = true,
      } = req.body;

      await ensureProfileExists(
        userId
      );

      const result =
        await pool.query(
          `
            UPDATE student_profiles

            SET
              recommended_quizzes = $1,
              learning_path_suggestions = $2,
              progress_tracking = $3,
              achievement_badges = $4,
              leaderboard_participation = $5,

              onboarding_step =
                GREATEST(
                  onboarding_step,
                  8
                ),

              updated_at =
                CURRENT_TIMESTAMP

            WHERE user_id = $6

            RETURNING *
          `,
          [
            Boolean(
              recommendedQuizzes
            ),

            Boolean(
              learningPathSuggestions
            ),

            Boolean(
              progressTracking
            ),

            Boolean(
              achievementBadges
            ),

            Boolean(
              leaderboardParticipation
            ),

            userId,
          ]
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Dashboard personalization saved",

          profile:
            result.rows[0],
        });
    } catch (error) {
      console.error(
        "Save personalization error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to save personalization preferences",
        });
    }
  };

/* =========================================================
   COMPLETE ONBOARDING
========================================================= */

const completeOnboarding =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user.id;

      await ensureProfileExists(
        userId
      );

      const existing =
        await pool.query(
          `
            SELECT
              personal_info_completed

            FROM student_profiles

            WHERE user_id = $1

            LIMIT 1
          `,
          [userId]
        );

      if (
        !existing.rows[0]
          ?.personal_info_completed
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Complete your personal information first",
          });
      }

      const result =
        await pool.query(
          `
            UPDATE student_profiles

            SET
              onboarding_completed = TRUE,
              onboarding_step = 8,
              updated_at =
                CURRENT_TIMESTAMP

            WHERE user_id = $1

            RETURNING *
          `,
          [userId]
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Onboarding completed successfully",

          profile:
            result.rows[0],
        });
    } catch (error) {
      console.error(
        "Complete onboarding error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to complete onboarding",
        });
    }
  };

/* =========================================================
   UPDATE PROFILE
========================================================= */

const updateMyStudentProfile =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user.id;

      await ensureProfileExists(
        userId
      );

      const currentResult =
        await pool.query(
          `
            SELECT *
            FROM student_profiles
            WHERE user_id = $1
            LIMIT 1
          `,
          [userId]
        );

      const current =
        currentResult.rows[0];

      const {
        profilePictureUrl,
        country,
        collegeCompany,
        degreeProfession,
        learningGoal,
        skillLevel,
        weeklyGoalHours,
        interests,

        emailReminders,
        quizReminders,
        streakReminders,
        weeklyProgressReports,

        recommendedQuizzes,
        learningPathSuggestions,
        progressTracking,
        achievementBadges,
        leaderboardParticipation,
      } = req.body;

      const result =
        await pool.query(
          `
            UPDATE student_profiles

            SET
              profile_picture_url = $1,
              country = $2,
              college_company = $3,
              degree_profession = $4,

              learning_goal = $5,
              skill_level = $6,
              weekly_goal_hours = $7,
              interests = $8,

              email_reminders = $9,
              quiz_reminders = $10,
              streak_reminders = $11,
              weekly_progress_reports = $12,

              recommended_quizzes = $13,
              learning_path_suggestions = $14,
              progress_tracking = $15,
              achievement_badges = $16,
              leaderboard_participation = $17,

              updated_at =
                CURRENT_TIMESTAMP

            WHERE user_id = $18

            RETURNING *
          `,
          [
            profilePictureUrl ??
              current.profile_picture_url,

            country ??
              current.country,

            collegeCompany ??
              current.college_company,

            degreeProfession ??
              current.degree_profession,

            learningGoal ??
              current.learning_goal,

            skillLevel ??
              current.skill_level,

            weeklyGoalHours ??
              current.weekly_goal_hours,

            interests ??
              current.interests,

            emailReminders ??
              current.email_reminders,

            quizReminders ??
              current.quiz_reminders,

            streakReminders ??
              current.streak_reminders,

            weeklyProgressReports ??
              current.weekly_progress_reports,

            recommendedQuizzes ??
              current.recommended_quizzes,

            learningPathSuggestions ??
              current.learning_path_suggestions,

            progressTracking ??
              current.progress_tracking,

            achievementBadges ??
              current.achievement_badges,

            leaderboardParticipation ??
              current.leaderboard_participation,

            userId,
          ]
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Profile updated successfully",

          profile:
            result.rows[0],
        });
    } catch (error) {
      console.error(
        "Update student profile error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to update student profile",
        });
    }
  };

/* =========================================================
   UPDATE PERSONAL INFORMATION
========================================================= */

const updatePersonalInformation =
  async (req, res) => {
    try {
      const userId = req.user.id;

      const {
        name,
        country,
        collegeCompany,
        degreeProfession,
      } = req.body;

      if (
        !name?.trim() ||
        !country?.trim() ||
        !collegeCompany?.trim() ||
        !degreeProfession?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, country, college/company and degree/profession are required",
        });
      }

      await ensureProfileExists(userId);

      await pool.query(
        `
          UPDATE users
          SET name = $1
          WHERE id = $2
        `,
        [name.trim(), userId]
      );

      const result =
        await pool.query(
          `
            UPDATE student_profiles

            SET
              country = $1,
              college_company = $2,
              degree_profession = $3,
              personal_info_completed = TRUE,
              updated_at = CURRENT_TIMESTAMP

            WHERE user_id = $4

            RETURNING *
          `,
          [
            country.trim(),
            collegeCompany.trim(),
            degreeProfession.trim(),
            userId,
          ]
        );

      return res.status(200).json({
        success: true,
        message:
          "Personal information updated successfully",
        profile: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update personal information error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update personal information",
      });
    }
  };

/* =========================================================
   UPDATE LEARNING PREFERENCES
========================================================= */

const updateLearningPreferences =
  async (req, res) => {
    try {
      const userId = req.user.id;

      const {
        learningGoal,
        interests,
        skillLevel,
        weeklyGoalHours,
      } = req.body;

      if (
        interests &&
        !Array.isArray(interests)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Interests must be an array",
        });
      }

      await ensureProfileExists(userId);

      const result =
        await pool.query(
          `
            UPDATE student_profiles

            SET
              learning_goal = $1,
              interests = $2,
              skill_level = $3,
              weekly_goal_hours = $4,
              updated_at = CURRENT_TIMESTAMP

            WHERE user_id = $5

            RETURNING *
          `,
          [
            learningGoal || null,
            interests || [],
            skillLevel || null,
            weeklyGoalHours
              ? Number(weeklyGoalHours)
              : null,
            userId,
          ]
        );

      return res.status(200).json({
        success: true,
        message:
          "Learning preferences updated successfully",
        profile: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update learning preferences error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update learning preferences",
      });
    }
  };

/* =========================================================
   UPDATE NOTIFICATION PREFERENCES
========================================================= */

const updateNotificationPreferences =
  async (req, res) => {
    try {
      const userId = req.user.id;

      const {
        emailReminders,
        quizReminders,
        streakReminders,
        weeklyProgressReports,
      } = req.body;

      await ensureProfileExists(userId);

      const result =
        await pool.query(
          `
            UPDATE student_profiles

            SET
              email_reminders = $1,
              quiz_reminders = $2,
              streak_reminders = $3,
              weekly_progress_reports = $4,
              updated_at = CURRENT_TIMESTAMP

            WHERE user_id = $5

            RETURNING *
          `,
          [
            Boolean(emailReminders),
            Boolean(quizReminders),
            Boolean(streakReminders),
            Boolean(weeklyProgressReports),
            userId,
          ]
        );

      return res.status(200).json({
        success: true,
        message:
          "Notification preferences updated successfully",
        profile: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update notification preferences error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update notification preferences",
      });
    }
  };

/* =========================================================
   UPDATE DASHBOARD PERSONALIZATION
========================================================= */

const updateDashboardPersonalization =
  async (req, res) => {
    try {
      const userId = req.user.id;

      const {
        recommendedQuizzes,
        learningPathSuggestions,
        progressTracking,
        achievementBadges,
        leaderboardParticipation,
      } = req.body;

      await ensureProfileExists(userId);

      const result =
        await pool.query(
          `
            UPDATE student_profiles

            SET
              recommended_quizzes = $1,
              learning_path_suggestions = $2,
              progress_tracking = $3,
              achievement_badges = $4,
              leaderboard_participation = $5,
              updated_at = CURRENT_TIMESTAMP

            WHERE user_id = $6

            RETURNING *
          `,
          [
            Boolean(recommendedQuizzes),
            Boolean(learningPathSuggestions),
            Boolean(progressTracking),
            Boolean(achievementBadges),
            Boolean(leaderboardParticipation),
            userId,
          ]
        );

      return res.status(200).json({
        success: true,
        message:
          "Dashboard personalization updated successfully",
        profile: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update dashboard personalization error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update dashboard personalization",
      });
    }
  };

module.exports = {
  getMyStudentProfile,
  uploadProfilePicture,
  saveAboutYou,
  saveLearningGoal,
  saveInterests,
  saveSkillLevel,
  saveWeeklyGoal,
  saveNotifications,
  savePersonalization,
  completeOnboarding,
  updateMyStudentProfile,

  updatePersonalInformation,
  updateLearningPreferences,
  updateNotificationPreferences,
  updateDashboardPersonalization,
};
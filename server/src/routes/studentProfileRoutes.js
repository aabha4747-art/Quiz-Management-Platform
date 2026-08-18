const express = require("express");

const {
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
} = require(
  "../controllers/studentProfileController"
);

const {
  authenticate,
  authorizeRoles,
} = require(
  "../middleware/authMiddleware"
);

const profilePictureUpload =
  require(
    "../middleware/profileUploadMiddleware"
  );

const router = express.Router();

/* =========================================================
   PROFILE - GET CURRENT STUDENT PROFILE
========================================================= */

router.get(
  "/profile",
  authenticate,
  authorizeRoles("STUDENT"),
  getMyStudentProfile
);

/* =========================================================
   PROFILE - GENERAL UPDATE
========================================================= */

router.put(
  "/profile",
  authenticate,
  authorizeRoles("STUDENT"),
  updateMyStudentProfile
);

/* =========================================================
   PROFILE PICTURE
========================================================= */

router.post(
  "/profile/picture",
  authenticate,
  authorizeRoles("STUDENT"),
  profilePictureUpload.single(
    "profilePicture"
  ),
  uploadProfilePicture
);

/* =========================================================
   PROFILE EDITING - PERSONAL INFORMATION
========================================================= */

router.put(
  "/profile/personal",
  authenticate,
  authorizeRoles("STUDENT"),
  updatePersonalInformation
);

/* =========================================================
   PROFILE EDITING - LEARNING PREFERENCES
========================================================= */

router.put(
  "/profile/preferences",
  authenticate,
  authorizeRoles("STUDENT"),
  updateLearningPreferences
);

/* =========================================================
   PROFILE EDITING - NOTIFICATION PREFERENCES
========================================================= */

router.put(
  "/profile/notifications",
  authenticate,
  authorizeRoles("STUDENT"),
  updateNotificationPreferences
);

/* =========================================================
   PROFILE EDITING - DASHBOARD PERSONALIZATION
========================================================= */

router.put(
  "/profile/personalization",
  authenticate,
  authorizeRoles("STUDENT"),
  updateDashboardPersonalization
);

/* =========================================================
   ONBOARDING - ABOUT YOU
========================================================= */

router.put(
  "/onboarding/about",
  authenticate,
  authorizeRoles("STUDENT"),
  saveAboutYou
);

/* =========================================================
   ONBOARDING - LEARNING GOAL
========================================================= */

router.put(
  "/onboarding/goal",
  authenticate,
  authorizeRoles("STUDENT"),
  saveLearningGoal
);

/* =========================================================
   ONBOARDING - INTERESTS
========================================================= */

router.put(
  "/onboarding/interests",
  authenticate,
  authorizeRoles("STUDENT"),
  saveInterests
);

/* =========================================================
   ONBOARDING - SKILL LEVEL
========================================================= */

router.put(
  "/onboarding/skill",
  authenticate,
  authorizeRoles("STUDENT"),
  saveSkillLevel
);

/* =========================================================
   ONBOARDING - WEEKLY GOAL
========================================================= */

router.put(
  "/onboarding/weekly-goal",
  authenticate,
  authorizeRoles("STUDENT"),
  saveWeeklyGoal
);

/* =========================================================
   ONBOARDING - NOTIFICATIONS
========================================================= */

router.put(
  "/onboarding/notifications",
  authenticate,
  authorizeRoles("STUDENT"),
  saveNotifications
);

/* =========================================================
   ONBOARDING - PERSONALIZATION
========================================================= */

router.put(
  "/onboarding/personalization",
  authenticate,
  authorizeRoles("STUDENT"),
  savePersonalization
);

/* =========================================================
   ONBOARDING - COMPLETE
========================================================= */

router.post(
  "/onboarding/complete",
  authenticate,
  authorizeRoles("STUDENT"),
  completeOnboarding
);

module.exports = router;
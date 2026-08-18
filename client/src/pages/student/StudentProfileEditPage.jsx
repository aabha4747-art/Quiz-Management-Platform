import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Bell,
  BookOpen,
  Building2,
  Camera,
  Check,
  Clock3,
  GraduationCap,
  MapPin,
  Medal,
  Save,
  School,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserRound,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import api from "../../api/axios";

/* =========================================================
   CONSTANTS
========================================================= */

const API_ORIGIN =
  "http://localhost:5000";

const LEARNING_GOALS = [
  "Prepare for exams",
  "Upskill",
  "Career growth",
  "Certifications",
  "Personal learning",
];

const BIOTECH_INTERESTS = [
  "Cell Biology",
  "Molecular Biology",
  "Genetics",
  "Microbiology",
  "Biochemistry",
  "Bioinformatics",
  "Immunology",
  "Genetic Engineering",
  "Bioprocess Engineering",
  "Pharmaceutical Biotechnology",
  "Environmental Biotechnology",
  "Plant Biotechnology",
];

const SKILL_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const WEEKLY_GOALS = [
  {
    value: 2,
    label: "2 hours",
  },
  {
    value: 5,
    label: "5 hours",
  },
  {
    value: 10,
    label: "10 hours",
  },
  {
    value: 15,
    label: "15+ hours",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getInitials(
  name = "Student"
) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part
        .charAt(0)
        .toUpperCase()
    )
    .join("");
}

function getImageUrl(
  value
) {
  if (!value) {
    return null;
  }

  if (
    value.startsWith("http")
  ) {
    return value;
  }

  return `${API_ORIGIN}${value}`;
}

/* =========================================================
   MAIN PAGE
========================================================= */

function StudentProfileEditPage() {
  const navigate =
    useNavigate();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    savingPersonal,
    setSavingPersonal,
  ] = useState(false);

  const [
    savingPreferences,
    setSavingPreferences,
  ] = useState(false);

  const [
    savingNotifications,
    setSavingNotifications,
  ] = useState(false);

  const [
    savingPersonalization,
    setSavingPersonalization,
  ] = useState(false);

  const [
    uploadingPicture,
    setUploadingPicture,
  ] = useState(false);

  const [
    localPreview,
    setLocalPreview,
  ] = useState(null);

  const [
    personalForm,
    setPersonalForm,
  ] = useState({
    name: "",
    country: "",
    collegeCompany: "",
    degreeProfession: "",
  });

  const [
    preferencesForm,
    setPreferencesForm,
  ] = useState({
    learningGoal: "",
    interests: [],
    skillLevel: "",
    weeklyGoalHours: 5,
  });

  const [
    notificationForm,
    setNotificationForm,
  ] = useState({
    emailReminders: true,
    quizReminders: true,
    streakReminders: true,
    weeklyProgressReports: true,
  });

  const [
    personalizationForm,
    setPersonalizationForm,
  ] = useState({
    recommendedQuizzes: true,
    learningPathSuggestions: true,
    progressTracking: true,
    achievementBadges: true,
    leaderboardParticipation: true,
  });

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  useEffect(() => {
    const loadProfile =
      async () => {
        try {
          setLoading(true);

          const response =
            await api.get(
              "/student/profile"
            );

          const data =
            response.data
              ?.profile;

          if (!data) {
            throw new Error(
              "Profile data missing"
            );
          }

          setProfile(data);

          setPersonalForm({
            name:
              data.name || "",

            country:
              data.country || "",

            collegeCompany:
              data.college_company ||
              "",

            degreeProfession:
              data.degree_profession ||
              "",
          });

          setPreferencesForm({
            learningGoal:
              data.learning_goal ||
              "",

            interests:
              Array.isArray(
                data.interests
              )
                ? data.interests
                : [],

            skillLevel:
              data.skill_level ||
              "",

            weeklyGoalHours:
              Number(
                data.weekly_goal_hours ||
                  5
              ),
          });

          setNotificationForm({
            emailReminders:
              data.email_reminders ??
              true,

            quizReminders:
              data.quiz_reminders ??
              true,

            streakReminders:
              data.streak_reminders ??
              true,

            weeklyProgressReports:
              data.weekly_progress_reports ??
              true,
          });

          setPersonalizationForm({
            recommendedQuizzes:
              data.recommended_quizzes ??
              true,

            learningPathSuggestions:
              data.learning_path_suggestions ??
              true,

            progressTracking:
              data.progress_tracking ??
              true,

            achievementBadges:
              data.achievement_badges ??
              true,

            leaderboardParticipation:
              data.leaderboard_participation ??
              true,
          });
        } catch (error) {
          console.error(
            "Load profile error:",
            error
          );

          toast.error(
            error.response?.data
              ?.message ||
              "Unable to load profile."
          );
        } finally {
          setLoading(false);
        }
      };

    loadProfile();
  }, []);

  /* =======================================================
     AVATAR
  ======================================================= */

  const profilePicture =
    useMemo(() => {
      if (localPreview) {
        return localPreview;
      }

      return getImageUrl(
        profile
          ?.profile_picture_url
      );
    }, [
      localPreview,
      profile,
    ]);

  /* =======================================================
     PERSONAL FORM
  ======================================================= */

  const updatePersonalField = (
    field,
    value
  ) => {
    setPersonalForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  /* =======================================================
     PREFERENCES FORM
  ======================================================= */

  const updatePreferenceField = (
    field,
    value
  ) => {
    setPreferencesForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  const toggleInterest = (
    interest
  ) => {
    setPreferencesForm(
      (current) => {
        const exists =
          current.interests.includes(
            interest
          );

        return {
          ...current,

          interests: exists
            ? current.interests.filter(
                (item) =>
                  item !== interest
              )
            : [
                ...current.interests,
                interest,
              ],
        };
      }
    );
  };

  /* =======================================================
     PROFILE PICTURE UPLOAD
  ======================================================= */

  const handlePictureChange =
    async (
      event
    ) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          file.type
        )
      ) {
        toast.error(
          "Please choose a JPG, PNG or WEBP image."
        );

        event.target.value =
          "";

        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        toast.error(
          "Profile picture must be smaller than 5 MB."
        );

        event.target.value =
          "";

        return;
      }

      const preview =
        URL.createObjectURL(
          file
        );

      setLocalPreview(
        preview
      );

      try {
        setUploadingPicture(
          true
        );

        const uploadData =
          new FormData();

        uploadData.append(
          "profilePicture",
          file
        );

        const response =
          await api.post(
            "/student/profile/picture",
            uploadData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        const uploadedUrl =
          response.data
            ?.profilePictureUrl;

        if (!uploadedUrl) {
          throw new Error(
            "Profile picture URL missing"
          );
        }

        setProfile(
          (current) => ({
            ...current,
            profile_picture_url:
              uploadedUrl,
          })
        );

        toast.success(
          "Profile picture updated."
        );
      } catch (error) {
        console.error(
          "Profile picture upload error:",
          error
        );

        setLocalPreview(null);

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to upload profile picture."
        );
      } finally {
        setUploadingPicture(
          false
        );

        event.target.value =
          "";
      }
    };

  /* =======================================================
     SAVE PERSONAL
  ======================================================= */

  const savePersonalInformation =
    async () => {
      const name =
        personalForm.name.trim();

      const country =
        personalForm.country.trim();

      const collegeCompany =
        personalForm.collegeCompany.trim();

      const degreeProfession =
        personalForm.degreeProfession.trim();

      if (
        !name ||
        !country ||
        !collegeCompany ||
        !degreeProfession
      ) {
        toast.error(
          "Please complete all personal information fields."
        );

        return;
      }

      try {
        setSavingPersonal(
          true
        );

        await api.put(
          "/student/profile/personal",
          {
            name,
            country,
            collegeCompany,
            degreeProfession,
          }
        );

        setProfile(
          (current) => ({
            ...current,
            name,
            country,
            college_company:
              collegeCompany,
            degree_profession:
              degreeProfession,
          })
        );

        toast.success(
          "Personal information saved."
        );
      } catch (error) {
        console.error(
          "Save personal information error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to save personal information."
        );
      } finally {
        setSavingPersonal(
          false
        );
      }
    };

  /* =======================================================
     SAVE LEARNING PREFERENCES
  ======================================================= */

  const saveLearningPreferences =
    async () => {
      if (
        !preferencesForm.learningGoal
      ) {
        toast.error(
          "Choose a learning goal."
        );

        return;
      }

      if (
        preferencesForm.interests
          .length === 0
      ) {
        toast.error(
          "Choose at least one biotechnology interest."
        );

        return;
      }

      if (
        !preferencesForm.skillLevel
      ) {
        toast.error(
          "Choose your skill level."
        );

        return;
      }

      try {
        setSavingPreferences(
          true
        );

        await api.put(
          "/student/profile/preferences",
          {
            learningGoal:
              preferencesForm.learningGoal,

            interests:
              preferencesForm.interests,

            skillLevel:
              preferencesForm.skillLevel,

            weeklyGoalHours:
              preferencesForm.weeklyGoalHours,
          }
        );

        toast.success(
          "Learning preferences saved."
        );
      } catch (error) {
        console.error(
          "Save learning preferences error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to save learning preferences."
        );
      } finally {
        setSavingPreferences(
          false
        );
      }
    };

  /* =======================================================
     SAVE NOTIFICATIONS
  ======================================================= */

  const saveNotificationPreferences =
    async () => {
      try {
        setSavingNotifications(
          true
        );

        await api.put(
          "/student/profile/notifications",
          notificationForm
        );

        toast.success(
          "Notification preferences saved."
        );
      } catch (error) {
        console.error(
          "Save notifications error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to save notification preferences."
        );
      } finally {
        setSavingNotifications(
          false
        );
      }
    };

  /* =======================================================
     SAVE PERSONALIZATION
  ======================================================= */

  const saveDashboardPersonalization =
    async () => {
      try {
        setSavingPersonalization(
          true
        );

        await api.put(
          "/student/profile/personalization",
          personalizationForm
        );

        toast.success(
          "Dashboard personalization saved."
        );
      } catch (error) {
        console.error(
          "Save personalization error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to save dashboard personalization."
        );
      } finally {
        setSavingPersonalization(
          false
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="p-5 sm:p-8">
        <div className="mx-auto max-w-[1250px]">
          <div className="h-36 animate-pulse rounded-3xl bg-slate-200" />

          <div className="mt-6 h-96 animate-pulse rounded-3xl bg-slate-200" />
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="p-5 sm:p-8">
      <div className="mx-auto max-w-[1250px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                to="/student/profile"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-teal-700"
              >
                <ArrowLeft
                  size={17}
                />

                Back to profile
              </Link>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-teal-700">
                Profile settings
              </p>

              <h1 className="mt-2 text-3xl font-black text-slate-950">
                Edit your profile
              </h1>

              <p className="mt-3 max-w-2xl text-slate-500">
                Update your personal details, biotechnology learning preferences and BioNova settings.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/student/profile"
                )
              }
              className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </section>

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <SectionTitle
            icon={UserRound}
            eyebrow="Account"
            title="Personal information"
            description="Update the information shown on your BioNova profile."
          />

          {/* PROFILE PICTURE */}

          <div className="mt-7 rounded-2xl bg-slate-50 p-5">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-2xl font-black text-white ring-4 ring-white shadow">
                  {profilePicture ? (
                    <img
                      src={
                        profilePicture
                      }
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(
                      personalForm.name
                    )
                  )}
                </div>

                <label
                  htmlFor="edit-profile-picture"
                  className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-teal-600 text-white shadow transition hover:bg-teal-700"
                >
                  {uploadingPicture ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <Camera
                      size={17}
                    />
                  )}

                  <input
                    id="edit-profile-picture"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={
                      handlePictureChange
                    }
                    disabled={
                      uploadingPicture
                    }
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-center sm:text-left">
                <p className="font-black text-slate-950">
                  Profile picture
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Click the camera icon to change your profile picture.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  JPG, PNG or WEBP · Maximum 5 MB
                </p>
              </div>
            </div>
          </div>

          {/* PERSONAL FIELDS */}

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <TextField
              label="Full name"
              icon={UserRound}
              value={
                personalForm.name
              }
              placeholder="Your full name"
              onChange={(event) =>
                updatePersonalField(
                  "name",
                  event.target.value
                )
              }
            />

            <TextField
              label="Country"
              icon={MapPin}
              value={
                personalForm.country
              }
              placeholder="India"
              onChange={(event) =>
                updatePersonalField(
                  "country",
                  event.target.value
                )
              }
            />

            <TextField
              label="College / Company"
              icon={Building2}
              value={
                personalForm.collegeCompany
              }
              placeholder="Your college or company"
              onChange={(event) =>
                updatePersonalField(
                  "collegeCompany",
                  event.target.value
                )
              }
            />

            <TextField
              label="Degree / Profession"
              icon={School}
              value={
                personalForm.degreeProfession
              }
              placeholder="B.E. Biotechnology"
              onChange={(event) =>
                updatePersonalField(
                  "degreeProfession",
                  event.target.value
                )
              }
            />
          </div>

          <div className="mt-6 flex justify-end">
            <SaveButton
              loading={
                savingPersonal
              }
              label="Save personal information"
              onClick={
                savePersonalInformation
              }
            />
          </div>
        </section>

        {/* =================================================
            LEARNING PREFERENCES
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <SectionTitle
            icon={BookOpen}
            eyebrow="Learning"
            title="Learning preferences"
            description="Personalize BioNova around your biotechnology learning goals."
          />

          {/* LEARNING GOAL */}

          <div className="mt-7">
            <FieldLabel>
              Learning goal
            </FieldLabel>

            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {LEARNING_GOALS.map(
                (goal) => (
                  <ChoiceCard
                    key={goal}
                    selected={
                      preferencesForm.learningGoal ===
                      goal
                    }
                    label={goal}
                    onClick={() =>
                      updatePreferenceField(
                        "learningGoal",
                        goal
                      )
                    }
                  />
                )
              )}
            </div>
          </div>

          {/* INTERESTS */}

          <div className="mt-8">
            <FieldLabel>
              Biotechnology interests
            </FieldLabel>

            <p className="mt-2 text-sm text-slate-500">
              Choose all areas you are interested in.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {BIOTECH_INTERESTS.map(
                (interest) => {
                  const selected =
                    preferencesForm.interests.includes(
                      interest
                    );

                  return (
                    <ChoiceCard
                      key={
                        interest
                      }
                      selected={
                        selected
                      }
                      label={
                        interest
                      }
                      onClick={() =>
                        toggleInterest(
                          interest
                        )
                      }
                    />
                  );
                }
              )}
            </div>
          </div>

          {/* SKILL LEVEL */}

          <div className="mt-8">
            <FieldLabel>
              Skill level
            </FieldLabel>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {SKILL_LEVELS.map(
                (level) => (
                  <ChoiceCard
                    key={
                      level
                    }
                    selected={
                      preferencesForm.skillLevel ===
                      level
                    }
                    label={
                      level
                    }
                    onClick={() =>
                      updatePreferenceField(
                        "skillLevel",
                        level
                      )
                    }
                  />
                )
              )}
            </div>
          </div>

          {/* WEEKLY GOAL */}

          <div className="mt-8">
            <FieldLabel>
              Weekly learning goal
            </FieldLabel>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {WEEKLY_GOALS.map(
                (goal) => (
                  <button
                    key={
                      goal.value
                    }
                    type="button"
                    onClick={() =>
                      updatePreferenceField(
                        "weeklyGoalHours",
                        goal.value
                      )
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      Number(
                        preferencesForm.weeklyGoalHours
                      ) ===
                      goal.value
                        ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100"
                        : "border-slate-200 hover:border-teal-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          Number(
                            preferencesForm.weeklyGoalHours
                          ) ===
                          goal.value
                            ? "bg-teal-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Clock3
                          size={19}
                        />
                      </div>

                      <p className="font-black text-slate-950">
                        {
                          goal.label
                        }
                      </p>
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mt-7 flex justify-end">
            <SaveButton
              loading={
                savingPreferences
              }
              label="Save learning preferences"
              onClick={
                saveLearningPreferences
              }
            />
          </div>
        </section>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <SectionTitle
            icon={Bell}
            eyebrow="Reminders"
            title="Notification preferences"
            description="Choose how BioNova should help you stay consistent."
          />

          <div className="mt-7 space-y-3">
            <ToggleRow
              icon={Bell}
              title="Email reminders"
              description="Receive biotechnology learning reminders by email."
              checked={
                notificationForm.emailReminders
              }
              onChange={(value) =>
                setNotificationForm(
                  (current) => ({
                    ...current,
                    emailReminders:
                      value,
                  })
                )
              }
            />

            <ToggleRow
              icon={BookOpen}
              title="Quiz reminders"
              description="Receive reminders about available biotechnology quizzes."
              checked={
                notificationForm.quizReminders
              }
              onChange={(value) =>
                setNotificationForm(
                  (current) => ({
                    ...current,
                    quizReminders:
                      value,
                  })
                )
              }
            />

            <ToggleRow
              icon={Target}
              title="Daily streak reminders"
              description="Receive reminders to maintain your BioNova learning streak."
              checked={
                notificationForm.streakReminders
              }
              onChange={(value) =>
                setNotificationForm(
                  (current) => ({
                    ...current,
                    streakReminders:
                      value,
                  })
                )
              }
            />

            <ToggleRow
              icon={Medal}
              title="Weekly progress reports"
              description="Receive a summary of your biotechnology learning progress."
              checked={
                notificationForm.weeklyProgressReports
              }
              onChange={(value) =>
                setNotificationForm(
                  (current) => ({
                    ...current,
                    weeklyProgressReports:
                      value,
                  })
                )
              }
            />
          </div>

          <div className="mt-7 flex justify-end">
            <SaveButton
              loading={
                savingNotifications
              }
              label="Save notification preferences"
              onClick={
                saveNotificationPreferences
              }
            />
          </div>
        </section>

        {/* =================================================
            DASHBOARD PERSONALIZATION
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <SectionTitle
            icon={Settings2}
            eyebrow="Dashboard"
            title="Dashboard personalization"
            description="Choose the BioNova features that should appear in your learning experience."
          />

          <div className="mt-7 space-y-3">
            <ToggleRow
              icon={Sparkles}
              title="Recommended quizzes"
              description="Show biotechnology quizzes based on your selected interests."
              checked={
                personalizationForm.recommendedQuizzes
              }
              onChange={(value) =>
                setPersonalizationForm(
                  (current) => ({
                    ...current,
                    recommendedQuizzes:
                      value,
                  })
                )
              }
            />

            <ToggleRow
              icon={Target}
              title="Learning path suggestions"
              description="Suggest biotechnology topics and quizzes to attempt next."
              checked={
                personalizationForm.learningPathSuggestions
              }
              onChange={(value) =>
                setPersonalizationForm(
                  (current) => ({
                    ...current,
                    learningPathSuggestions:
                      value,
                  })
                )
              }
            />

            <ToggleRow
              icon={GraduationCap}
              title="Progress tracking"
              description="Track your performance across biotechnology subjects."
              checked={
                personalizationForm.progressTracking
              }
              onChange={(value) =>
                setPersonalizationForm(
                  (current) => ({
                    ...current,
                    progressTracking:
                      value,
                  })
                )
              }
            />

            <ToggleRow
              icon={Trophy}
              title="Achievement badges"
              description="Earn badges for biotechnology learning milestones."
              checked={
                personalizationForm.achievementBadges
              }
              onChange={(value) =>
                setPersonalizationForm(
                  (current) => ({
                    ...current,
                    achievementBadges:
                      value,
                  })
                )
              }
            />

            <ToggleRow
              icon={ShieldCheck}
              title="Leaderboard participation"
              description="Include your assessment performance in BioNova rankings."
              checked={
                personalizationForm.leaderboardParticipation
              }
              onChange={(value) =>
                setPersonalizationForm(
                  (current) => ({
                    ...current,
                    leaderboardParticipation:
                      value,
                  })
                )
              }
            />
          </div>

          <div className="mt-7 flex justify-end">
            <SaveButton
              loading={
                savingPersonalization
              }
              label="Save dashboard settings"
              onClick={
                saveDashboardPersonalization
              }
            />
          </div>
        </section>

        {/* =================================================
            BOTTOM ACTION
        ================================================= */}

        <div className="mt-6 flex justify-end pb-8">
          <Link
            to="/student/profile"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-slate-800"
          >
            <ArrowLeft
              size={17}
            />

            Back to My Profile
          </Link>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        <Icon
          size={22}
        />
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-950">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function FieldLabel({
  children,
}) {
  return (
    <p className="text-sm font-black text-slate-800">
      {children}
    </p>
  );
}

function TextField({
  label,
  icon: Icon,
  ...props
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          {...props}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        />
      </div>
    </div>
  );
}

function ChoiceCard({
  selected,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100"
          : "border-slate-200 hover:border-teal-200 hover:bg-slate-50"
      }`}
    >
      <span className="font-black text-slate-900">
        {label}
      </span>

      {selected && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-white">
          <Check
            size={15}
          />
        </div>
      )}
    </button>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
        <Icon
          size={20}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-black text-slate-950">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        aria-pressed={
          checked
        }
        onClick={() =>
          onChange(
            !checked
          )
        }
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked
            ? "bg-teal-600"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SaveButton({
  loading,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      disabled={
        loading
      }
      onClick={
        onClick
      }
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

          Saving...
        </>
      ) : (
        <>
          <Save
            size={17}
          />

          {label}
        </>
      )}
    </button>
  );
}

export default StudentProfileEditPage;
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  Code2,
  Dna,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  Leaf,
  MapPin,
  Medal,
  Microscope,
  Network,
  Rocket,
  School,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TestTubeDiagonal,
  Trophy,
  Zap,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import api from "../../api/axios";

const TOTAL_STEPS = 7;

/* =========================================================
   LEARNING GOALS
========================================================= */

const LEARNING_GOALS = [
  {
    value: "Prepare for exams",
    title: "Prepare for exams",
    description:
      "Strengthen biotechnology concepts and practice assessment-style questions.",
    icon: GraduationCap,
  },
  {
    value: "Upskill",
    title: "Upskill",
    description:
      "Build deeper biotechnology knowledge and improve your technical understanding.",
    icon: Sparkles,
  },
  {
    value: "Career growth",
    title: "Career growth",
    description:
      "Strengthen biotechnology knowledge that supports internships and career opportunities.",
    icon: Rocket,
  },
  {
    value: "Certifications",
    title: "Certifications",
    description:
      "Prepare for assessments and build a stronger learning record.",
    icon: Medal,
  },
  {
    value: "Personal learning",
    title: "Personal learning",
    description:
      "Explore biotechnology topics you are curious about at your own pace.",
    icon: BookOpen,
  },
];

/* =========================================================
   BIOTECHNOLOGY INTERESTS
========================================================= */

const INTEREST_OPTIONS = [
  {
    value: "Cell Biology",
    icon: Microscope,
  },
  {
    value: "Molecular Biology",
    icon: Dna,
  },
  {
    value: "Genetics",
    icon: Network,
  },
  {
    value: "Microbiology",
    icon: TestTubeDiagonal,
  },
  {
    value: "Biochemistry",
    icon: FlaskConical,
  },
  {
    value: "Bioinformatics",
    icon: Code2,
  },
  {
    value: "Immunology",
    icon: ShieldCheck,
  },
  {
    value: "Genetic Engineering",
    icon: Dna,
  },
  {
    value: "Bioprocess Engineering",
    icon: Settings2,
  },
  {
    value: "Pharmaceutical Biotechnology",
    icon: HeartPulse,
  },
  {
    value: "Environmental Biotechnology",
    icon: Leaf,
  },
  {
    value: "Plant Biotechnology",
    icon: Leaf,
  },
];

/* =========================================================
   SKILL LEVELS
========================================================= */

const SKILL_LEVELS = [
  {
    value: "Beginner",
    title: "Beginner",
    description:
      "I am building my biotechnology foundations and want clear explanations.",
  },
  {
    value: "Intermediate",
    title: "Intermediate",
    description:
      "I understand the basics and want to strengthen my biotechnology knowledge.",
  },
  {
    value: "Advanced",
    title: "Advanced",
    description:
      "I am comfortable with core biotechnology concepts and want more challenging assessments.",
  },
];

/* =========================================================
   WEEKLY GOALS
========================================================= */

const WEEKLY_GOALS = [
  {
    value: 2,
    title: "2 hours",
    description:
      "Light and flexible",
  },
  {
    value: 5,
    title: "5 hours",
    description:
      "Balanced weekly progress",
  },
  {
    value: 10,
    title: "10 hours",
    description:
      "Strong learning momentum",
  },
  {
    value: 15,
    title: "15+ hours",
    description:
      "Intensive biotechnology learning",
  },
];

/* =========================================================
   MAIN PAGE
========================================================= */

function StudentOnboardingPage() {
  const navigate =
    useNavigate();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    step,
    setStep,
  ] = useState(1);

  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState({
    profilePictureUrl: "",

    country: "",
    collegeCompany: "",
    degreeProfession: "",

    learningGoal: "",

    interests: [],

    skillLevel: "",

    weeklyGoalHours: null,

    emailReminders: true,
    quizReminders: true,
    streakReminders: true,
    weeklyProgressReports: true,

    recommendedQuizzes: true,
    learningPathSuggestions: true,
    progressTracking: true,
    achievementBadges: true,
    leaderboardParticipation: true,
  });

  /* =======================================================
     LOAD EXISTING PROFILE
  ======================================================= */

  useEffect(() => {
    const loadProfile =
      async () => {
        try {
          const response =
            await api.get(
              "/student/profile"
            );

          const data =
            response.data
              ?.profile || null;

          setProfile(data);

          if (data) {
            setForm({
              profilePictureUrl:
                data.profile_picture_url ||
                "",

              country:
                data.country || "",

              collegeCompany:
                data.college_company ||
                "",

              degreeProfession:
                data.degree_profession ||
                "",

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
                data.weekly_goal_hours
                  ? Number(
                      data.weekly_goal_hours
                    )
                  : null,

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

            const savedStep =
              Number(
                data.onboarding_step ||
                  1
              );

            const safeStep =
              Math.min(
                Math.max(
                  savedStep,
                  1
                ),
                TOTAL_STEPS
              );

            setStep(
              safeStep
            );
          }
        } catch (error) {
          console.error(
            "Onboarding load error:",
            error
          );

          toast.error(
            error.response?.data
              ?.message ||
              "Unable to load onboarding."
          );
        } finally {
          setLoading(false);
        }
      };

    loadProfile();
  }, []);

  /* =======================================================
     PROGRESS
  ======================================================= */

  const progress =
    useMemo(
      () =>
        Math.round(
          (step /
            TOTAL_STEPS) *
            100
        ),
      [step]
    );

  /* =======================================================
     FORM HELPERS
  ======================================================= */

  const updateField = (
    key,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,
        [key]: value,
      })
    );
  };

  const toggleInterest = (
    value
  ) => {
    setForm(
      (current) => {
        const exists =
          current.interests.includes(
            value
          );

        return {
          ...current,

          interests: exists
            ? current.interests.filter(
                (item) =>
                  item !== value
              )
            : [
                ...current.interests,
                value,
              ],
        };
      }
    );
  };

  /* =======================================================
     CONTINUE
  ======================================================= */

  const handleContinue =
    async () => {
      try {
        setSaving(true);

        /* STEP 1 */

        if (step === 1) {
          if (
            !form.country.trim() ||
            !form.collegeCompany.trim() ||
            !form.degreeProfession.trim()
          ) {
            toast.error(
              "Country, college/company and degree/profession are required."
            );

            return;
          }

          await api.put(
            "/student/onboarding/about",
            {
              profilePictureUrl:
                form.profilePictureUrl ||
                null,

              country:
                form.country.trim(),

              collegeCompany:
                form.collegeCompany.trim(),

              degreeProfession:
                form.degreeProfession.trim(),
            }
          );

          setStep(2);

          toast.success(
            "Personal information saved."
          );

          return;
        }

        /* STEP 2 */

        if (step === 2) {
          if (
            !form.learningGoal
          ) {
            toast.error(
              "Choose a learning goal."
            );

            return;
          }

          await api.put(
            "/student/onboarding/goal",
            {
              learningGoal:
                form.learningGoal,
            }
          );

          setStep(3);

          return;
        }

        /* STEP 3 */

        if (step === 3) {
          if (
            form.interests.length ===
            0
          ) {
            toast.error(
              "Choose at least one biotechnology area."
            );

            return;
          }

          await api.put(
            "/student/onboarding/interests",
            {
              interests:
                form.interests,
            }
          );

          setStep(4);

          return;
        }

        /* STEP 4 */

        if (step === 4) {
          if (
            !form.skillLevel
          ) {
            toast.error(
              "Choose your skill level."
            );

            return;
          }

          await api.put(
            "/student/onboarding/skill",
            {
              skillLevel:
                form.skillLevel,
            }
          );

          setStep(5);

          return;
        }

        /* STEP 5 */

        if (step === 5) {
          if (
            !form.weeklyGoalHours
          ) {
            toast.error(
              "Choose a weekly learning goal."
            );

            return;
          }

          await api.put(
            "/student/onboarding/weekly-goal",
            {
              weeklyGoalHours:
                form.weeklyGoalHours,
            }
          );

          setStep(6);

          return;
        }

        /* STEP 6 */

        if (step === 6) {
          await api.put(
            "/student/onboarding/notifications",
            {
              emailReminders:
                form.emailReminders,

              quizReminders:
                form.quizReminders,

              streakReminders:
                form.streakReminders,

              weeklyProgressReports:
                form.weeklyProgressReports,
            }
          );

          setStep(7);

          return;
        }

        /* STEP 7 */

        if (step === 7) {
          await api.put(
            "/student/onboarding/personalization",
            {
              recommendedQuizzes:
                form.recommendedQuizzes,

              learningPathSuggestions:
                form.learningPathSuggestions,

              progressTracking:
                form.progressTracking,

              achievementBadges:
                form.achievementBadges,

              leaderboardParticipation:
                form.leaderboardParticipation,
            }
          );

          await api.post(
            "/student/onboarding/complete"
          );

          toast.success(
            "Your BioNova profile is ready!"
          );

          navigate(
            "/student/dashboard",
            {
              replace: true,
            }
          );
        }
      } catch (error) {
        console.error(
          "Onboarding save error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to save this step."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = () => {
    if (step > 1) {
      setStep(
        (current) =>
          current - 1
      );
    }
  };

  /* =======================================================
     SKIP OPTIONAL STEPS
  ======================================================= */

  const handleSkip = () => {
    if (step === 1) {
      toast.error(
        "Please complete your personal information first."
      );

      return;
    }

    navigate(
      "/student/dashboard",
      {
        replace: true,
      }
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600" />

          <p className="mt-4 font-bold text-slate-500">
            Loading your setup...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/50 to-cyan-50">
      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1350px] items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 font-black text-white">
              B
            </div>

            <div>
              <p className="font-black text-slate-950">
                BioNova
              </p>

              <p className="text-xs text-slate-500">
                Biotechnology learning setup
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-teal-700">
              Step {step} of{" "}
              {TOTAL_STEPS}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {progress}% complete
            </p>
          </div>
        </div>

        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </header>

      {/* CONTENT */}

      <div className="mx-auto grid max-w-[1350px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:py-12">
        {/* LEFT PANEL */}

        <aside className="hidden rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950 to-cyan-900 p-8 text-white shadow-xl lg:block">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <FlaskConical
              size={28}
            />
          </div>

          <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
            Personalized biotechnology learning
          </p>

          <h2 className="mt-3 text-3xl font-black leading-tight">
            Build a BioNova
            experience around
            your biotechnology
            interests.
          </h2>

          <p className="mt-4 leading-7 text-slate-300">
            Your preferences help
            BioNova personalize
            biotechnology quizzes,
            learning goals,
            progress tracking and
            recommendations.
          </p>

          <div className="mt-9 space-y-4">
            <SidePoint
              icon={Microscope}
              text="Biotechnology quizzes matched to your interests"
            />

            <SidePoint
              icon={Target}
              text="Learning goals based on your objectives"
            />

            <SidePoint
              icon={Clock3}
              text="Weekly biotechnology learning targets"
            />

            <SidePoint
              icon={Trophy}
              text="Achievements and certificates"
            />
          </div>

          {step > 1 && (
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-bold">
                Short on time?
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                The remaining setup
                is optional. You can
                skip now and continue
                later from your
                Profile page.
              </p>
            </div>
          )}
        </aside>

        {/* FORM */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8 lg:p-10">
          {step === 1 && (
            <AboutStep
              profile={profile}
              form={form}
              updateField={
                updateField
              }
            />
          )}

          {step === 2 && (
            <LearningGoalStep
              value={
                form.learningGoal
              }
              onChange={(value) =>
                updateField(
                  "learningGoal",
                  value
                )
              }
            />
          )}

          {step === 3 && (
            <InterestsStep
              selected={
                form.interests
              }
              toggleInterest={
                toggleInterest
              }
            />
          )}

          {step === 4 && (
            <SkillStep
              value={
                form.skillLevel
              }
              onChange={(value) =>
                updateField(
                  "skillLevel",
                  value
                )
              }
            />
          )}

          {step === 5 && (
            <WeeklyGoalStep
              value={
                form.weeklyGoalHours
              }
              onChange={(value) =>
                updateField(
                  "weeklyGoalHours",
                  value
                )
              }
            />
          )}

          {step === 6 && (
            <NotificationsStep
              form={form}
              updateField={
                updateField
              }
            />
          )}

          {step === 7 && (
            <PersonalizationStep
              form={form}
              updateField={
                updateField
              }
            />
          )}

          {/* FOOTER */}

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
            {step > 1 && (
              <button
                type="button"
                onClick={
                  handleBack
                }
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <ArrowLeft
                  size={17}
                />

                Back
              </button>
            )}

            <div className="flex-1" />

            {step > 1 && (
              <button
                type="button"
                onClick={
                  handleSkip
                }
                disabled={saving}
                className="rounded-xl px-4 py-3 font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50"
              >
                Skip for now
              </button>
            )}

            <button
              type="button"
              onClick={
                handleContinue
              }
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : step ===
                    TOTAL_STEPS
                  ? "Finish setup"
                  : "Continue"}

              {!saving && (
                <ArrowRight
                  size={17}
                />
              )}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   STEP 1 — ABOUT YOU
========================================================= */

function AboutStep({
  profile,
  form,
  updateField,
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Required"
        title="Tell us about yourself"
        description="We only require a few basic details so your BioNova profile feels personal."
      />

      <ProfilePicturePicker
        profile={profile}
        form={form}
        updateField={
          updateField
        }
      />

      <div className="mt-7 grid gap-5">
        <InputField
          label="Country"
          icon={MapPin}
          value={
            form.country
          }
          placeholder="India"
          onChange={(event) =>
            updateField(
              "country",
              event.target.value
            )
          }
        />

        <InputField
          label="College / Company"
          icon={Building2}
          value={
            form.collegeCompany
          }
          placeholder="Your college or company"
          onChange={(event) =>
            updateField(
              "collegeCompany",
              event.target.value
            )
          }
        />

        <InputField
          label="Degree / Profession"
          icon={School}
          value={
            form.degreeProfession
          }
          placeholder="B.E. Biotechnology"
          onChange={(event) =>
            updateField(
              "degreeProfession",
              event.target.value
            )
          }
        />
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex gap-3">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-emerald-700"
          />

          <div>
            <p className="font-bold text-emerald-900">
              This step is required
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-800">
              The remaining personalization
              steps are optional and can be
              completed later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE PICTURE PICKER
========================================================= */

function ProfilePicturePicker({
  profile,
  form,
  updateField,
}) {
  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    localPreview,
    setLocalPreview,
  ] = useState(null);

  const initials =
    (
      profile?.name ||
      "Student"
    )
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase()
      )
      .join("");

  const serverBaseUrl =
    "http://localhost:5000";

  const storedPicture =
    form.profilePictureUrl ||
    profile?.profile_picture_url ||
    "";

  const pictureUrl =
    localPreview ||
    (
      storedPicture
        ? storedPicture.startsWith(
            "http"
          )
          ? storedPicture
          : `${serverBaseUrl}${storedPicture}`
        : null
    );

  const handleImageChange =
    async (
      event
    ) => {
      const file =
        event.target.files?.[0];

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
          "Please select a JPG, PNG or WEBP image."
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
        setUploading(true);

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

        updateField(
          "profilePictureUrl",
          uploadedUrl
        );

        toast.success(
          "Profile picture uploaded successfully."
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
            error.message ||
            "Unable to upload profile picture."
        );
      } finally {
        setUploading(false);

        event.target.value =
          "";
      }
    };

  return (
    <div className="mt-8 rounded-2xl bg-slate-50 p-5">
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-2xl font-black text-white ring-4 ring-white shadow-md">
            {pictureUrl ? (
              <img
                src={
                  pictureUrl
                }
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <label
            htmlFor="profile-picture-input"
            title="Upload profile picture"
            className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-teal-600 text-white shadow-md transition hover:bg-teal-700"
          >
            {uploading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Camera
                size={17}
              />
            )}

            <input
              id="profile-picture-input"
              name="profilePicture"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              disabled={
                uploading
              }
              onChange={
                handleImageChange
              }
              className="hidden"
            />
          </label>
        </div>

        <div className="text-center sm:text-left">
          <p className="text-lg font-black text-slate-950">
            {profile?.name ||
              "Student"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {profile?.email ||
              ""}
          </p>

          <p className="mt-3 text-sm font-semibold text-slate-600">
            {uploading
              ? "Uploading your picture..."
              : pictureUrl
                ? "Click the camera to change your picture."
                : "Click the camera to add a profile picture."}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            JPG, PNG or WEBP · Maximum 5 MB
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STEP 2 — LEARNING GOAL
========================================================= */

function LearningGoalStep({
  value,
  onChange,
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Learning goal"
        title="What do you want to achieve with BioNova?"
        description="Choose the goal that best matches why you want to strengthen your biotechnology knowledge."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {LEARNING_GOALS.map(
          (goal) => (
            <SelectableCard
              key={goal.value}
              selected={
                value ===
                goal.value
              }
              icon={goal.icon}
              title={goal.title}
              description={
                goal.description
              }
              onClick={() =>
                onChange(
                  goal.value
                )
              }
            />
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STEP 3 — BIOTECHNOLOGY INTERESTS
========================================================= */

function InterestsStep({
  selected,
  toggleInterest,
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Biotechnology interests"
        title="Which areas of biotechnology interest you?"
        description="Choose one or more areas. BioNova will use these to personalize your biotechnology quizzes and learning recommendations."
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {INTEREST_OPTIONS.map(
          (item) => {
            const Icon =
              item.icon;

            const active =
              selected.includes(
                item.value
              );

            return (
              <button
                key={
                  item.value
                }
                type="button"
                onClick={() =>
                  toggleInterest(
                    item.value
                  )
                }
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100"
                    : "border-slate-200 hover:border-teal-200 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    active
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon
                    size={20}
                  />
                </div>

                <span className="flex-1 font-black text-slate-900">
                  {
                    item.value
                  }
                </span>

                {active && (
                  <Check
                    size={19}
                    className="text-teal-700"
                  />
                )}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STEP 4 — SKILL LEVEL
========================================================= */

function SkillStep({
  value,
  onChange,
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Biotechnology level"
        title="How would you describe your current biotechnology knowledge?"
        description="This helps BioNova recommend quizzes at a suitable difficulty level."
      />

      <div className="mt-8 grid gap-4">
        {SKILL_LEVELS.map(
          (item) => (
            <SelectableCard
              key={
                item.value
              }
              selected={
                value ===
                item.value
              }
              icon={
                item.value ===
                "Beginner"
                  ? BookOpen
                  : item.value ===
                      "Intermediate"
                    ? Target
                    : Trophy
              }
              title={
                item.title
              }
              description={
                item.description
              }
              onClick={() =>
                onChange(
                  item.value
                )
              }
            />
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STEP 5 — WEEKLY GOAL
========================================================= */

function WeeklyGoalStep({
  value,
  onChange,
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Weekly learning goal"
        title="How much time would you like to spend learning biotechnology each week?"
        description="Choose a realistic target. You can change this later from your profile."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {WEEKLY_GOALS.map(
          (item) => (
            <SelectableCard
              key={
                item.value
              }
              selected={
                Number(value) ===
                item.value
              }
              icon={Clock3}
              title={
                item.title
              }
              description={
                item.description
              }
              onClick={() =>
                onChange(
                  item.value
                )
              }
            />
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STEP 6 — NOTIFICATIONS
========================================================= */

function NotificationsStep({
  form,
  updateField,
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Learning reminders"
        title="How should BioNova help you stay consistent?"
        description="Choose the reminders you would like to receive."
      />

      <div className="mt-8 space-y-3">
        <ToggleRow
          icon={Bell}
          title="Email reminders"
          description="Receive biotechnology learning reminders by email."
          checked={
            form.emailReminders
          }
          onChange={(value) =>
            updateField(
              "emailReminders",
              value
            )
          }
        />

        <ToggleRow
          icon={BookOpen}
          title="Quiz reminders"
          description="Get reminders about available biotechnology quizzes."
          checked={
            form.quizReminders
          }
          onChange={(value) =>
            updateField(
              "quizReminders",
              value
            )
          }
        />

        <ToggleRow
          icon={Zap}
          title="Daily streak reminders"
          description="Receive reminders to maintain your learning streak."
          checked={
            form.streakReminders
          }
          onChange={(value) =>
            updateField(
              "streakReminders",
              value
            )
          }
        />

        <ToggleRow
          icon={Target}
          title="Weekly progress reports"
          description="Receive a summary of your biotechnology learning progress."
          checked={
            form.weeklyProgressReports
          }
          onChange={(value) =>
            updateField(
              "weeklyProgressReports",
              value
            )
          }
        />
      </div>
    </div>
  );
}

/* =========================================================
   STEP 7 — PERSONALIZATION
========================================================= */

function PersonalizationStep({
  form,
  updateField,
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Dashboard personalization"
        title="Personalize your BioNova learning dashboard"
        description="Choose the features you want BioNova to use while supporting your biotechnology learning."
      />

      <div className="mt-8 space-y-3">
        <ToggleRow
          icon={Microscope}
          title="Recommended biotechnology quizzes"
          description="Recommend quizzes based on your selected biotechnology interests."
          checked={
            form.recommendedQuizzes
          }
          onChange={(value) =>
            updateField(
              "recommendedQuizzes",
              value
            )
          }
        />

        <ToggleRow
          icon={ChevronRight}
          title="Learning path suggestions"
          description="Suggest biotechnology topics and quizzes to attempt next."
          checked={
            form.learningPathSuggestions
          }
          onChange={(value) =>
            updateField(
              "learningPathSuggestions",
              value
            )
          }
        />

        <ToggleRow
          icon={Target}
          title="Progress tracking"
          description="Track your performance across biotechnology subjects."
          checked={
            form.progressTracking
          }
          onChange={(value) =>
            updateField(
              "progressTracking",
              value
            )
          }
        />

        <ToggleRow
          icon={Medal}
          title="Achievement badges"
          description="Earn badges for biotechnology learning milestones."
          checked={
            form.achievementBadges
          }
          onChange={(value) =>
            updateField(
              "achievementBadges",
              value
            )
          }
        />

        <ToggleRow
          icon={Trophy}
          title="Leaderboard participation"
          description="Include your assessment performance in BioNova rankings."
          checked={
            form.leaderboardParticipation
          }
          onChange={(value) =>
            updateField(
              "leaderboardParticipation",
              value
            )
          }
        />
      </div>

      <div className="mt-6 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 p-5">
        <div className="flex gap-3">
          <FlaskConical
            size={22}
            className="mt-0.5 shrink-0 text-teal-700"
          />

          <div>
            <p className="font-black text-slate-950">
              Your BioNova setup is almost complete
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Finish setup to save your biotechnology preferences and open your personalized dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function StepHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">
        {eyebrow}
      </p>

      <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950">
        {title}
      </h1>

      <p className="mt-3 max-w-2xl leading-7 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function InputField({
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

function SelectableCard({
  selected,
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-start gap-4 rounded-2xl border p-5 text-left transition ${
        selected
          ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100"
          : "border-slate-200 hover:border-teal-200 hover:bg-slate-50"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
          selected
            ? "bg-teal-600 text-white"
            : "bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700"
        }`}
      >
        <Icon
          size={20}
        />
      </div>

      <div className="flex-1">
        <p className="font-black text-slate-950">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      {selected && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
          <Check
            size={16}
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
        onClick={() =>
          onChange(
            !checked
          )
        }
        aria-pressed={
          checked
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

function SidePoint({
  icon: Icon,
  text,
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
        <Icon
          size={18}
        />
      </div>

      <p className="text-sm font-semibold text-slate-200">
        {text}
      </p>
    </div>
  );
}

export default StudentOnboardingPage;
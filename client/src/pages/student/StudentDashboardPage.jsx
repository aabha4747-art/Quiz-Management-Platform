import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  Award,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Crown,
  Dna,
  Flame,
  FlaskConical,
  Gauge,
  Medal,
  Microscope,
  PlayCircle,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";

import useAuth from "../../hooks/useAuth";

/* =========================================================
   CONSTANTS
========================================================= */

const XP_PER_LEVEL = 500;

const categoryGradients = [
  "from-teal-600 to-cyan-700",
  "from-cyan-600 to-blue-700",
  "from-emerald-600 to-teal-700",
  "from-blue-600 to-indigo-700",
  "from-violet-600 to-fuchsia-700",
];

/* =========================================================
   HELPERS
========================================================= */

function formatTime(seconds) {
  if (
    seconds === null ||
    seconds === undefined
  ) {
    return "—";
  }

  const total = Number(seconds);

  if (Number.isNaN(total)) {
    return "—";
  }

  const minutes =
    Math.floor(total / 60);

  const remainingSeconds =
    total % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function getDifficultyLabel(
  difficulty
) {
  if (difficulty === "EASY") {
    return "Beginner";
  }

  if (difficulty === "MEDIUM") {
    return "Intermediate";
  }

  if (difficulty === "HARD") {
    return "Advanced";
  }

  return difficulty || "Quiz";
}

function calculateLevelFromXP(xp) {
  return (
    Math.floor(
      Number(xp || 0) /
        XP_PER_LEVEL
    ) + 1
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function StudentDashboardPage() {
  const { user } = useAuth();

  const [dashboard, setDashboard] =
    useState(null);

  const [
    profileUser,
    setProfileUser,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  /* =======================================================
     LOAD DASHBOARD + LATEST USER DATA
  ======================================================= */

  useEffect(() => {
    const loadDashboard =
      async () => {
        try {
          const [
            dashboardResponse,
            profileResponse,
          ] = await Promise.all([
            api.get(
              "/student/dashboard"
            ),

            api.get("/auth/me"),
          ]);

          setDashboard(
            dashboardResponse.data
              .dashboard || null
          );

          setProfileUser(
            profileResponse.data.user ||
              null
          );
        } catch (error) {
          toast.error(
            error.response?.data
              ?.message ||
              "Unable to load your dashboard."
          );
        } finally {
          setLoading(false);
        }
      };

    loadDashboard();
  }, []);

  /* =======================================================
     EXISTING DASHBOARD DATA
  ======================================================= */

  const statistics =
    dashboard?.statistics || {};

  const recentAttempts =
    dashboard?.recentAttempts || [];

  const recommendedQuizzes =
    dashboard?.recommendedQuizzes ||
    [];

  const categories =
    dashboard?.categoryPerformance ||
    [];

  const activeAttempt =
    dashboard?.activeAttempt || null;

  /* =======================================================
     GAMIFICATION DATA

     Supports:
     dashboard.gamification
     OR /auth/me user fields
  ======================================================= */

  const gamification =
    dashboard?.gamification || {};

  const totalXP =
    Number(
      gamification.totalXp ??
        gamification.xp ??
        profileUser?.xp ??
        user?.xp ??
        0
    );

  const level =
    Number(
      gamification.level ??
        profileUser?.level ??
        user?.level ??
        calculateLevelFromXP(
          totalXP
        )
    );

  const currentStreak =
    Number(
      gamification.currentStreak ??
        gamification.current_streak ??
        profileUser?.current_streak ??
        profileUser?.currentStreak ??
        user?.current_streak ??
        0
    );

  const longestStreak =
    Number(
      gamification.longestStreak ??
        gamification.longest_streak ??
        profileUser?.longest_streak ??
        profileUser?.longestStreak ??
        user?.longest_streak ??
        0
    );

  const lastQuizDate =
    gamification.lastQuizDate ??
    gamification.last_quiz_date ??
    profileUser?.last_quiz_date ??
    profileUser?.lastQuizDate ??
    null;

  const achievementCount =
    Number(
      dashboard?.achievementCount ??
        dashboard?.achievement_count ??
        dashboard?.achievements
          ?.length ??
        0
    );

  /* =======================================================
     XP PROGRESS
  ======================================================= */

  const xpAtCurrentLevel =
    (level - 1) *
    XP_PER_LEVEL;

  const xpAtNextLevel =
    level * XP_PER_LEVEL;

  const xpInsideLevel =
    Math.max(
      totalXP -
        xpAtCurrentLevel,
      0
    );

  const xpNeededThisLevel =
    XP_PER_LEVEL;

  const xpRemaining =
    Math.max(
      xpAtNextLevel -
        totalXP,
      0
    );

  const levelProgress =
    Math.min(
      Math.max(
        (xpInsideLevel /
          xpNeededThisLevel) *
          100,
        0
      ),
      100
    );

  /* =======================================================
     FIRST NAME
  ======================================================= */

  const firstName =
    profileUser?.name
      ?.trim()
      .split(/\s+/)[0] ||
    user?.name
      ?.trim()
      .split(/\s+/)[0] ||
    "Student";

  /* =======================================================
     STRONGEST CATEGORY
  ======================================================= */

  const strongestCategory =
    useMemo(() => {
      if (!categories.length) {
        return null;
      }

      return [...categories].sort(
        (first, second) =>
          Number(
            second.average_score ||
              0
          ) -
          Number(
            first.average_score ||
              0
          )
      )[0];
    }, [categories]);

  /* =======================================================
     EXISTING PERFORMANCE CARDS
  ======================================================= */

  const cards = [
    {
      label: "Quizzes attempted",

      value:
        statistics.total_quizzes_attempted ??
        0,

      note: `${
        statistics.unique_quizzes_attempted ??
        0
      } unique quizzes`,

      icon: BookOpenCheck,

      iconClass:
        "bg-teal-100 text-teal-700",
    },

    {
      label: "Average score",

      value: `${Number(
        statistics.average_score || 0
      ).toFixed(0)}%`,

      note:
        "Across completed attempts",

      icon: BarChart3,

      iconClass:
        "bg-cyan-100 text-cyan-700",
    },

    {
      label: "Highest score",

      value: `${Number(
        statistics.highest_score || 0
      ).toFixed(0)}%`,

      note:
        "Your personal best",

      icon: Trophy,

      iconClass:
        "bg-amber-100 text-amber-700",
    },

    {
      label: "Success rate",

      value: `${Number(
        statistics.success_rate || 0
      ).toFixed(0)}%`,

      note: `${
        statistics.total_passed ?? 0
      } passed · ${
        statistics.total_failed ?? 0
      } failed`,

      icon: CheckCircle2,

      iconClass:
        "bg-emerald-100 text-emerald-700",
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="p-5 sm:p-8">
      {/* ===================================================
          HERO + LEVEL
      =================================================== */}

      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.75fr]">
        {/* HERO */}

        <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-700 via-cyan-700 to-blue-700 px-7 py-8 text-white shadow-lg sm:px-10">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />

          <div className="absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-white/5" />

          <div className="absolute right-10 top-10 hidden opacity-10 lg:block">
            <Dna size={180} />
          </div>

          <div className="relative max-w-2xl">
            <div className="flex items-center gap-2">
              <FlaskConical
                size={18}
                className="text-cyan-100"
              />

              <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-100">
                Welcome back,{" "}
                {firstName}
              </p>
            </div>

            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
              Continue your
              biotechnology learning
              journey
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-cyan-50">
              Master biotechnology
              concepts through focused
              assessments, build XP,
              maintain your learning
              streak and strengthen your
              scientific knowledge.
            </p>

            {/* MINI GAMIFICATION */}

            <div className="mt-6 flex flex-wrap gap-3">
              <HeroBadge
                icon={Crown}
                text={`Level ${level}`}
              />

              <HeroBadge
                icon={Zap}
                text={`${totalXP} XP`}
              />

              <HeroBadge
                icon={Flame}
                text={`${currentStreak} day streak`}
              />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {activeAttempt ? (
                <Link
                  to={`/student/attempt/${activeAttempt.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-black text-teal-700 transition hover:bg-teal-50"
                >
                  <PlayCircle
                    size={19}
                  />

                  Resume quiz
                </Link>
              ) : (
                <Link
                  to="/student/quizzes"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-black text-teal-700 transition hover:bg-teal-50"
                >
                  <PlayCircle
                    size={19}
                  />

                  Browse quizzes
                </Link>
              )}

              <Link
                to="/student/progress"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                View progress

                <ChevronRight
                  size={18}
                />
              </Link>
            </div>
          </div>
        </article>

        {/* LEVEL CARD */}

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-100">
                  BioNova Level
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  Level {level}
                </h2>

                <p className="mt-2 text-sm text-indigo-100">
                  Keep learning to reach
                  Level {level + 1}
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <Crown size={29} />
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-500">
                  XP progress
                </p>

                <p className="mt-1 text-2xl font-black text-slate-950">
                  {xpInsideLevel}
                  <span className="text-base font-bold text-slate-400">
                    {" "}
                    / {XP_PER_LEVEL}
                  </span>
                </p>
              </div>

              <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">
                {levelProgress.toFixed(
                  0
                )}
                %
              </span>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 transition-all duration-500"
                style={{
                  width: `${levelProgress}%`,
                }}
              />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              <strong className="text-slate-800">
                {xpRemaining} XP
              </strong>{" "}
              until Level {level + 1}
            </p>
          </div>
        </article>
      </section>

      {/* ===================================================
          GAMIFICATION CARDS
      =================================================== */}

      <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <GamificationCard
          icon={Zap}
          label="Total XP"
          value={totalXP}
          note={`Level ${level}`}
          iconClass="bg-yellow-100 text-yellow-700"
        />

        <GamificationCard
          icon={Flame}
          label="Current streak"
          value={`${currentStreak} ${
            currentStreak === 1
              ? "day"
              : "days"
          }`}
          note="Keep learning daily"
          iconClass="bg-orange-100 text-orange-600"
        />

        <GamificationCard
          icon={Trophy}
          label="Longest streak"
          value={`${longestStreak} ${
            longestStreak === 1
              ? "day"
              : "days"
          }`}
          note={
            longestStreak > 0
              ? "Your personal best"
              : "Start your first streak"
          }
          iconClass="bg-cyan-100 text-cyan-700"
        />

        <GamificationCard
          icon={Medal}
          label="Achievements"
          value={achievementCount}
          note={
            achievementCount === 1
              ? "Achievement unlocked"
              : "Achievements unlocked"
          }
          iconClass="bg-violet-100 text-violet-700"
        />
      </section>

      {/* ===================================================
          XP PROGRESS BANNER
      =================================================== */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-cyan-50 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm">
              <Gauge size={24} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">
                Level progression
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                {totalXP} total XP
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Earn XP by completing
                quizzes, answering
                correctly and unlocking
                achievements.
              </p>
            </div>
          </div>

          <div className="w-full lg:max-w-md">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-violet-700">
                Level {level}
              </span>

              <span className="text-slate-500">
                Level {level + 1}
              </span>
            </div>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
                style={{
                  width: `${levelProgress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-right text-xs font-bold text-slate-500">
              {xpInsideLevel} /{" "}
              {XP_PER_LEVEL} XP
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          STREAK STATUS
      =================================================== */}

      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <article className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Flame size={25} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-orange-600">
                Current streak
              </p>

              <p className="mt-1 text-2xl font-black text-orange-950">
                {currentStreak}{" "}
                {currentStreak === 1
                  ? "day"
                  : "days"}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Trophy size={25} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-700">
                Longest streak
              </p>

              <p className="mt-1 text-2xl font-black text-amber-950">
                {longestStreak}{" "}
                {longestStreak === 1
                  ? "day"
                  : "days"}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
              <Clock3 size={25} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-teal-700">
                Last learning day
              </p>

              <p className="mt-1 text-lg font-black text-teal-950">
                {lastQuizDate
                  ? formatDate(
                      lastQuizDate
                    )
                  : "No activity yet"}
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* ===================================================
          ACTIVE ATTEMPT
      =================================================== */}

      {activeAttempt && (
        <section className="mt-6 rounded-2xl border border-teal-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <PlayCircle
                  size={23}
                />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
                  Continue learning
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  {
                    activeAttempt.quiz_title
                  }
                </h2>

                <p className="mt-1 text-slate-600">
                  {
                    activeAttempt.category_name
                  }{" "}
                  ·{" "}
                  {
                    activeAttempt.duration_minutes
                  }{" "}
                  minutes
                </p>
              </div>
            </div>

            <Link
              to={`/student/attempt/${activeAttempt.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-black text-white transition hover:bg-teal-700"
            >
              Resume attempt

              <ChevronRight
                size={18}
              />
            </Link>
          </div>
        </section>
      )}

      {/* ===================================================
          PERFORMANCE STATISTICS
      =================================================== */}

      {loading ? (
        <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl bg-white"
              />
            )
          )}
        </section>
      ) : (
        <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <DashboardStatCard
              key={card.label}
              {...card}
            />
          ))}
        </section>
      )}

      {/* ===================================================
          RECOMMENDATIONS + CATEGORY PERFORMANCE
      =================================================== */}

      <section className="mt-8 grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
        {/* RECOMMENDATIONS */}

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            eyebrow="Explore biotechnology"
            title="Recommended quizzes"
            description="Published biotechnology quizzes you have not completed."
            action={
              <Link
                to="/student/quizzes"
                className="font-bold text-teal-700 hover:text-teal-800"
              >
                View all
              </Link>
            }
          />

          {loading ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {[1, 2].map(
                (item) => (
                  <div
                    key={item}
                    className="h-72 animate-pulse rounded-2xl bg-slate-100"
                  />
                )
              )}
            </div>
          ) : recommendedQuizzes.length ===
            0 ? (
            <div className="mt-6">
              <EmptyState
                icon={Microscope}
                title="You are all caught up"
                message="No new biotechnology quizzes are available right now."
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {recommendedQuizzes
                .slice(0, 4)
                .map(
                  (
                    quiz,
                    index
                  ) => (
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      index={index}
                    />
                  )
                )}
            </div>
          )}
        </article>

        {/* CATEGORY PERFORMANCE */}

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            eyebrow="Subject performance"
            title="Category progress"
            description="Your average score across biotechnology subjects."
          />

          {categories.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={Dna}
                title="No category insights yet"
                message="Complete biotechnology quizzes to unlock subject-level insights."
              />
            </div>
          ) : (
            <div className="mt-7 space-y-6">
              {categories
                .slice(0, 5)
                .map(
                  (
                    category
                  ) => (
                    <ProgressBar
                      key={
                        category.category_id
                      }
                      label={
                        category.category_name
                      }
                      value={
                        category.average_score
                      }
                      attempts={
                        category.attempts
                      }
                    />
                  )
                )}
            </div>
          )}

          {strongestCategory && (
            <div className="mt-7 rounded-2xl bg-teal-50 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-teal-700">
                Strongest subject
              </p>

              <p className="mt-2 font-black text-teal-950">
                {
                  strongestCategory.category_name
                }
              </p>

              <p className="mt-1 text-sm text-teal-800">
                {Number(
                  strongestCategory.average_score ||
                    0
                ).toFixed(0)}
                % average
              </p>
            </div>
          )}
        </article>
      </section>

      {/* ===================================================
          RECENT ATTEMPTS + LEADERBOARD
      =================================================== */}

      <section className="mt-8 grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
        {/* RECENT */}

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            eyebrow="Recent activity"
            title="Latest attempts"
            description="Review your most recent biotechnology quiz results."
            action={
              <Link
                to="/student/attempts"
                className="font-bold text-teal-700 hover:text-teal-800"
              >
                View history
              </Link>
            }
          />

          {loading ? (
            <div className="mt-6 space-y-4">
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-2xl bg-slate-100"
                  />
                )
              )}
            </div>
          ) : recentAttempts.length ===
            0 ? (
            <div className="mt-6">
              <EmptyState
                icon={BookOpenCheck}
                title="No attempts yet"
                message="Start your first biotechnology quiz to see results here."
              />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {recentAttempts
                .slice(0, 4)
                .map(
                  (attempt) => (
                    <AttemptRow
                      key={attempt.id}
                      attempt={
                        attempt
                      }
                    />
                  )
                )}
            </div>
          )}
        </article>

        {/* SIDEBAR */}

        <aside className="space-y-6">
          {/* LEADERBOARD */}

          <article className="rounded-2xl bg-gradient-to-br from-slate-950 via-teal-950 to-cyan-950 p-6 text-white shadow-lg">
            <Trophy
              size={30}
              className="text-amber-300"
            />

            <h2 className="mt-5 text-2xl font-black">
              See how you rank
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Compare your
              biotechnology quiz
              performance, XP and
              learning progress with
              other learners.
            </p>

            <Link
              to="/student/leaderboard"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-black text-teal-900 transition hover:bg-teal-50"
            >
              Open leaderboard

              <ChevronRight
                size={18}
              />
            </Link>
          </article>

          {/* ACHIEVEMENT */}

          <article className="rounded-2xl border border-violet-200 bg-violet-50 p-6">
            <Award
              size={28}
              className="text-violet-700"
            />

            <h2 className="mt-5 text-xl font-black text-violet-950">
              Your achievements
            </h2>

            <p className="mt-3 leading-7 text-violet-700">
              You currently have{" "}
              <strong>
                {achievementCount}
              </strong>{" "}
              unlocked BioNova
              achievement
              {achievementCount === 1
                ? ""
                : "s"}
              .
            </p>
          </article>

          {/* HABIT */}

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Flame
              size={28}
              className="text-orange-500"
            />

            <h2 className="mt-5 text-xl font-black text-slate-950">
              Build a science habit
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Your current learning
              streak is{" "}
              <strong>
                {currentStreak}{" "}
                {currentStreak === 1
                  ? "day"
                  : "days"}
              </strong>
              . Complete a quiz on
              another day to continue
              your streak.
            </p>

            <Link
              to="/student/quizzes"
              className="mt-6 inline-flex items-center gap-2 font-black text-teal-700 hover:text-teal-800"
            >
              Browse quizzes

              <ChevronRight
                size={18}
              />
            </Link>
          </article>
        </aside>
      </section>
    </main>
  );
}

/* =========================================================
   HERO BADGE
========================================================= */

function HeroBadge({
  icon: Icon,
  text,
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black backdrop-blur">
      <Icon size={15} />

      {text}
    </span>
  );
}

/* =========================================================
   GAMIFICATION CARD
========================================================= */

function GamificationCard({
  label,
  value,
  note,
  icon: Icon,
  iconClass,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={21} />
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {note}
      </p>
    </article>
  );
}

/* =========================================================
   NORMAL STAT CARD
========================================================= */

function DashboardStatCard({
  label,
  value,
  note,
  icon: Icon,
  iconClass,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={21} />
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {note}
      </p>
    </article>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-950">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

/* =========================================================
   QUIZ CARD
========================================================= */

function QuizCard({
  quiz,
  index,
}) {
  const gradient =
    categoryGradients[
      index %
        categoryGradients.length
    ];

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <div
        className={`relative h-32 overflow-hidden bg-gradient-to-br ${gradient}`}
      >
        {quiz.thumbnail_url ? (
          <>
            <img
              src={
                quiz.thumbnail_url
              }
              alt={quiz.title}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
          </>
        ) : (
          <Dna
            size={80}
            className="absolute right-4 top-4 text-white/20"
          />
        )}

        <p className="absolute bottom-4 left-4 text-xs font-black uppercase tracking-widest text-white">
          {quiz.category_name}
        </p>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
            {getDifficultyLabel(
              quiz.difficulty
            )}
          </span>

          <span className="text-xs font-semibold text-slate-500">
            {
              quiz.duration_minutes
            }{" "}
            min
          </span>
        </div>

        <h3 className="mt-4 line-clamp-2 text-lg font-black text-slate-950">
          {quiz.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {quiz.description ||
            "Test your biotechnology knowledge with this assessment."}
        </p>

        <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
          <span>
            {quiz.question_count ??
              0}{" "}
            questions
          </span>

          <span>
            {Number(
              quiz.passing_percentage ||
                0
            ).toFixed(0)}
            % pass
          </span>
        </div>

        <Link
          to={`/student/quizzes/${quiz.id}`}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 font-black text-white transition hover:bg-teal-700"
        >
          View quiz

          <ChevronRight
            size={17}
          />
        </Link>
      </div>
    </article>
  );
}

/* =========================================================
   CATEGORY PROGRESS BAR
========================================================= */

function ProgressBar({
  label,
  value,
  attempts,
}) {
  const safeValue = Math.min(
    Math.max(
      Number(value || 0),
      0
    ),
    100
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-black text-slate-800">
            {label}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {attempts ?? 0} attempt
            {Number(
              attempts || 0
            ) === 1
              ? ""
              : "s"}
          </p>
        </div>

        <span className="font-black text-slate-950">
          {safeValue.toFixed(0)}%
        </span>
      </div>

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-600 to-cyan-500"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   ATTEMPT ROW
========================================================= */

function AttemptRow({
  attempt,
}) {
  const passed =
    attempt.status === "PASSED";

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-teal-200 hover:bg-teal-50/30 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            passed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {passed ? (
            <CheckCircle2
              size={22}
            />
          ) : (
            <Target size={22} />
          )}
        </div>

        <div>
          <h3 className="font-black text-slate-950">
            {attempt.quiz_title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {attempt.category_name ||
              "Biotechnology"}{" "}
            ·{" "}
            {formatTime(
              attempt.time_taken_seconds
            )}{" "}
            ·{" "}
            {formatDate(
              attempt.completed_at ||
                attempt.started_at
            )}
          </p>

          {Number(
            attempt.xp_awarded || 0
          ) > 0 && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-black text-violet-700">
              <Zap size={13} />

              +
              {attempt.xp_awarded} XP
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-5 sm:justify-end">
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            passed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {attempt.status}
        </span>

        <p className="text-2xl font-black text-slate-950">
          {Number(
            attempt.percentage || 0
          ).toFixed(0)}
          %
        </p>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon: Icon,
  title,
  message,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <Icon
        size={36}
        className="mx-auto text-teal-500"
      />

      <h3 className="mt-4 font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {message}
      </p>
    </div>
  );
}

export default StudentDashboardPage;
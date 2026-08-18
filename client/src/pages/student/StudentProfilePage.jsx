import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Award,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Crown,
  Flame,
  Mail,
  Medal,
  Pencil,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  Zap,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import toast from "react-hot-toast";

import api from "../../api/axios";

import useAuth from "../../hooks/useAuth";

const XP_PER_LEVEL = 500;

const API_ORIGIN =
  "http://localhost:5000";

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

function getProfilePictureUrl(
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

function formatDate(
  dateValue
) {
  if (!dateValue) {
    return "—";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
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

/* =========================================================
   MAIN PAGE
========================================================= */

function StudentProfilePage() {
  const {
    user,
  } = useAuth();

  const [
    profileUser,
    setProfileUser,
  ] = useState(null);

  const [
    dashboard,
    setDashboard,
  ] = useState(null);

  const [
    certificates,
    setCertificates,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  useEffect(() => {
    const loadProfile =
      async () => {
        try {
          const [
            profileResponse,
            dashboardResponse,
            certificatesResponse,
          ] =
            await Promise.all([
              api.get(
                "/student/profile"
              ),

              api.get(
                "/student/dashboard"
              ),

              api.get(
                "/certificates"
              ),
            ]);

          setProfileUser(
            profileResponse.data
              ?.profile || null
          );

          setDashboard(
            dashboardResponse.data
              ?.dashboard || null
          );

          setCertificates(
            Array.isArray(
              certificatesResponse
                .data
                ?.certificates
            )
              ? certificatesResponse
                  .data
                  .certificates
              : []
          );
        } catch (error) {
          console.error(
            "Profile load error:",
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
     DATA
  ======================================================= */

  const statistics =
    dashboard?.statistics ||
    {};

  const gamification =
    dashboard?.gamification ||
    {};

  const recentAttempts =
    dashboard
      ?.recentAttempts || [];

  const categories =
    dashboard
      ?.categoryPerformance ||
    [];

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
        Math.floor(
          totalXP /
            XP_PER_LEVEL
        ) +
          1
    );

  const currentStreak =
    Number(
      gamification.currentStreak ??
        gamification.current_streak ??
        profileUser?.current_streak ??
        0
    );

  const longestStreak =
    Number(
      gamification.longestStreak ??
        gamification.longest_streak ??
        profileUser?.longest_streak ??
        0
    );

  const achievementCount =
    Number(
      dashboard
        ?.achievementCount ??
        0
    );

  const xpInsideLevel =
    Math.max(
      totalXP -
        (level - 1) *
          XP_PER_LEVEL,
      0
    );

  const xpRemaining =
    Math.max(
      level *
        XP_PER_LEVEL -
        totalXP,
      0
    );

  const levelProgress =
    Math.min(
      Math.max(
        (
          xpInsideLevel /
          XP_PER_LEVEL
        ) *
          100,
        0
      ),
      100
    );

  const strongestCategory =
    useMemo(() => {
      if (!categories.length) {
        return null;
      }

      return [
        ...categories,
      ].sort(
        (
          first,
          second
        ) =>
          Number(
            second.average_score ||
              0
          ) -
          Number(
            first.average_score ||
              0
          )
      )[0];
    }, [
      categories,
    ]);

  const displayName =
    profileUser?.name ||
    user?.name ||
    "Student";

  const displayEmail =
    profileUser?.email ||
    user?.email ||
    "—";

  const profilePicture =
    getProfilePictureUrl(
      profileUser
        ?.profile_picture_url
    );

  const onboardingCompleted =
    Boolean(
      profileUser
        ?.onboarding_completed
    );

  const onboardingStep =
    Number(
      profileUser
        ?.onboarding_step ||
        1
    );

  const onboardingProgress =
    Math.min(
      Math.max(
        Math.round(
          (
            onboardingStep /
            7
          ) *
            100
        ),
        0
      ),
      100
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="p-5 sm:p-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />

          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl bg-slate-200"
                />
              )
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-5 sm:p-8">
      <div className="mx-auto max-w-[1450px]">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-teal-900 to-cyan-700 px-7 py-8 text-white shadow-xl sm:px-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10" />

          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* LEFT PROFILE */}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* AVATAR */}

              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/15 text-4xl font-black shadow-lg backdrop-blur">
                {profilePicture ? (
                  <img
                    src={
                      profilePicture
                    }
                    alt={`${displayName} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(
                    displayName
                  )
                )}
              </div>

              {/* DETAILS */}

              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
                  Student profile
                </p>

                <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                  {displayName}
                </h1>

                <div className="mt-3 flex items-center gap-2 text-cyan-50">
                  <Mail
                    size={16}
                  />

                  <span>
                    {displayEmail}
                  </span>
                </div>

                {/* BADGES */}

                <div className="mt-5 flex flex-wrap gap-2">
                  <ProfileBadge
                    icon={Crown}
                    text={`Level ${level}`}
                  />

                  <ProfileBadge
                    icon={Zap}
                    text={`${totalXP} XP`}
                  />

                  <ProfileBadge
                    icon={Flame}
                    text={`${currentStreak} day streak`}
                  />
                </div>

                {/* EDIT PROFILE */}

                <Link
                  to="/student/profile/edit"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-black text-teal-900 shadow-sm transition hover:bg-teal-50"
                >
                  <Pencil
                    size={17}
                  />

                  Edit Profile
                </Link>
              </div>
            </div>

            {/* RIGHT METRICS */}

            <div className="grid min-w-[280px] grid-cols-2 gap-3">
              <HeroMetric
                label="Certificates"
                value={
                  certificates.length
                }
              />

              <HeroMetric
                label="Achievements"
                value={
                  achievementCount
                }
              />

              <HeroMetric
                label="Quizzes"
                value={
                  statistics.total_quizzes_attempted ??
                  0
                }
              />

              <HeroMetric
                label="Avg score"
                value={`${Number(
                  statistics.average_score ||
                    0
                ).toFixed(0)}%`}
              />
            </div>
          </div>
        </section>

        {/* =================================================
            CONTINUE ONBOARDING
        ================================================= */}

        {!onboardingCompleted && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-cyan-50 p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white">
                  <Sparkles
                    size={24}
                  />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">
                    Profile setup
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Continue your
                    BioNova onboarding
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Finish your
                    learning preferences
                    to improve quiz
                    recommendations,
                    weekly goals and
                    dashboard
                    personalization.
                  </p>
                </div>
              </div>

              <Link
                to="/student/onboarding"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-black text-white transition hover:bg-violet-700"
              >
                Continue onboarding

                <ChevronRight
                  size={18}
                />
              </Link>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-black text-slate-500">
                <span>
                  Step{" "}
                  {onboardingStep} of 7
                </span>

                <span>
                  {
                    onboardingProgress
                  }
                  %
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
                  style={{
                    width: `${onboardingProgress}%`,
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            LEVEL PROGRESS
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-cyan-50 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white">
                <Crown
                  size={24}
                />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">
                  Learning level
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Level {level}
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  {xpRemaining} XP
                  remaining to reach
                  Level {level + 1}
                </p>
              </div>
            </div>

            <div className="w-full lg:max-w-xl">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-violet-700">
                  {xpInsideLevel} XP
                </span>

                <span className="text-slate-500">
                  {XP_PER_LEVEL} XP
                </span>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500"
                  style={{
                    width: `${levelProgress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={
              BookOpenCheck
            }
            label="Quizzes attempted"
            value={
              statistics.total_quizzes_attempted ??
              0
            }
            note={`${statistics.unique_quizzes_attempted ?? 0} unique quizzes`}
            iconClass="bg-teal-100 text-teal-700"
          />

          <StatCard
            icon={BarChart3}
            label="Average score"
            value={`${Number(
              statistics.average_score ||
                0
            ).toFixed(0)}%`}
            note="Across completed attempts"
            iconClass="bg-cyan-100 text-cyan-700"
          />

          <StatCard
            icon={Trophy}
            label="Highest score"
            value={`${Number(
              statistics.highest_score ||
                0
            ).toFixed(0)}%`}
            note="Personal best"
            iconClass="bg-amber-100 text-amber-700"
          />

          <StatCard
            icon={
              CheckCircle2
            }
            label="Success rate"
            value={`${Number(
              statistics.success_rate ||
                0
            ).toFixed(0)}%`}
            note={`${statistics.total_passed ?? 0} passed`}
            iconClass="bg-emerald-100 text-emerald-700"
          />
        </section>

        {/* =================================================
            QUICK INFO
        ================================================= */}

        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          <ProfileInfoCard
            icon={Flame}
            eyebrow="Current streak"
            title={`${currentStreak} ${
              currentStreak === 1
                ? "day"
                : "days"
            }`}
            description={`Longest streak: ${longestStreak} ${
              longestStreak === 1
                ? "day"
                : "days"
            }`}
            iconClass="bg-orange-100 text-orange-600"
          />

          <ProfileInfoCard
            icon={Target}
            eyebrow="Strongest subject"
            title={
              strongestCategory
                ?.category_name ||
              "No data yet"
            }
            description={
              strongestCategory
                ? `${Number(
                    strongestCategory.average_score ||
                      0
                  ).toFixed(0)}% average score`
                : "Complete quizzes to unlock subject insights."
            }
            iconClass="bg-teal-100 text-teal-700"
          />

          <ProfileInfoCard
            icon={Medal}
            eyebrow="Achievements"
            title={`${achievementCount} unlocked`}
            description="Keep completing assessments to unlock more."
            iconClass="bg-violet-100 text-violet-700"
          />
        </section>

        {/* =================================================
            CERTIFICATES + ACCOUNT
        ================================================= */}

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          {/* CERTIFICATES */}

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              eyebrow="Credentials"
              title="My certificates"
              description="Certificates earned from successfully completed BioNova assessments."
              action={
                <Link
                  to="/student/certificates"
                  className="font-black text-teal-700 hover:text-teal-800"
                >
                  View all
                </Link>
              }
            />

            {certificates.length ===
            0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <Award
                  size={34}
                  className="mx-auto text-violet-500"
                />

                <h3 className="mt-4 font-black text-slate-950">
                  No certificates yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Pass a BioNova
                  assessment to earn
                  your first
                  certificate.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {certificates
                  .slice(
                    0,
                    3
                  )
                  .map(
                    (
                      certificate
                    ) => (
                      <CertificateRow
                        key={
                          certificate.id
                        }
                        certificate={
                          certificate
                        }
                      />
                    )
                  )}
              </div>
            )}
          </article>

          {/* RIGHT */}

          <aside className="space-y-6">
            {/* ACCOUNT INFO */}

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <ShieldCheck
                    size={28}
                    className="text-teal-700"
                  />

                  <h2 className="mt-4 text-xl font-black text-slate-950">
                    Account information
                  </h2>
                </div>

                <Link
                  to="/student/profile/edit"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-black text-teal-700 transition hover:border-teal-200 hover:bg-teal-50"
                >
                  <Pencil
                    size={15}
                  />

                  Edit
                </Link>
              </div>

              <div className="mt-5 space-y-4">
                <DetailRow
                  label="Name"
                  value={
                    displayName
                  }
                />

                <DetailRow
                  label="Email"
                  value={
                    displayEmail
                  }
                />

                <DetailRow
                  label="Country"
                  value={
                    profileUser
                      ?.country
                  }
                />

                <DetailRow
                  label="College / Company"
                  value={
                    profileUser
                      ?.college_company
                  }
                />

                <DetailRow
                  label="Degree / Profession"
                  value={
                    profileUser
                      ?.degree_profession
                  }
                />

                <DetailRow
                  label="Learning goal"
                  value={
                    profileUser
                      ?.learning_goal
                  }
                />

                <DetailRow
                  label="Skill level"
                  value={
                    profileUser
                      ?.skill_level
                  }
                />

                <DetailRow
                  label="Weekly goal"
                  value={
                    profileUser
                      ?.weekly_goal_hours
                      ? `${profileUser.weekly_goal_hours} hours`
                      : "—"
                  }
                />

                <DetailRow
                  label="Role"
                  value="Student"
                />

                <DetailRow
                  label="Status"
                  value={
                    profileUser
                      ?.status ||
                    "ACTIVE"
                  }
                />

                <DetailRow
                  label="Member since"
                  value={formatDate(
                    profileUser
                      ?.account_created_at
                  )}
                />
              </div>
            </article>

            {/* KEEP BUILDING */}

            <article className="rounded-2xl bg-gradient-to-br from-slate-950 via-teal-950 to-cyan-950 p-6 text-white">
              <Sparkles
                size={28}
                className="text-cyan-300"
              />

              <h2 className="mt-4 text-xl font-black">
                Keep building your
                profile
              </h2>

              <p className="mt-3 leading-6 text-slate-300">
                Complete more
                biotechnology quizzes,
                earn certificates and
                strengthen your learning
                record.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/student/quizzes"
                  className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-teal-900"
                >
                  Browse quizzes
                </Link>

                <Link
                  to="/student/profile/edit"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-black text-white transition hover:bg-white/20"
                >
                  <Pencil
                    size={16}
                  />

                  Edit profile
                </Link>
              </div>
            </article>
          </aside>
        </section>

        {/* =================================================
            RECENT ACTIVITY
        ================================================= */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            eyebrow="Activity"
            title="Recent learning"
            description="Your latest BioNova assessment activity."
            action={
              <Link
                to="/student/attempts"
                className="font-black text-teal-700 hover:text-teal-800"
              >
                View history
              </Link>
            }
          />

          {recentAttempts.length ===
          0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <UserRound
                size={32}
                className="mx-auto text-slate-400"
              />

              <p className="mt-3 font-bold text-slate-600">
                No recent activity
                yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {recentAttempts
                .slice(
                  0,
                  4
                )
                .map(
                  (
                    attempt
                  ) => (
                    <RecentAttempt
                      key={
                        attempt.id
                      }
                      attempt={
                        attempt
                      }
                    />
                  )
                )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function ProfileBadge({
  icon: Icon,
  text,
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-black backdrop-blur">
      <Icon
        size={14}
      />

      {text}
    </span>
  );
}

function HeroMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <p className="text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-cyan-100">
        {label}
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  iconClass,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon
          size={21}
        />
      </div>

      <p className="mt-4 text-sm text-slate-500">
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

function ProfileInfoCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  iconClass,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon
          size={21}
        />
      </div>

      <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {eyebrow}
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </article>
  );
}

function CertificateRow({
  certificate,
}) {
  return (
    <Link
      to={`/student/certificates/${certificate.id}`}
      className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-violet-200 hover:bg-violet-50/50"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
        <Award
          size={22}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-black text-slate-950">
          {
            certificate.quiz_title
          }
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {
            certificate.certificate_number
          }
        </p>
      </div>

      <div className="text-right">
        <p className="font-black text-teal-700">
          {Number(
            certificate.score ||
              0
          ).toFixed(0)}
          %
        </p>

        <p className="text-xs font-bold text-violet-600">
          Grade{" "}
          {
            certificate.grade
          }
        </p>
      </div>
    </Link>
  );
}

function RecentAttempt({
  attempt,
}) {
  const passed =
    attempt.status ===
    "PASSED";

  return (
    <article className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            passed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {passed ? (
            <CheckCircle2
              size={19}
            />
          ) : (
            <Target
              size={19}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-black text-slate-950">
            {
              attempt.quiz_title
            }
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {
              attempt.category_name
            }{" "}
            ·{" "}
            {formatDate(
              attempt.completed_at ||
                attempt.started_at
            )}
          </p>
        </div>

        <span className="text-lg font-black text-slate-950">
          {Number(
            attempt.percentage ||
              0
          ).toFixed(0)}
          %
        </span>
      </div>
    </article>
  );
}

function DetailRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <strong className="text-right text-sm text-slate-900">
        {value || "—"}
      </strong>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">
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

export default StudentProfilePage;
import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Dna,
  FileQuestion,
  FlaskConical,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Trophy,
  UserRound,
  Users,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import StatCard from "../../components/ui/StatCard";

/* =========================================================
   NAVIGATION
========================================================= */

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Biotech Quizzes",
    href: "/admin/quizzes",
    icon: BookOpen,
  },
  {
    name: "Subjects",
    href: "/admin/categories",
    icon: FolderOpen,
  },
  {
    name: "Students",
    href: "/admin/students",
    icon: Users,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];

/* =========================================================
   HELPERS
========================================================= */

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

function formatDateTime(
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
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboardPage() {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    dashboard,
    setDashboard,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  useEffect(() => {
    const loadDashboard =
      async () => {
        try {
          const response =
            await api.get(
              "/admin/dashboard"
            );

          setDashboard(
            response.data
              ?.dashboard ||
              null
          );
        } catch (error) {
          console.error(
            "Admin dashboard load error:",
            error
          );

          toast.error(
            error.response?.data
              ?.message ||
              "Unable to load the admin dashboard."
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadDashboard();
  }, []);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout =
    async () => {
      try {
        await logout();

        toast.success(
          "Logged out successfully"
        );

        navigate(
          "/login",
          {
            replace: true,
          }
        );
      } catch {
        toast.error(
          "Unable to log out"
        );
      }
    };

  /* =======================================================
     DATA
  ======================================================= */

  const statistics =
    dashboard?.statistics ||
    {};

  const recentStudents =
    Array.isArray(
      dashboard
        ?.recentStudents
    )
      ? dashboard.recentStudents
      : [];

  const recentAttempts =
    Array.isArray(
      dashboard
        ?.recentAttempts
    )
      ? dashboard.recentAttempts
      : [];

  const popularQuizzes =
    Array.isArray(
      dashboard
        ?.popularQuizzes
    )
      ? dashboard.popularQuizzes
      : [];

  const popularCategories =
    Array.isArray(
      dashboard
        ?.popularCategories
    )
      ? dashboard.popularCategories
      : [];

  /* =======================================================
     KPI CARDS
  ======================================================= */

  const cards = [
    {
      title:
        "Total students",

      value:
        statistics.total_students ??
        0,

      subtitle:
        `${
          statistics.active_students ??
          0
        } active`,

      icon: Users,

      iconClassName:
        "bg-teal-100 text-teal-700",
    },

    {
      title:
        "Total quizzes",

      value:
        statistics.total_quizzes ??
        0,

      subtitle:
        `${
          statistics.published_quizzes ??
          0
        } published`,

      icon: BookOpen,

      iconClassName:
        "bg-cyan-100 text-cyan-700",
    },

    {
      title:
        "Total questions",

      value:
        statistics.total_questions ??
        0,

      subtitle:
        "Questions across biotechnology quizzes",

      icon:
        FileQuestion,

      iconClassName:
        "bg-amber-100 text-amber-700",
    },

    {
      title:
        "Total attempts",

      value:
        statistics.total_attempts ??
        0,

      subtitle:
        `${
          statistics.completed_attempts ??
          0
        } completed`,

      icon: Trophy,

      iconClassName:
        "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7faf9]">
      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(
              false
            )
          }
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* BRAND */}

        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 font-black shadow-lg shadow-teal-950/30">
              B
            </div>

            <div>
              <p className="font-black">
                BioNova
              </p>

              <p className="text-xs text-slate-400">
                Biotechnology Admin
              </p>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X
              size={20}
            />
          </button>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-7">
          <p className="mb-4 px-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Management
          </p>

          {navigation.map(
            (
              item,
              index
            ) => {
              const Icon =
                item.icon;

              const active =
                index === 0;

              return (
                <Link
                  key={
                    item.name
                  }
                  to={
                    item.href
                  }
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
                    active
                      ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-950/30"
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    size={20}
                  />

                  {
                    item.name
                  }
                </Link>
              );
            }
          )}
        </nav>

        {/* ADMIN PROFILE */}

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 rounded-2xl border border-white/10 bg-slate-900 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 font-bold">
                {user?.name
                  ?.charAt(
                    0
                  )
                  ?.toUpperCase() ||
                  "A"}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {user?.name ||
                    "BioNova Admin"}
                </p>

                <p className="truncate text-xs text-slate-400">
                  {
                    user?.email
                  }
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut
              size={19}
            />

            Logout
          </button>
        </div>
      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="lg:pl-72">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(
                  true
                )
              }
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 lg:hidden"
            >
              <Menu
                size={21}
              />
            </button>

            <div>
              <p className="text-sm text-slate-500">
                Biotechnology admin
              </p>

              <h1 className="font-black text-slate-950">
                Dashboard
              </h1>
            </div>
          </div>

          <Link
            to="/admin/quizzes/new"
            className="hidden items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white transition hover:bg-teal-700 sm:inline-flex"
          >
            <Plus
              size={18}
            />

            Create biotech quiz
          </Link>
        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main className="p-5 sm:p-8">
          {/* =================================================
              HERO
          ================================================= */}

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-cyan-700 to-blue-700 p-8 text-white shadow-xl sm:p-10">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />

            <div className="absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-cyan-300/10" />

            <div className="absolute right-10 top-8 hidden opacity-10 md:block">
              <Dna
                size={240}
              />
            </div>

            <div className="relative max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <FlaskConical
                    size={18}
                    className="text-cyan-100"
                  />
                </div>

                <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
                  Biotechnology Admin
                </p>
              </div>

              <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Biotechnology Learning Platform
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-cyan-50 sm:text-lg">
                Create quizzes, manage biotechnology subjects, monitor student performance and analyze learning outcomes from one centralized workspace.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/admin/quizzes/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-teal-800 transition hover:bg-teal-50"
                >
                  <Plus
                    size={18}
                  />

                  Create biotech quiz
                </Link>

                <Link
                  to="/admin/categories"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  <FolderOpen
                    size={18}
                  />

                  Manage subjects
                </Link>
              </div>
            </div>
          </section>

          {/* =================================================
              KPI CARDS
          ================================================= */}

          {loading ? (
            <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={
                      item
                    }
                    className="h-40 animate-pulse rounded-2xl bg-white"
                  />
                )
              )}
            </section>
          ) : (
            <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map(
                (card) => (
                  <StatCard
                    key={
                      card.title
                    }
                    {...card}
                  />
                )
              )}
            </section>
          )}

          {/* =================================================
              PLATFORM PERFORMANCE + QUICK ACTIONS
          ================================================= */}

          <section className="mt-8 grid gap-8 xl:grid-cols-[1.4fr_1fr]">
            {/* PLATFORM PERFORMANCE */}

            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                  <BarChart3
                    size={21}
                  />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
                    Analytics
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Platform performance
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Summary of biotechnology quiz activity.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <PerformanceMetric
                  label="Average score"
                  value={`${Number(
                    statistics.average_score ||
                      0
                  ).toFixed(0)}%`}
                  containerClass="bg-teal-50"
                  valueClass="text-teal-700"
                />

                <PerformanceMetric
                  label="Pass rate"
                  value={`${Number(
                    statistics.pass_rate ||
                      0
                  ).toFixed(0)}%`}
                  containerClass="bg-cyan-50"
                  valueClass="text-cyan-700"
                />

                <PerformanceMetric
                  label="Passed attempts"
                  value={
                    statistics.passed_attempts ??
                    0
                  }
                  containerClass="bg-emerald-50"
                  valueClass="text-emerald-700"
                />

                <PerformanceMetric
                  label="Failed attempts"
                  value={
                    statistics.failed_attempts ??
                    0
                  }
                  containerClass="bg-rose-50"
                  valueClass="text-rose-700"
                />

                <PerformanceMetric
                  label="In progress"
                  value={
                    statistics.in_progress_attempts ??
                    0
                  }
                  containerClass="bg-amber-50"
                  valueClass="text-amber-700"
                />

                <PerformanceMetric
                  label="Expired attempts"
                  value={
                    statistics.expired_attempts ??
                    0
                  }
                  containerClass="bg-slate-100"
                  valueClass="text-slate-700"
                />
              </div>
            </article>

            {/* QUICK ACTIONS */}

            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
                Administration
              </p>

              <h2 className="mt-2 text-xl font-black text-slate-950">
                Quick actions
              </h2>

              <div className="mt-6 space-y-3">
                <QuickAction
                  to="/admin/quizzes/new"
                  label="Create biotechnology quiz"
                  icon={Plus}
                />

                <QuickAction
                  to="/admin/categories"
                  label="Manage biotechnology subjects"
                  icon={FolderOpen}
                />

                <QuickAction
                  to="/admin/students"
                  label="View students"
                  icon={Users}
                />

                <QuickAction
                  to="/admin/analytics"
                  label="Open analytics"
                  icon={BarChart3}
                />
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  BioNova is operational and ready for biotechnology quiz creation, student assessment and performance tracking.
                </span>
              </div>
            </article>
          </section>

          {/* =================================================
              RECENT STUDENTS + RECENT ATTEMPTS
          ================================================= */}

          <section className="mt-8 grid gap-8 xl:grid-cols-2">
            {/* RECENT STUDENTS */}

            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <SectionHeading
                eyebrow="Students"
                title="Recent students"
                description="Newest learner accounts registered on BioNova."
                action={
                  <Link
                    to="/admin/students"
                    className="text-sm font-black text-teal-700 hover:text-teal-800"
                  >
                    View all
                  </Link>
                }
              />

              {loading ? (
                <ListSkeleton />
              ) : recentStudents.length ===
                0 ? (
                <EmptyState
                  icon={
                    Users
                  }
                  title="No students yet"
                  description="Registered student accounts will appear here."
                />
              ) : (
                <div className="mt-6 space-y-3">
                  {recentStudents.map(
                    (
                      student
                    ) => (
                      <RecentStudentRow
                        key={
                          student.id
                        }
                        student={
                          student
                        }
                      />
                    )
                  )}
                </div>
              )}
            </article>

            {/* RECENT ATTEMPTS */}

            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <SectionHeading
                eyebrow="Activity"
                title="Recent attempts"
                description="Latest biotechnology quiz attempts across students."
                action={
                  <Link
                    to="/admin/analytics"
                    className="text-sm font-black text-teal-700 hover:text-teal-800"
                  >
                    View analytics
                  </Link>
                }
              />

              {loading ? (
                <ListSkeleton />
              ) : recentAttempts.length ===
                0 ? (
                <EmptyState
                  icon={
                    Clock3
                  }
                  title="No attempts yet"
                  description="Student quiz activity will appear here."
                />
              ) : (
                <div className="mt-6 space-y-3">
                  {recentAttempts.map(
                    (
                      attempt
                    ) => (
                      <RecentAttemptRow
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
            </article>
          </section>

          {/* =================================================
              POPULAR QUIZZES + POPULAR CATEGORIES
          ================================================= */}

          <section className="mt-8 grid gap-8 xl:grid-cols-2">
            {/* POPULAR QUIZZES */}

            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <SectionHeading
                eyebrow="Assessments"
                title="Popular quizzes"
                description="Quizzes receiving the most completed attempts."
                action={
                  <Link
                    to="/admin/quizzes"
                    className="text-sm font-black text-teal-700 hover:text-teal-800"
                  >
                    Manage quizzes
                  </Link>
                }
              />

              {loading ? (
                <ListSkeleton />
              ) : popularQuizzes.length ===
                0 ? (
                <EmptyState
                  icon={
                    BookOpen
                  }
                  title="No quiz activity yet"
                  description="Popular quizzes will appear once students complete assessments."
                />
              ) : (
                <div className="mt-6 space-y-3">
                  {popularQuizzes.map(
                    (
                      quiz,
                      index
                    ) => (
                      <PopularQuizRow
                        key={
                          quiz.id
                        }
                        quiz={
                          quiz
                        }
                        rank={
                          index +
                          1
                        }
                      />
                    )
                  )}
                </div>
              )}
            </article>

            {/* POPULAR CATEGORIES */}

            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <SectionHeading
                eyebrow="Subjects"
                title="Popular subjects"
                description="Biotechnology categories with the most learner activity."
                action={
                  <Link
                    to="/admin/categories"
                    className="text-sm font-black text-teal-700 hover:text-teal-800"
                  >
                    Manage subjects
                  </Link>
                }
              />

              {loading ? (
                <ListSkeleton />
              ) : popularCategories.length ===
                0 ? (
                <EmptyState
                  icon={
                    FolderOpen
                  }
                  title="No subject activity yet"
                  description="Popular subjects will appear once students complete quizzes."
                />
              ) : (
                <div className="mt-6 space-y-3">
                  {popularCategories.map(
                    (
                      category,
                      index
                    ) => (
                      <PopularCategoryRow
                        key={
                          category.id
                        }
                        category={
                          category
                        }
                        rank={
                          index +
                          1
                        }
                      />
                    )
                  )}
                </div>
              )}
            </article>
          </section>

          {/* =================================================
              STUDENT STATUS SUMMARY
          ================================================= */}

          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <SectionHeading
              eyebrow="Accounts"
              title="Student account summary"
              description="Quick overview of active and inactive learner accounts."
              action={
                <Link
                  to="/admin/students"
                  className="text-sm font-black text-teal-700 hover:text-teal-800"
                >
                  Manage students
                </Link>
              }
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <SummaryTile
                label="All students"
                value={
                  statistics.total_students ??
                  0
                }
                className="bg-slate-50 text-slate-900"
              />

              <SummaryTile
                label="Active"
                value={
                  statistics.active_students ??
                  0
                }
                className="bg-emerald-50 text-emerald-700"
              />

              <SummaryTile
                label="Inactive"
                value={
                  statistics.inactive_students ??
                  0
                }
                className="bg-rose-50 text-rose-700"
              />
            </div>
          </section>

          <div className="h-8" />
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   PERFORMANCE METRIC
========================================================= */

function PerformanceMetric({
  label,
  value,
  containerClass,
  valueClass,
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${containerClass}`}
    >
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-black ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  to,
  label,
  icon: Icon,
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 font-bold text-slate-800 transition hover:bg-teal-50 hover:text-teal-700"
    >
      {label}

      <Icon
        size={19}
      />
    </Link>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-xl font-black text-slate-950">
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
   RECENT STUDENT
========================================================= */

function RecentStudentRow({
  student,
}) {
  const active =
    student.status ===
    "ACTIVE";

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-teal-200 hover:bg-teal-50/30">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 font-black text-white">
        {student.name
          ?.charAt(0)
          ?.toUpperCase() ||
          "S"}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-black text-slate-950">
          {student.name}
        </p>

        <p className="mt-1 truncate text-xs text-slate-500">
          {student.email}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Joined{" "}
          {formatDate(
            student.created_at
          )}
        </p>
      </div>

      <span
        className={`rounded-full px-3 py-1 text-xs font-black ${
          active
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-700"
        }`}
      >
        {active
          ? "Active"
          : "Inactive"}
      </span>
    </div>
  );
}

/* =========================================================
   RECENT ATTEMPT
========================================================= */

function RecentAttemptRow({
  attempt,
}) {
  const passed =
    attempt.status ===
    "PASSED";

  const failed =
    attempt.status ===
    "FAILED";

  const score =
    attempt.percentage !==
      null &&
    attempt.percentage !==
      undefined
      ? `${Number(
          attempt.percentage
        ).toFixed(0)}%`
      : "—";

  return (
    <div className="rounded-2xl border border-slate-200 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/30">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            passed
              ? "bg-emerald-100 text-emerald-700"
              : failed
              ? "bg-rose-100 text-rose-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {passed ? (
            <CheckCircle2
              size={20}
            />
          ) : (
            <Clock3
              size={20}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-black text-slate-950">
            {
              attempt.quiz_title
            }
          </p>

          <p className="mt-1 truncate text-sm text-slate-600">
            {
              attempt.student_name
            }
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {attempt.category_name
              ? `${attempt.category_name} · `
              : ""}
            {formatDateTime(
              attempt.completed_at ||
                attempt.started_at
            )}
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-black text-slate-950">
            {score}
          </p>

          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-black ${
              passed
                ? "bg-emerald-100 text-emerald-700"
                : failed
                ? "bg-rose-100 text-rose-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {
              attempt.status
            }
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   POPULAR QUIZ
========================================================= */

function PopularQuizRow({
  quiz,
  rank,
}) {
  return (
    <Link
      to={`/admin/quizzes/${quiz.id}`}
      className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-teal-200 hover:bg-teal-50/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 font-black text-teal-700">
        #{rank}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-black text-slate-950">
          {quiz.title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {
            quiz.category_name
          }
          {quiz.difficulty
            ? ` · ${quiz.difficulty}`
            : ""}
        </p>
      </div>

      <div className="text-right">
        <p className="font-black text-teal-700">
          {quiz.attempt_count ??
            0}
        </p>

        <p className="text-xs text-slate-400">
          attempts
        </p>

        <p className="mt-1 text-xs font-bold text-slate-500">
          {Number(
            quiz.average_score ||
              0
          ).toFixed(0)}
          % avg
        </p>
      </div>
    </Link>
  );
}

/* =========================================================
   POPULAR CATEGORY
========================================================= */

function PopularCategoryRow({
  category,
  rank,
}) {
  return (
    <Link
      to="/admin/categories"
      className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 font-black text-cyan-700">
        #{rank}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-black text-slate-950">
          {
            category.name
          }
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {category.quiz_count ??
            0}{" "}
          quizzes
        </p>
      </div>

      <div className="text-right">
        <p className="font-black text-cyan-700">
          {category.attempt_count ??
            0}
        </p>

        <p className="text-xs text-slate-400">
          attempts
        </p>

        <p className="mt-1 text-xs font-bold text-slate-500">
          {Number(
            category.average_score ||
              0
          ).toFixed(0)}
          % avg
        </p>
      </div>
    </Link>
  );
}

/* =========================================================
   SUMMARY TILE
========================================================= */

function SummaryTile({
  label,
  value,
  className,
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
    >
      <p className="text-sm opacity-70">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <Icon
        size={30}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 font-black text-slate-700">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   LIST SKELETON
========================================================= */

function ListSkeleton() {
  return (
    <div className="mt-6 space-y-3">
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="h-20 animate-pulse rounded-2xl bg-slate-100"
          />
        )
      )}
    </div>
  );
}

export default AdminDashboardPage;
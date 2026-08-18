import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Gauge,
  GraduationCap,
  PieChart as PieChartIcon,
  RefreshCw,
  Target,
  TrendingUp,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../../api/axios";

import LoadingSpinner from "../../components/ui/LoadingSpinner";

/* =========================================================
   CONSTANTS
========================================================= */

const COLORS = {
  teal: "#0d9488",
  cyan: "#0891b2",
  blue: "#2563eb",
  indigo: "#4f46e5",
  violet: "#7c3aed",
  emerald: "#059669",
  rose: "#e11d48",
  amber: "#d97706",
  slate: "#64748b",
};

/* =========================================================
   HELPERS
========================================================= */

function numberValue(
  value
) {
  const parsed =
    Number(value);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
}

function percentValue(
  value
) {
  return `${numberValue(
    value
  ).toFixed(0)}%`;
}

function formatDateLabel(
  value
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  ).format(date);
}

function formatMonthLabel(
  value
) {
  if (!value) {
    return "";
  }

  const [
    year,
    month,
  ] = String(value).split(
    "-"
  );

  if (
    !year ||
    !month
  ) {
    return String(value);
  }

  const date =
    new Date(
      Number(year),
      Number(month) - 1,
      1
    );

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      month: "short",
      year: "2-digit",
    }
  ).format(date);
}

function formatDateTime(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

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
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

/* =========================================================
   MAIN PAGE
========================================================= */

function AdminAnalyticsPage() {
  const [
    analytics,
    setAnalytics,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    trendView,
    setTrendView,
  ] = useState("daily");

  /* =======================================================
     LOAD ANALYTICS
  ======================================================= */

  const loadAnalytics =
    async (
      showRefreshToast = false
    ) => {
      try {
        if (
          showRefreshToast
        ) {
          setRefreshing(
            true
          );
        }

        const response =
          await api.get(
            "/admin/analytics"
          );

        setAnalytics(
          response.data
            ?.analytics ||
            null
        );

        if (
          showRefreshToast
        ) {
          toast.success(
            "Analytics refreshed"
          );
        }
      } catch (error) {
        console.error(
          "Admin analytics error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to load analytics."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  useEffect(() => {
    loadAnalytics();
  }, []);

  /* =======================================================
     DATA
  ======================================================= */

  const overview =
    analytics?.overview ||
    {};

  const studentPerformance =
    Array.isArray(
      analytics
        ?.studentPerformance
    )
      ? analytics.studentPerformance
      : [];

  const quizPerformance =
    Array.isArray(
      analytics
        ?.quizPerformance
    )
      ? analytics.quizPerformance
      : [];

  const categoryPerformance =
    Array.isArray(
      analytics
        ?.categoryPerformance
    )
      ? analytics.categoryPerformance
      : [];

  const attemptStatus =
    Array.isArray(
      analytics?.attemptStatus
    )
      ? analytics.attemptStatus
      : [];

  const monthlyAttempts =
    Array.isArray(
      analytics
        ?.monthlyAttempts
    )
      ? analytics.monthlyAttempts
      : [];

  const dailyAttempts =
    Array.isArray(
      analytics
        ?.dailyAttempts
    )
      ? analytics.dailyAttempts
      : [];

  const difficultyPerformance =
    Array.isArray(
      analytics
        ?.difficultyPerformance
    )
      ? analytics.difficultyPerformance
      : [];

  const topStudents =
    Array.isArray(
      analytics?.topStudents
    )
      ? analytics.topStudents
      : [];

  /* =======================================================
     CHART DATA
  ======================================================= */

  const attemptStatusChart =
    useMemo(() => {
      return attemptStatus.map(
        (item) => ({
          name:
            item.status,

          value:
            numberValue(
              item.count
            ),
        })
      );
    }, [
      attemptStatus,
    ]);

  const dailyTrendData =
    useMemo(() => {
      return dailyAttempts.map(
        (item) => ({
          date:
            formatDateLabel(
              item.date
            ),

          total:
            numberValue(
              item.total_attempts
            ),

          passed:
            numberValue(
              item.passed_attempts
            ),

          failed:
            numberValue(
              item.failed_attempts
            ),

          score:
            numberValue(
              item.average_score
            ),
        })
      );
    }, [
      dailyAttempts,
    ]);

  const monthlyTrendData =
    useMemo(() => {
      return monthlyAttempts.map(
        (item) => ({
          month:
            formatMonthLabel(
              item.month
            ),

          total:
            numberValue(
              item.total_attempts
            ),

          passed:
            numberValue(
              item.passed_attempts
            ),

          failed:
            numberValue(
              item.failed_attempts
            ),

          score:
            numberValue(
              item.average_score
            ),
        })
      );
    }, [
      monthlyAttempts,
    ]);

  const quizChartData =
    useMemo(() => {
      return quizPerformance
        .slice(0, 8)
        .map(
          (quiz) => ({
            name:
              quiz.title,

            attempts:
              numberValue(
                quiz.attempt_count
              ),

            score:
              numberValue(
                quiz.average_score
              ),
          })
        );
    }, [
      quizPerformance,
    ]);

  const categoryChartData =
    useMemo(() => {
      return categoryPerformance
        .slice(0, 8)
        .map(
          (category) => ({
            name:
              category.name,

            attempts:
              numberValue(
                category.attempt_count
              ),

            score:
              numberValue(
                category.average_score
              ),
          })
        );
    }, [
      categoryPerformance,
    ]);

  const difficultyChartData =
    useMemo(() => {
      return difficultyPerformance.map(
        (difficulty) => ({
          name:
            difficulty.difficulty ||
            "Unknown",

          attempts:
            numberValue(
              difficulty.attempts
            ),

          passed:
            numberValue(
              difficulty.passed
            ),

          failed:
            numberValue(
              difficulty.failed
            ),

          score:
            numberValue(
              difficulty.average_score
            ),

          passRate:
            numberValue(
              difficulty.pass_rate
            ),
        })
      );
    }, [
      difficultyPerformance,
    ]);

  /* =======================================================
     KPI CARDS
  ======================================================= */

  const kpis = [
    {
      label:
        "Total students",

      value:
        overview.total_students ??
        0,

      helper:
        `${
          overview.active_students ??
          0
        } active`,

      icon: Users,

      iconClass:
        "bg-teal-100 text-teal-700",
    },

    {
      label:
        "Total quizzes",

      value:
        overview.total_quizzes ??
        0,

      helper:
        `${
          overview.published_quizzes ??
          0
        } published`,

      icon: BookOpen,

      iconClass:
        "bg-cyan-100 text-cyan-700",
    },

    {
      label:
        "Total attempts",

      value:
        overview.total_attempts ??
        0,

      helper:
        `${
          overview.completed_attempts ??
          0
        } completed`,

      icon: Activity,

      iconClass:
        "bg-violet-100 text-violet-700",
    },

    {
      label:
        "Average score",

      value:
        percentValue(
          overview.average_score
        ),

      helper:
        "Across completed attempts",

      icon: TrendingUp,

      iconClass:
        "bg-emerald-100 text-emerald-700",
    },

    {
      label:
        "Pass rate",

      value:
        percentValue(
          overview.pass_rate
        ),

      helper:
        `${
          overview.passed_attempts ??
          0
        } passed`,

      icon:
        CheckCircle2,

      iconClass:
        "bg-emerald-100 text-emerald-700",
    },

    {
      label:
        "Questions",

      value:
        overview.total_questions ??
        0,

      helper:
        "Across all quizzes",

      icon: Target,

      iconClass:
        "bg-amber-100 text-amber-700",
    },
  ];

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <LoadingSpinner
        fullScreen
        size="lg"
        title="Loading analytics"
        message="Analyzing BioNova student activity, quiz performance and assessment outcomes."
      />
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f7faf9] px-5 py-8 sm:px-8">
      <section className="mx-auto max-w-[1500px]">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-cyan-800 to-blue-700 p-8 text-white shadow-xl sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-white/10" />

          <div className="pointer-events-none absolute -bottom-28 right-1/4 h-72 w-72 rounded-full bg-cyan-300/10" />

          <div className="pointer-events-none absolute right-12 top-10 hidden opacity-10 lg:block">
            <BarChart3
              size={240}
            />
          </div>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <FlaskConical
                    size={20}
                  />
                </div>

                <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
                  BioNova Intelligence
                </p>
              </div>

              <h1 className="mt-5 text-4xl font-black sm:text-5xl">
                Admin Analytics
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-cyan-50 sm:text-lg">
                Monitor biotechnology learning activity, student outcomes, quiz performance and assessment trends across BioNova.
              </p>
            </div>

            <button
              type="button"
              disabled={
                refreshing
              }
              onClick={() =>
                loadAnalytics(
                  true
                )
              }
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 font-black text-teal-800 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh analytics"}
            </button>
          </div>
        </section>

        {/* =================================================
            KPIs
        ================================================= */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {kpis.map(
            (kpi) => (
              <AnalyticsKpiCard
                key={
                  kpi.label
                }
                {...kpi}
              />
            )
          )}
        </section>

        {/* =================================================
            ATTEMPT TREND
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <SectionTitle
              icon={TrendingUp}
              eyebrow="Activity trend"
              title="Quiz attempts over time"
              description="Track assessment activity and completion outcomes."
            />

            <div className="inline-flex w-fit rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() =>
                  setTrendView(
                    "daily"
                  )
                }
                className={`rounded-lg px-4 py-2 text-sm font-black transition ${
                  trendView ===
                  "daily"
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Last 30 days
              </button>

              <button
                type="button"
                onClick={() =>
                  setTrendView(
                    "monthly"
                  )
                }
                className={`rounded-lg px-4 py-2 text-sm font-black transition ${
                  trendView ===
                  "monthly"
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                12 months
              </button>
            </div>
          </div>

          <div className="mt-7 h-[340px]">
            {(trendView ===
              "daily"
              ? dailyTrendData
              : monthlyTrendData
            ).length ===
            0 ? (
              <ChartEmpty />
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={
                    trendView ===
                    "daily"
                      ? dailyTrendData
                      : monthlyTrendData
                  }
                  margin={{
                    top: 10,
                    right: 20,
                    bottom: 5,
                    left: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey={
                      trendView ===
                      "daily"
                        ? "date"
                        : "month"
                    }
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    allowDecimals={
                      false
                    }
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total attempts"
                    stroke={
                      COLORS.blue
                    }
                    strokeWidth={3}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="passed"
                    name="Passed"
                    stroke={
                      COLORS.emerald
                    }
                    strokeWidth={2}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="failed"
                    name="Failed"
                    stroke={
                      COLORS.rose
                    }
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* =================================================
            OUTCOMES + DIFFICULTY
        ================================================= */}

        <section className="mt-8 grid gap-8 xl:grid-cols-2">
          {/* OUTCOMES */}

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <SectionTitle
              icon={
                PieChartIcon
              }
              eyebrow="Assessment outcomes"
              title="Attempt status distribution"
              description="Overall distribution of assessment attempt states."
            />

            <div className="mt-7 h-[330px]">
              {attemptStatusChart.length ===
              0 ? (
                <ChartEmpty />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={
                        attemptStatusChart
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={112}
                      paddingAngle={3}
                    >
                      {attemptStatusChart.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={`${entry.name}-${index}`}
                            fill={
                              [
                                COLORS.emerald,
                                COLORS.rose,
                                COLORS.amber,
                                COLORS.cyan,
                                COLORS.violet,
                              ][
                                index %
                                  5
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>

          {/* DIFFICULTY */}

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <SectionTitle
              icon={Gauge}
              eyebrow="Difficulty analysis"
              title="Performance by difficulty"
              description="Compare average scores and attempt volume across quiz difficulty levels."
            />

            <div className="mt-7 h-[330px]">
              {difficultyChartData.length ===
              0 ? (
                <ChartEmpty />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      difficultyChartData
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                    />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      allowDecimals={
                        false
                      }
                    />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey="attempts"
                      name="Attempts"
                      fill={
                        COLORS.cyan
                      }
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />

                    <Bar
                      dataKey="passed"
                      name="Passed"
                      fill={
                        COLORS.emerald
                      }
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>
        </section>

        {/* =================================================
            QUIZ + CATEGORY PERFORMANCE
        ================================================= */}

        <section className="mt-8 grid gap-8 xl:grid-cols-2">
          {/* QUIZ PERFORMANCE */}

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <SectionTitle
              icon={BookOpen}
              eyebrow="Assessments"
              title="Most attempted quizzes"
              description="Top biotechnology quizzes based on completed assessment activity."
            />

            <div className="mt-7 h-[360px]">
              {quizChartData.length ===
              0 ? (
                <ChartEmpty />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      quizChartData
                    }
                    layout="vertical"
                    margin={{
                      left: 25,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                    />

                    <XAxis
                      type="number"
                      allowDecimals={
                        false
                      }
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={130}
                      tick={{
                        fontSize: 10,
                      }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="attempts"
                      name="Attempts"
                      fill={
                        COLORS.teal
                      }
                      radius={[
                        0,
                        6,
                        6,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>

          {/* CATEGORY PERFORMANCE */}

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <SectionTitle
              icon={
                GraduationCap
              }
              eyebrow="Biotechnology subjects"
              title="Subject performance"
              description="Average learner performance across biotechnology categories."
            />

            <div className="mt-7 h-[360px]">
              {categoryChartData.length ===
              0 ? (
                <ChartEmpty />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      categoryChartData
                    }
                    layout="vertical"
                    margin={{
                      left: 25,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                    />

                    <XAxis
                      type="number"
                      domain={[
                        0,
                        100,
                      ]}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={130}
                      tick={{
                        fontSize: 10,
                      }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="score"
                      name="Average score %"
                      fill={
                        COLORS.indigo
                      }
                      radius={[
                        0,
                        6,
                        6,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>
        </section>

        {/* =================================================
            QUIZ PERFORMANCE TABLE
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <SectionTitle
            icon={BarChart3}
            eyebrow="Quiz intelligence"
            title="Quiz performance"
            description="Detailed comparison of assessment usage, scores and pass rates."
          />

          {quizPerformance.length ===
          0 ? (
            <DataEmpty
              message="No quiz performance data is available yet."
            />
          ) : (
            <div className="mt-7 overflow-x-auto">
              <table className="min-w-[950px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                    <th className="pb-4 pr-5">
                      Quiz
                    </th>

                    <th className="pb-4 pr-5">
                      Category
                    </th>

                    <th className="pb-4 pr-5">
                      Difficulty
                    </th>

                    <th className="pb-4 pr-5 text-center">
                      Attempts
                    </th>

                    <th className="pb-4 pr-5 text-center">
                      Students
                    </th>

                    <th className="pb-4 pr-5 text-center">
                      Avg score
                    </th>

                    <th className="pb-4 text-center">
                      Pass rate
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {quizPerformance.map(
                    (
                      quiz
                    ) => (
                      <tr
                        key={
                          quiz.id
                        }
                        className="border-b border-slate-100"
                      >
                        <td className="py-4 pr-5">
                          <p className="font-black text-slate-950">
                            {
                              quiz.title
                            }
                          </p>
                        </td>

                        <td className="py-4 pr-5 text-sm text-slate-600">
                          {
                            quiz.category_name
                          }
                        </td>

                        <td className="py-4 pr-5">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                            {quiz.difficulty ||
                              "—"}
                          </span>
                        </td>

                        <td className="py-4 pr-5 text-center font-black">
                          {quiz.attempt_count ??
                            0}
                        </td>

                        <td className="py-4 pr-5 text-center font-black">
                          {quiz.unique_students ??
                            0}
                        </td>

                        <td className="py-4 pr-5 text-center font-black text-indigo-700">
                          {percentValue(
                            quiz.average_score
                          )}
                        </td>

                        <td className="py-4 text-center">
                          <PassRateBadge
                            value={
                              quiz.pass_rate
                            }
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =================================================
            TOP STUDENTS + PERFORMANCE
        ================================================= */}

        <section className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          {/* TOP STUDENTS */}

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <SectionTitle
              icon={Award}
              eyebrow="Leaderboard"
              title="Top students"
              description="Highest-performing BioNova learners based on completed assessments."
            />

            {topStudents.length ===
            0 ? (
              <DataEmpty
                message="No student performance data is available yet."
              />
            ) : (
              <div className="mt-7 space-y-3">
                {topStudents
                  .slice(
                    0,
                    10
                  )
                  .map(
                    (
                      student,
                      index
                    ) => (
                      <TopStudentRow
                        key={
                          student.id
                        }
                        student={
                          student
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

          {/* STUDENT PERFORMANCE TABLE */}

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <SectionTitle
              icon={Users}
              eyebrow="Learner performance"
              title="Student assessment summary"
              description="Performance overview for registered biotechnology learners."
            />

            {studentPerformance.length ===
            0 ? (
              <DataEmpty
                message="No student assessment data is available."
              />
            ) : (
              <div className="mt-7 max-h-[630px] overflow-auto">
                <table className="min-w-[700px] w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-slate-200 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                      <th className="pb-4 pr-4">
                        Student
                      </th>

                      <th className="pb-4 pr-4 text-center">
                        Attempts
                      </th>

                      <th className="pb-4 pr-4 text-center">
                        Avg
                      </th>

                      <th className="pb-4 text-center">
                        Best
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {studentPerformance.map(
                      (
                        student
                      ) => (
                        <tr
                          key={
                            student.id
                          }
                          className="border-b border-slate-100"
                        >
                          <td className="py-4 pr-4">
                            <p className="font-black text-slate-950">
                              {
                                student.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {
                                student.email
                              }
                            </p>
                          </td>

                          <td className="py-4 pr-4 text-center font-black">
                            {student.completed_attempts ??
                              0}
                          </td>

                          <td className="py-4 pr-4 text-center font-black text-indigo-700">
                            {percentValue(
                              student.average_score
                            )}
                          </td>

                          <td className="py-4 text-center font-black text-emerald-700">
                            {percentValue(
                              student.highest_score
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </section>

        {/* =================================================
            CATEGORY DETAILS
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <SectionTitle
            icon={Trophy}
            eyebrow="Category intelligence"
            title="Biotechnology subject analytics"
            description="Compare participation, assessment scores and pass rates by subject."
          />

          {categoryPerformance.length ===
          0 ? (
            <DataEmpty
              message="No biotechnology category analytics are available yet."
            />
          ) : (
            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categoryPerformance.map(
                (
                  category
                ) => (
                  <CategoryCard
                    key={
                      category.id
                    }
                    category={
                      category
                    }
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* =================================================
            PLATFORM SUMMARY
        ================================================= */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Passed attempts"
            value={
              overview.passed_attempts ??
              0
            }
            icon={
              CheckCircle2
            }
            className="bg-emerald-50 text-emerald-700"
          />

          <SummaryCard
            label="Failed attempts"
            value={
              overview.failed_attempts ??
              0
            }
            icon={XCircle}
            className="bg-rose-50 text-rose-700"
          />

          <SummaryCard
            label="Completed attempts"
            value={
              overview.completed_attempts ??
              0
            }
            icon={Trophy}
            className="bg-cyan-50 text-cyan-700"
          />

          <SummaryCard
            label="Active students"
            value={
              overview.active_students ??
              0
            }
            icon={Users}
            className="bg-violet-50 text-violet-700"
          />
        </section>

        <div className="h-8" />
      </section>
    </main>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

function AnalyticsKpiCard({
  label,
  value,
  helper,
  icon: Icon,
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

      <p className="mt-4 text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {helper}
      </p>
    </article>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
        <Icon
          size={21}
        />
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-black text-slate-950">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   TOP STUDENT
========================================================= */

function TopStudentRow({
  student,
  rank,
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black ${
          rank === 1
            ? "bg-amber-100 text-amber-700"
            : rank === 2
            ? "bg-slate-200 text-slate-700"
            : rank === 3
            ? "bg-orange-100 text-orange-700"
            : "bg-teal-50 text-teal-700"
        }`}
      >
        #{rank}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-black text-slate-950">
          {student.name}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {student.completed_attempts ??
            0}{" "}
          completed attempts
        </p>
      </div>

      <div className="text-right">
        <p className="font-black text-teal-700">
          {percentValue(
            student.average_score
          )}
        </p>

        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Average
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   CATEGORY CARD
========================================================= */

function CategoryCard({
  category,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="font-black text-slate-950">
        {category.name}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MiniMetric
          label="Quizzes"
          value={
            category.quiz_count ??
            0
          }
        />

        <MiniMetric
          label="Attempts"
          value={
            category.attempt_count ??
            0
          }
        />

        <MiniMetric
          label="Avg score"
          value={percentValue(
            category.average_score
          )}
        />

        <MiniMetric
          label="Pass rate"
          value={percentValue(
            category.pass_rate
          )}
        />
      </div>
    </article>
  );
}

/* =========================================================
   MINI METRIC
========================================================= */

function MiniMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   PASS RATE BADGE
========================================================= */

function PassRateBadge({
  value,
}) {
  const rate =
    numberValue(value);

  let className =
    "bg-rose-100 text-rose-700";

  if (rate >= 80) {
    className =
      "bg-emerald-100 text-emerald-700";
  } else if (
    rate >= 60
  ) {
    className =
      "bg-amber-100 text-amber-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${className}`}
    >
      {rate.toFixed(
        0
      )}
      %
    </span>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  icon: Icon,
  className,
}) {
  return (
    <article
      className={`rounded-2xl p-5 ${className}`}
    >
      <Icon
        size={21}
      />

      <p className="mt-4 text-sm font-semibold opacity-80">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black">
        {value}
      </p>
    </article>
  );
}

/* =========================================================
   EMPTY STATES
========================================================= */

function ChartEmpty() {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
      <div>
        <BarChart3
          size={30}
          className="mx-auto text-slate-400"
        />

        <p className="mt-3 font-black text-slate-600">
          Not enough data yet
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Analytics will appear as students complete quizzes.
        </p>
      </div>
    </div>
  );
}

function DataEmpty({
  message,
}) {
  return (
    <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <Clock3
        size={30}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 font-black text-slate-600">
        No analytics available
      </p>

      <p className="mt-2 text-sm text-slate-400">
        {message}
      </p>
    </div>
  );
}

export default AdminAnalyticsPage;
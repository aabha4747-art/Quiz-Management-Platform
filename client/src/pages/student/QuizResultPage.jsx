import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  Home,
  Medal,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";

/* =========================================================
   HELPERS
========================================================= */

function formatTime(seconds) {
  const value = Number(seconds || 0);

  const minutes = Math.floor(value / 60);
  const remainingSeconds = value % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function formatStatusLabel(percentage) {
  if (percentage >= 90) {
    return {
      title: "Excellent work!",
      subtitle:
        "You demonstrated strong mastery of this biotechnology topic.",
    };
  }

  if (percentage >= 75) {
    return {
      title: "Great work!",
      subtitle:
        "You have a solid understanding of the core concepts.",
    };
  }

  if (percentage >= 60) {
    return {
      title: "Good progress!",
      subtitle:
        "You are building a strong foundation. Keep practising.",
    };
  }

  return {
    title: "Keep practising",
    subtitle:
      "Review the explanations below and try again when you're ready.",
  };
}

function getPerformanceLabel(percentage) {
  if (percentage >= 90) {
    return "Outstanding";
  }

  if (percentage >= 80) {
    return "Excellent";
  }

  if (percentage >= 70) {
    return "Strong";
  }

  if (percentage >= 60) {
    return "Developing";
  }

  return "Needs review";
}

function getScoreColor(percentage) {
  if (percentage >= 80) {
    return "text-emerald-600";
  }

  if (percentage >= 60) {
    return "text-amber-600";
  }

  return "text-rose-600";
}

function getDifficultyLabel(difficulty) {
  const labels = {
    EASY: "Beginner",
    MEDIUM: "Intermediate",
    HARD: "Advanced",
  };

  return labels[difficulty] || difficulty || "Quiz";
}

function getDifficultyClasses(difficulty) {
  if (difficulty === "EASY") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (difficulty === "HARD") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-amber-100 text-amber-700";
}

/* =========================================================
   XP
========================================================= */

function calculateXP({
  percentage,
  passed,
  correctAnswers,
}) {
  let xp = 50;

  xp += Number(correctAnswers || 0) * 10;

  if (passed) {
    xp += 50;
  }

  if (percentage >= 80) {
    xp += 50;
  }

  if (percentage >= 90) {
    xp += 50;
  }

  if (percentage === 100) {
    xp += 100;
  }

  return xp;
}

/* =========================================================
   ACHIEVEMENTS
========================================================= */

function getAchievements({
  percentage,
  passed,
  correctAnswers,
  unanswered,
}) {
  const achievements = [];

  achievements.push({
    id: "completed",
    icon: Medal,
    title: "Assessment Completed",
    description:
      "You completed another BioNova biotechnology assessment.",
    classes:
      "border-violet-200 bg-violet-50 text-violet-700",
    iconClasses:
      "bg-violet-100 text-violet-700",
  });

  if (passed) {
    achievements.push({
      id: "passed",
      icon: Trophy,
      title: "Assessment Passed",
      description:
        "You successfully achieved the required passing score.",
      classes:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      iconClasses:
        "bg-emerald-100 text-emerald-700",
    });
  }

  if (percentage >= 80) {
    achievements.push({
      id: "strong",
      icon: Star,
      title: "Strong Performer",
      description:
        "You scored 80% or higher in this biotechnology assessment.",
      classes:
        "border-cyan-200 bg-cyan-50 text-cyan-700",
      iconClasses:
        "bg-cyan-100 text-cyan-700",
    });
  }

  if (percentage >= 90) {
    achievements.push({
      id: "ace",
      icon: Zap,
      title: "Biotechnology Ace",
      description:
        "A score above 90% shows excellent command of this topic.",
      classes:
        "border-amber-200 bg-amber-50 text-amber-700",
      iconClasses:
        "bg-amber-100 text-amber-700",
    });
  }

  if (percentage === 100) {
    achievements.push({
      id: "perfect",
      icon: Award,
      title: "Perfect Score",
      description:
        "Every question was answered correctly. Outstanding work.",
      classes:
        "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
      iconClasses:
        "bg-fuchsia-100 text-fuchsia-700",
    });
  }

  if (
    Number(unanswered || 0) === 0 &&
    Number(correctAnswers || 0) > 0
  ) {
    achievements.push({
      id: "complete-answering",
      icon: CheckCircle2,
      title: "Full Attempt",
      description:
        "You answered every question in the assessment.",
      classes:
        "border-blue-200 bg-blue-50 text-blue-700",
      iconClasses:
        "bg-blue-100 text-blue-700",
    });
  }

  return achievements;
}

/* =========================================================
   MAIN PAGE
========================================================= */

function QuizResultPage() {
  const { id } = useParams();

  const [attempt, setAttempt] =
    useState(null);

  const [answers, setAnswers] =
    useState([]);

  const [quizzes, setQuizzes] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const [
          resultResponse,
          quizzesResponse,
        ] = await Promise.all([
          api.get(`/attempts/${id}`),
          api.get("/quizzes"),
        ]);

        setAttempt(
          resultResponse.data.attempt
        );

        setAnswers(
          resultResponse.data.answers ||
            []
        );

        setQuizzes(
          Array.isArray(
            quizzesResponse.data.quizzes
          )
            ? quizzesResponse.data.quizzes
            : []
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Unable to load quiz result."
        );
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [id]);

  const percentage = Number(
    attempt?.percentage || 0
  );

  const passed =
    attempt?.status === "PASSED";

  const totalQuestions =
    Number(
      attempt?.correct_answers || 0
    ) +
    Number(
      attempt?.incorrect_answers || 0
    ) +
    Number(
      attempt?.unanswered || 0
    );

  const scoreCopy = useMemo(
    () =>
      formatStatusLabel(
        percentage
      ),
    [percentage]
  );

  const performanceLabel =
    getPerformanceLabel(
      percentage
    );

  const scoreColor =
    getScoreColor(
      percentage
    );

  const xpEarned = useMemo(
    () =>
      calculateXP({
        percentage,
        passed,
        correctAnswers:
          attempt?.correct_answers,
      }),
    [
      percentage,
      passed,
      attempt?.correct_answers,
    ]
  );

  const achievements = useMemo(
    () =>
      getAchievements({
        percentage,
        passed,
        correctAnswers:
          attempt?.correct_answers,
        unanswered:
          attempt?.unanswered,
      }),
    [
      percentage,
      passed,
      attempt?.correct_answers,
      attempt?.unanswered,
    ]
  );

  /* =======================================================
     RECOMMENDED QUIZ
  ======================================================= */

  const recommendedQuiz =
    useMemo(() => {
      if (
        !attempt ||
        quizzes.length === 0
      ) {
        return null;
      }

      const currentQuizId =
        Number(attempt.quiz_id);

      const available =
        quizzes.filter(
          (quiz) =>
            Number(quiz.id) !==
              currentQuizId &&
            (!quiz.status ||
              quiz.status ===
                "PUBLISHED")
        );

      /*
       * First preference:
       * same biotechnology category.
       */
      const sameCategory =
        available.find(
          (quiz) =>
            quiz.category_name ===
            attempt.category_name
        );

      if (sameCategory) {
        return sameCategory;
      }

      /*
       * Second preference:
       * similar difficulty.
       */
      const sameDifficulty =
        available.find(
          (quiz) =>
            quiz.difficulty ===
            attempt.difficulty
        );

      if (sameDifficulty) {
        return sameDifficulty;
      }

      /*
       * Final fallback.
       */
      return (
        available[0] || null
      );
    }, [attempt, quizzes]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />

          <p className="mt-4 font-bold text-slate-600">
            Preparing your
            results...
          </p>
        </div>
      </main>
    );
  }

  if (!attempt) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <Trophy
            size={44}
            className="mx-auto text-teal-600"
          />

          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Result unavailable
          </h1>

          <p className="mt-3 text-slate-500">
            This result could not
            be loaded.
          </p>

          <Link
            to="/student/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-black text-white transition hover:bg-teal-700"
          >
            <Home size={18} />

            Go to dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 sm:px-8">
      <section className="mx-auto max-w-7xl">
        {/* BACK */}
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-2 font-bold text-slate-600 transition hover:text-teal-700"
        >
          <ArrowLeft size={18} />

          Back to dashboard
        </Link>

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className={`relative mt-6 overflow-hidden rounded-3xl shadow-xl ${
            passed
              ? "bg-gradient-to-br from-teal-800 via-cyan-700 to-blue-700"
              : "bg-gradient-to-br from-rose-700 via-pink-700 to-orange-600"
          }`}
        >
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />

          <div className="absolute -bottom-20 left-1/3 h-60 w-60 rounded-full bg-white/5" />

          <Trophy
            size={250}
            className="absolute -right-8 bottom-0 rotate-12 text-white/10"
          />

          <div className="relative grid gap-10 p-8 text-white lg:grid-cols-[1fr_330px] lg:items-center lg:p-12">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] backdrop-blur">
                  Assessment complete
                </span>

                <span
                  className={`rounded-full px-4 py-2 text-xs font-black ${
                    passed
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {passed
                    ? "Passed"
                    : "Not passed"}
                </span>
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                {attempt.quiz_title}
              </h1>

              <h2 className="mt-6 text-2xl font-black">
                {scoreCopy.title}
              </h2>

              <p className="mt-3 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
                {scoreCopy.subtitle}
              </p>

              <div className="mt-7 flex flex-wrap gap-5">
                <HeroMeta
                  icon={CheckCircle2}
                  label={`${attempt.correct_answers} correct`}
                />

                <HeroMeta
                  icon={Clock3}
                  label={formatTime(
                    attempt.time_taken_seconds
                  )}
                />

                <HeroMeta
                  icon={Target}
                  label={`${Number(
                    attempt.passing_percentage ||
                      0
                  ).toFixed(0)}% pass mark`}
                />

                <HeroMeta
                  icon={Zap}
                  label={`+${xpEarned} XP`}
                />
              </div>
            </div>

            {/* SCORE RING */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative flex h-60 w-60 items-center justify-center rounded-full bg-white/10 shadow-2xl backdrop-blur-md">
                <div
                  className="absolute inset-3 rounded-full"
                  style={{
                    background: `conic-gradient(
                      white ${
                        percentage *
                        3.6
                      }deg,
                      rgba(255,255,255,0.18) 0deg
                    )`,
                  }}
                />

                <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-slate-950/45 backdrop-blur">
                  <p className="text-5xl font-black">
                    {percentage.toFixed(
                      0
                    )}
                    %
                  </p>

                  <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-white/70">
                    Final score
                  </p>

                  <p className="mt-3 text-sm font-bold">
                    {
                      performanceLabel
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-6">
          <SummaryCard
            icon={CheckCircle2}
            label="Correct"
            value={
              attempt.correct_answers
            }
            iconClass="bg-emerald-100 text-emerald-700"
          />

          <SummaryCard
            icon={XCircle}
            label="Incorrect"
            value={
              attempt.incorrect_answers
            }
            iconClass="bg-rose-100 text-rose-700"
          />

          <SummaryCard
            icon={Target}
            label="Unanswered"
            value={
              attempt.unanswered
            }
            iconClass="bg-amber-100 text-amber-700"
          />

          <SummaryCard
            icon={Clock3}
            label="Time taken"
            value={formatTime(
              attempt.time_taken_seconds
            )}
            iconClass="bg-cyan-100 text-cyan-700"
          />

          <SummaryCard
            icon={BarChart3}
            label="Questions"
            value={totalQuestions}
            iconClass="bg-violet-100 text-violet-700"
          />

          <SummaryCard
            icon={Zap}
            label="XP earned"
            value={`+${xpEarned}`}
            iconClass="bg-yellow-100 text-yellow-700"
          />
        </section>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.45fr_0.75fr]">
          {/* LEFT */}
          <div className="space-y-8">
            {/* PERFORMANCE */}
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">
                Performance summary
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                How you performed
              </h2>

              <div className="mt-7 space-y-6">
                <PerformanceBar
                  label="Accuracy"
                  value={percentage}
                  text={`${percentage.toFixed(
                    0
                  )}%`}
                  barClass="bg-emerald-500"
                />

                <PerformanceBar
                  label="Completion"
                  value={
                    totalQuestions > 0
                      ? Math.round(
                          ((totalQuestions -
                            Number(
                              attempt.unanswered ||
                                0
                            )) /
                            totalQuestions) *
                            100
                        )
                      : 0
                  }
                  text={`${
                    totalQuestions -
                    Number(
                      attempt.unanswered ||
                        0
                    )
                  }/${totalQuestions}`}
                  barClass="bg-cyan-500"
                />

                <PerformanceBar
                  label="Passing target"
                  value={Math.min(
                    Number(
                      attempt.passing_percentage ||
                        0
                    ),
                    100
                  )}
                  text={`${Number(
                    attempt.passing_percentage ||
                      0
                  ).toFixed(0)}%`}
                  barClass="bg-violet-500"
                />
              </div>
            </section>

            {/* ANSWER REVIEW */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">
                    Detailed feedback
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    Answer review
                  </h2>

                  <p className="mt-2 text-slate-500">
                    Review your
                    selected answers,
                    correct answers and
                    explanations.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-600">
                  {answers.length}{" "}
                  reviewed
                </span>
              </div>

              <div className="mt-7 space-y-5">
                {answers.length > 0 ? (
                  answers.map(
                    (
                      answer,
                      index
                    ) => (
                      <AnswerReviewCard
                        key={
                          answer.question_id
                        }
                        answer={answer}
                        index={index}
                      />
                    )
                  )
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                    <BookOpen
                      size={36}
                      className="mx-auto text-slate-400"
                    />

                    <h3 className="mt-4 font-black text-slate-800">
                      Answer review unavailable
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Detailed answers are not available for this attempt.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="h-fit space-y-6 xl:sticky xl:top-8">
            {/* STATUS */}
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  passed
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {passed ? (
                  <Trophy
                    size={28}
                  />
                ) : (
                  <RotateCcw
                    size={28}
                  />
                )}
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-950">
                {passed
                  ? "Quiz passed"
                  : "Keep improving"}
              </h2>

              <p className="mt-3 leading-7 text-slate-500">
                {passed
                  ? "You reached the required passing score and completed this assessment successfully."
                  : "Review the explanations, strengthen your weak areas and try again."}
              </p>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">
                    Your score
                  </span>

                  <span
                    className={`text-2xl font-black ${scoreColor}`}
                  >
                    {percentage.toFixed(
                      0
                    )}
                    %
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">
                    Required
                  </span>

                  <span className="font-black text-slate-950">
                    {Number(
                      attempt.passing_percentage ||
                        0
                    ).toFixed(0)}
                    %
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-sm font-bold text-slate-500">
                    XP earned
                  </span>

                  <span className="font-black text-violet-700">
                    +{xpEarned}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  to="/student/quizzes"
                  className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3.5 font-black text-white transition hover:bg-teal-700"
                >
                  <BookOpen
                    size={18}
                  />

                  Browse quizzes
                </Link>

                <Link
                  to="/student/dashboard"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 font-black text-slate-700 transition hover:bg-slate-50"
                >
                  <Home size={18} />

                  Go to dashboard
                </Link>
              </div>
            </section>

            {/* =============================================
                ACHIEVEMENTS
            ============================================= */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-700">
                    Achievements
                  </p>

                  <h3 className="mt-1 text-xl font-black text-slate-950">
                    You earned{" "}
                    {
                      achievements.length
                    }
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Medal
                    size={22}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {achievements.map(
                  (
                    achievement
                  ) => {
                    const Icon =
                      achievement.icon;

                    return (
                      <div
                        key={
                          achievement.id
                        }
                        className={`rounded-2xl border p-4 ${achievement.classes}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${achievement.iconClasses}`}
                          >
                            <Icon
                              size={
                                20
                              }
                            />
                          </div>

                          <div>
                            <h4 className="font-black">
                              {
                                achievement.title
                              }
                            </h4>

                            <p className="mt-1 text-xs leading-5 opacity-80">
                              {
                                achievement.description
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>

            {/* CERTIFICATE */}
            {passed && (
              <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Award
                      size={22}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">
                      Certificate
                      eligible
                    </p>

                    <h3 className="mt-1 font-black text-amber-950">
                      Great milestone
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-amber-800">
                      This result can
                      contribute toward
                      future BioNova
                      certifications.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* =============================================
                RECOMMENDED QUIZ
            ============================================= */}

            {recommendedQuiz ? (
              <RecommendedQuizCard
                quiz={
                  recommendedQuiz
                }
                currentCategory={
                  attempt.category_name
                }
              />
            ) : (
              <section className="rounded-3xl bg-slate-950 p-6 text-white">
                <Sparkles
                  size={26}
                  className="text-cyan-300"
                />

                <h3 className="mt-4 text-xl font-black">
                  Keep learning
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Explore another
                  biotechnology
                  assessment from the
                  BioNova library.
                </p>

                <Link
                  to="/student/quizzes"
                  className="mt-5 flex items-center justify-between rounded-xl bg-white px-4 py-3 font-black text-slate-950"
                >
                  Browse quizzes

                  <ChevronRight
                    size={18}
                  />
                </Link>
              </section>
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}

/* =========================================================
   RECOMMENDED QUIZ
========================================================= */

function RecommendedQuizCard({
  quiz,
  currentCategory,
}) {
  const sameCategory =
    quiz.category_name ===
    currentCategory;

  return (
    <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-sm">
      {/* IMAGE */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-teal-700 to-blue-700">
        {quiz.thumbnail_url ? (
          <img
            src={
              quiz.thumbnail_url
            }
            alt={quiz.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen
              size={56}
              className="text-white/80"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />

        <div className="absolute bottom-3 left-3">
          <span className="rounded-full bg-teal-500 px-3 py-1.5 text-xs font-black text-white">
            {sameCategory
              ? "Recommended next"
              : "Continue learning"}
          </span>
        </div>
      </div>

      <div className="p-6">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-300">
          {quiz.category_name ||
            "Biotechnology"}
        </p>

        <h3 className="mt-3 text-xl font-black leading-7">
          {quiz.title}
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-black ${getDifficultyClasses(
              quiz.difficulty
            )}`}
          >
            {getDifficultyLabel(
              quiz.difficulty
            )}
          </span>

          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
            {quiz.question_count ??
              10}{" "}
            questions
          </span>

          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
            {quiz.duration_minutes ||
              0}{" "}
            min
          </span>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-300">
          {quiz.description ||
            "Continue strengthening your biotechnology knowledge with this assessment."}
        </p>

        <Link
          to={`/student/quizzes/${quiz.id}`}
          className="mt-5 flex items-center justify-between rounded-xl bg-white px-4 py-3.5 font-black text-slate-950 transition hover:bg-cyan-50"
        >
          Continue learning

          <ChevronRight
            size={18}
          />
        </Link>
      </div>
    </section>
  );
}

/* =========================================================
   HERO META
========================================================= */

function HeroMeta({
  icon: Icon,
  label,
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-bold text-white/90">
      <Icon size={18} />

      {label}
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon: Icon,
  label,
  value,
  iconClass,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass}`}
      >
        <Icon size={22} />
      </div>

      <p className="mt-4 text-sm font-bold text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-slate-950">
        {value}
      </p>
    </article>
  );
}

/* =========================================================
   PERFORMANCE
========================================================= */

function PerformanceBar({
  label,
  value,
  text,
  barClass,
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
        <p className="font-black text-slate-800">
          {label}
        </p>

        <p className="font-black text-slate-950">
          {text}
        </p>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   ANSWER REVIEW
========================================================= */

function AnswerReviewCard({
  answer,
  index,
}) {
  const selectedAnswer =
    answer.selected_answer;

  const unanswered =
    selectedAnswer === null ||
    selectedAnswer === undefined ||
    String(selectedAnswer).trim() === "";

  const correct =
    !unanswered &&
    Boolean(answer.is_correct);

  const incorrect =
    !unanswered && !correct;

  let state = {
    label: "Unanswered",
    border: "border-amber-200",
    background: "bg-amber-50/70",
    number: "bg-amber-500 text-white",
    badge: "bg-amber-100 text-amber-700",
    answer: "text-amber-700",
  };

  if (correct) {
    state = {
      label: "Correct",
      border: "border-emerald-200",
      background: "bg-emerald-50/70",
      number: "bg-emerald-600 text-white",
      badge: "bg-emerald-100 text-emerald-700",
      answer: "text-emerald-700",
    };
  }

  if (incorrect) {
    state = {
      label: "Incorrect",
      border: "border-rose-200",
      background: "bg-rose-50/70",
      number: "bg-rose-600 text-white",
      badge: "bg-rose-100 text-rose-700",
      answer: "text-rose-700",
    };
  }

  return (
    <article
      className={`overflow-hidden rounded-2xl border ${state.border}`}
    >
      <div
        className={`flex items-start gap-4 p-5 ${state.background}`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black ${state.number}`}
        >
          {index + 1}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="font-black leading-7 text-slate-950">
              {answer.question_text}
            </h3>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${state.badge}`}
            >
              {correct ? (
                <CheckCircle2
                  size={14}
                />
              ) : incorrect ? (
                <XCircle
                  size={14}
                />
              ) : (
                <Target
                  size={14}
                />
              )}

              {state.label}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Your answer
              </p>

              <p
                className={`mt-2 font-black ${state.answer}`}
              >
                {unanswered
                  ? "Not answered"
                  : selectedAnswer}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-100/70 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                Correct answer
              </p>

              <p className="mt-2 font-black text-emerald-900">
                {answer.correct_answer ||
                  "Answer unavailable"}
              </p>
            </div>
          </div>

          {(answer.marks !== undefined ||
            answer.marks_awarded !== undefined) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {answer.marks !== undefined && (
                <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
                  Question marks: {answer.marks}
                </span>
              )}

              {answer.marks_awarded !== undefined && (
                <span
                  className={`rounded-lg px-3 py-2 text-xs font-black ${
                    Number(answer.marks_awarded) > 0
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Marks awarded: {answer.marks_awarded}
                </span>
              )}
            </div>
          )}

          {answer.explanation ? (
            <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-cyan-700">
                Explanation
              </p>

              <p className="mt-2 leading-7 text-cyan-950">
                {answer.explanation}
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">
                No explanation was provided for this question.
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default QuizResultPage;
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  CircleX,
  Target,
  Trophy,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";

import HeroBanner from "../../components/ui/HeroBanner";
import MetricCard from "../../components/ui/MetricCard";
import SectionHeader from "../../components/ui/SectionHeader";
import ProgressRing from "../../components/ui/ProgressRing";
import EmptyState from "../../components/ui/EmptyState";
import CategoryProgressCard from "../../components/ui/CategoryProgressCard";
import RecentAttemptCard from "../../components/ui/RecentAttemptCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

function StudentProgressPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await api.get(
          "/student/dashboard"
        );

        setDashboard(
          response.data.dashboard || null
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Unable to load progress information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const statistics = dashboard?.statistics || {};

  const categories =
    dashboard?.categoryPerformance || [];

  const recentAttempts =
    dashboard?.recentAttempts || [];

  const strongestCategory = useMemo(() => {
    if (categories.length === 0) {
      return null;
    }

    return [...categories].sort(
      (first, second) =>
        Number(second.average_score || 0) -
        Number(first.average_score || 0)
    )[0];
  }, [categories]);

  const weakestCategory = useMemo(() => {
    if (categories.length < 2) {
      return null;
    }

    return [...categories].sort(
      (first, second) =>
        Number(first.average_score || 0) -
        Number(second.average_score || 0)
    )[0];
  }, [categories]);

  const correctAnswers = Number(
    statistics.total_correct_answers || 0
  );

  const incorrectAnswers = Number(
    statistics.total_incorrect_answers || 0
  );

  const unanswered = Number(
    statistics.total_unanswered || 0
  );

  const totalAnswers =
    correctAnswers +
    incorrectAnswers +
    unanswered;

  const accuracy =
    correctAnswers + incorrectAnswers > 0
      ? Math.round(
          (correctAnswers /
            (correctAnswers + incorrectAnswers)) *
            100
        )
      : 0;

  const metricCards = [
    {
      icon: BookOpenCheck,
      label: "Completed attempts",
      value:
        statistics.total_quizzes_attempted ?? 0,
      note: `${
        statistics.unique_quizzes_attempted ?? 0
      } unique quizzes`,
      iconClass:
        "bg-indigo-100 text-indigo-700",
    },
    {
      icon: BarChart3,
      label: "Average score",
      value: `${Number(
        statistics.average_score || 0
      ).toFixed(0)}%`,
      note: "Across completed attempts",
      iconClass:
        "bg-cyan-100 text-cyan-700",
    },
    {
      icon: Trophy,
      label: "Highest score",
      value: `${Number(
        statistics.highest_score || 0
      ).toFixed(0)}%`,
      note: "Your personal best",
      iconClass:
        "bg-amber-100 text-amber-700",
    },
    {
      icon: CheckCircle2,
      label: "Success rate",
      value: `${Number(
        statistics.success_rate || 0
      ).toFixed(0)}%`,
      note: `${
        statistics.total_passed ?? 0
      } passed · ${
        statistics.total_failed ?? 0
      } failed`,
      iconClass:
        "bg-emerald-100 text-emerald-700",
    },
  ];

  if (loading) {
    return (
      <LoadingSpinner
        fullScreen
        size="lg"
        title="Loading progress"
        message="Analysing your quiz performance."
      />
    );
  }

  return (
    <main className="p-5 sm:p-8">
      <HeroBanner
        eyebrow="Learning analytics"
        title="Track your progress"
        description="Understand your strengths, identify areas for improvement and monitor your performance across quiz categories."
        variant="indigo"
        icon={BarChart3}
        primaryAction={{
          label: "Attempt another quiz",
          to: "/student/quizzes",
        }}
        secondaryAction={{
          label: "View attempt history",
          to: "/student/attempts",
        }}
      />

      <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard
            key={card.label}
            {...card}
          />
        ))}
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            eyebrow="Category analytics"
            title="Performance by category"
            description="Average scores calculated from your completed quiz attempts."
          />

          {categories.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No category data yet"
              message="Complete quizzes from different categories to unlock performance insights."
              action={{
                label: "Browse quizzes",
                to: "/student/quizzes",
              }}
            />
          ) : (
            <div className="space-y-5">
              {categories.map(
                (category, index) => (
                  <CategoryProgressCard
                    key={category.category_id}
                    category={category}
                    rank={index + 1}
                    showInsight
                  />
                )
              )}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            eyebrow="Answer accuracy"
            title="Response breakdown"
            description="See how your submitted answers are distributed."
          />

          <div className="flex justify-center">
            <ProgressRing
              value={accuracy}
              label="Accuracy"
              size="lg"
            />
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3">
            <AnswerMetric
              label="Correct"
              value={correctAnswers}
              className="bg-emerald-50 text-emerald-700"
            />

            <AnswerMetric
              label="Incorrect"
              value={incorrectAnswers}
              className="bg-rose-50 text-rose-700"
            />

            <AnswerMetric
              label="Unanswered"
              value={unanswered}
              className="bg-slate-100 text-slate-700"
            />
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Total questions seen
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {totalAnswers}
            </p>
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            eyebrow="Learning insights"
            title="Strengths and improvements"
            description="Use these insights to decide what to practise next."
          />

          <div className="space-y-4">
            {strongestCategory ? (
              <InsightCard
                icon={Award}
                label="Strongest category"
                title={
                  strongestCategory.category_name
                }
                description={`${Number(
                  strongestCategory.average_score ||
                    0
                ).toFixed(0)}% average across ${
                  strongestCategory.attempts || 0
                } attempts.`}
                containerClass="border-emerald-200 bg-emerald-50"
                iconClass="bg-emerald-100 text-emerald-700"
              />
            ) : (
              <InsightCard
                icon={Award}
                label="Strongest category"
                title="Not available yet"
                description="Complete more quizzes to identify your strongest area."
                containerClass="border-slate-200 bg-slate-50"
                iconClass="bg-slate-200 text-slate-600"
              />
            )}

            {weakestCategory ? (
              <InsightCard
                icon={Target}
                label="Needs attention"
                title={
                  weakestCategory.category_name
                }
                description={`${Number(
                  weakestCategory.average_score || 0
                ).toFixed(0)}% average. Practising this category could improve your overall performance.`}
                containerClass="border-amber-200 bg-amber-50"
                iconClass="bg-amber-100 text-amber-700"
                action={{
                  label: "Find quizzes",
                  to: "/student/quizzes",
                }}
              />
            ) : (
              <InsightCard
                icon={Target}
                label="Needs attention"
                title="More data required"
                description="Complete quizzes in multiple categories to identify improvement areas."
                containerClass="border-slate-200 bg-slate-50"
                iconClass="bg-slate-200 text-slate-600"
              />
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            eyebrow="Recent performance"
            title="Latest scores"
            description="Your most recent completed quiz attempts."
            action={
              <Link
                to="/student/attempts"
                className="inline-flex items-center gap-2 font-bold text-indigo-700 hover:text-indigo-800"
              >
                View all
                <ChevronRight size={17} />
              </Link>
            }
          />

          {recentAttempts.length === 0 ? (
            <EmptyState
              icon={BookOpenCheck}
              title="No attempts yet"
              message="Your recent scores will appear after completing a quiz."
              action={{
                label: "Start a quiz",
                to: "/student/quizzes",
              }}
            />
          ) : (
            <div className="space-y-4">
              {recentAttempts.map((attempt) => (
                <RecentAttemptCard
                  key={attempt.id}
                  attempt={attempt}
                />
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

function AnswerMetric({
  label,
  value,
  className,
}) {
  return (
    <div
      className={`rounded-xl p-4 text-center ${className}`}
    >
      <p className="text-xs font-black uppercase tracking-wider">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black">
        {value}
      </p>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  label,
  title,
  description,
  containerClass,
  iconClass,
  action,
}) {
  return (
    <article
      className={`rounded-2xl border p-5 ${containerClass}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <h3 className="mt-2 text-lg font-black text-slate-950">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {description}
          </p>

          {action && (
            <Link
              to={action.to}
              className="mt-4 inline-flex items-center gap-2 text-sm font-black text-indigo-700 hover:text-indigo-800"
            >
              {action.label}
              <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default StudentProgressPage;
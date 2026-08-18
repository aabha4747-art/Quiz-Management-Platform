import {
  Award,
  BarChart3,
  Target,
} from "lucide-react";

function CategoryProgressCard({
  category,
  rank,
  showInsight = false,
}) {
  const averageScore = Math.min(
    Math.max(
      Number(category?.average_score || 0),
      0
    ),
    100
  );

  const attempts = Number(
    category?.attempts || 0
  );

  const passed = Number(
    category?.passed || 0
  );

  const highestScore = Number(
    category?.highest_score || 0
  );

  const passRate =
    attempts > 0
      ? Math.round((passed / attempts) * 100)
      : 0;

  const insight = getInsight(
    averageScore,
    passRate
  );

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <BarChart3 size={20} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-black text-slate-950">
                {category?.category_name ||
                  "Category"}
              </h3>

              {rank && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                  #{rank}
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {attempts} attempt
              {attempts === 1 ? "" : "s"} ·{" "}
              {passed} passed
            </p>
          </div>
        </div>

        <p className="shrink-0 text-2xl font-black text-slate-950">
          {averageScore.toFixed(0)}%
        </p>
      </div>

      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500"
          style={{
            width: `${averageScore}%`,
          }}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-200 pt-4">
        <CategoryMetric
          label="Average"
          value={`${averageScore.toFixed(0)}%`}
        />

        <CategoryMetric
          label="Highest"
          value={`${highestScore.toFixed(0)}%`}
        />

        <CategoryMetric
          label="Pass rate"
          value={`${passRate}%`}
        />
      </div>

      {showInsight && (
        <div
          className={`mt-5 flex items-start gap-3 rounded-xl p-4 ${insight.containerClass}`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${insight.iconClass}`}
          >
            <insight.icon size={18} />
          </div>

          <div className="min-w-0">
            <p className="font-black">
              {insight.title}
            </p>

            <p className="mt-1 text-sm leading-6 opacity-80">
              {insight.message}
            </p>
          </div>
        </div>
      )}
    </article>
  );
}

function CategoryMetric({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function getInsight(
  averageScore,
  passRate
) {
  if (
    averageScore >= 80 &&
    passRate >= 75
  ) {
    return {
      title: "Strong performance",
      message:
        "You are performing consistently well in this category.",
      icon: Award,
      containerClass:
        "bg-emerald-50 text-emerald-900",
      iconClass:
        "bg-emerald-100 text-emerald-700",
    };
  }

  if (
    averageScore >= 60 &&
    passRate >= 50
  ) {
    return {
      title: "Good progress",
      message:
        "Keep practising to improve consistency.",
      icon: BarChart3,
      containerClass:
        "bg-indigo-50 text-indigo-900",
      iconClass:
        "bg-indigo-100 text-indigo-700",
    };
  }

  return {
    title: "Needs attention",
    message:
      "Review this category and attempt more quizzes.",
    icon: Target,
    containerClass:
      "bg-amber-50 text-amber-900",
    iconClass:
      "bg-amber-100 text-amber-700",
  };
}

export default CategoryProgressCard;
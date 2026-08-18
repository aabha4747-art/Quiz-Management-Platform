import {
  CheckCircle2,
  ChevronRight,
  CircleX,
  Clock3,
} from "lucide-react";
import { Link } from "react-router-dom";

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(seconds) {
  if (
    seconds === null ||
    seconds === undefined
  ) {
    return "—";
  }

  const totalSeconds = Number(seconds);

  if (Number.isNaN(totalSeconds)) {
    return "—";
  }

  const minutes = Math.floor(
    totalSeconds / 60
  );

  const remainingSeconds =
    totalSeconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function RecentAttemptCard({
  attempt,
  showButton = true,
}) {
  const passed =
    attempt.status === "PASSED";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            passed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {passed ? (
            <CheckCircle2 size={22} />
          ) : (
            <CircleX size={22} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-lg font-black text-slate-950">
            {attempt.quiz_title || "Quiz"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {attempt.category_name ||
              "General"}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock3 size={15} />

              {formatTime(
                attempt.time_taken_seconds
              )}
            </span>

            <span>
              {formatDate(
                attempt.completed_at ||
                  attempt.started_at
              )}
            </span>

            {attempt.attempt_number && (
              <span>
                Attempt #{attempt.attempt_number}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3">
          <p className="text-3xl font-black text-slate-950">
            {Number(
              attempt.percentage || 0
            ).toFixed(0)}
            %
          </p>

          <span
            className={`rounded-full px-3 py-1 text-xs font-black ${
              passed
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {attempt.status}
          </span>
        </div>

        {showButton && (
          <Link
            to={`/student/results/${attempt.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-black text-indigo-700 transition hover:bg-indigo-50"
          >
            Review
            <ChevronRight size={17} />
          </Link>
        )}
      </div>
    </article>
  );
}

export default RecentAttemptCard;
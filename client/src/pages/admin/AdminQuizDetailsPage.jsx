import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Edit3,
  FileQuestion,
  FolderOpen,
  Target,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../api/axios";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const difficultyStyles = {
  EASY: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HARD: "bg-rose-100 text-rose-700",
};

const statusStyles = {
  DRAFT: "bg-slate-100 text-slate-700",
  PUBLISHED: "bg-indigo-100 text-indigo-700",
  ARCHIVED: "bg-amber-100 text-amber-700",
};

function AdminQuizDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/quizzes/${id}`);

        const loadedQuiz =
          response.data.quiz ||
          response.data.data?.quiz ||
          null;

        if (!loadedQuiz) {
          throw new Error("Quiz information was not returned");
        }

        setQuiz(loadedQuiz);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Unable to load quiz."
        );

        navigate("/admin/quizzes", {
          replace: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [id, navigate]);

  if (loading) {
    return (
      <LoadingSpinner
        fullScreen
        size="lg"
        title="Loading quiz"
        message="Retrieving quiz information and assessment settings."
      />
    );
  }

  if (!quiz) {
    return null;
  }

  const questionCount = Number(
    quiz.question_count ??
      quiz.questions?.length ??
      0
  );

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 sm:px-8">
      <section className="mx-auto max-w-7xl">
        <Link
          to="/admin/quizzes"
          className="inline-flex items-center gap-2 font-bold text-slate-600 transition hover:text-indigo-600"
        >
          <ArrowLeft size={19} />
          Back to quizzes
        </Link>

        <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-800 p-8 text-white shadow-xl sm:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${
                  difficultyStyles[quiz.difficulty] ||
                  "bg-slate-100 text-slate-700"
                }`}
              >
                {quiz.difficulty || "MEDIUM"}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${
                  statusStyles[quiz.status] ||
                  "bg-slate-100 text-slate-700"
                }`}
              >
                {quiz.status || "DRAFT"}
              </span>

              <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">
                {quiz.category_name || "Uncategorised"}
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black sm:text-5xl">
              {quiz.title}
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
              {quiz.description ||
                "No quiz description has been added."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={`/admin/quizzes/${quiz.id}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:bg-indigo-50"
              >
                <Edit3 size={18} />
                Edit quiz
              </Link>

              <Link
                to={`/admin/quizzes/${quiz.id}/questions`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
              >
                <FileQuestion size={18} />
                Manage questions
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Clock3 size={23} />}
            label="Duration"
            value={`${quiz.duration_minutes || 0} min`}
            iconClass="bg-indigo-100 text-indigo-600"
          />

          <StatCard
            icon={<Target size={23} />}
            label="Passing score"
            value={`${Number(
              quiz.passing_percentage || 0
            ).toFixed(0)}%`}
            iconClass="bg-emerald-100 text-emerald-600"
          />

          <StatCard
            icon={<FileQuestion size={23} />}
            label="Questions"
            value={questionCount}
            iconClass="bg-cyan-100 text-cyan-600"
          />

          <StatCard
            icon={<BookOpen size={23} />}
            label="Maximum attempts"
            value={quiz.max_attempts ?? "No limit"}
            iconClass="bg-amber-100 text-amber-600"
          />
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <CheckCircle2 size={23} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Assessment overview
                </h2>

                <p className="mt-1 text-slate-500">
                  Review the quiz configuration before publishing.
                </p>
              </div>
            </div>

            <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200">
              <DetailRow
                label="Quiz ID"
                value={quiz.id}
              />

              <DetailRow
                label="Title"
                value={quiz.title}
              />

              <DetailRow
                label="Difficulty"
                value={quiz.difficulty}
              />

              <DetailRow
                label="Status"
                value={quiz.status}
              />

              <DetailRow
                label="Duration"
                value={`${quiz.duration_minutes || 0} minutes`}
              />

              <DetailRow
                label="Passing percentage"
                value={`${Number(
                  quiz.passing_percentage || 0
                ).toFixed(0)}%`}
              />

              <DetailRow
                label="Maximum attempts"
                value={quiz.max_attempts ?? "No limit"}
              />
            </div>
          </article>

          <aside className="space-y-6">
            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600">
                <FolderOpen size={23} />
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-950">
                Category
              </h2>

              <p className="mt-3 text-lg font-bold text-indigo-700">
                {quiz.category_name || "Uncategorised"}
              </p>

              <p className="mt-3 leading-7 text-slate-500">
                This category determines where the quiz appears
                for students.
              </p>
            </article>

            <article
              className={`rounded-3xl border p-7 shadow-sm ${
                quiz.status === "PUBLISHED"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <h2
                className={`text-xl font-black ${
                  quiz.status === "PUBLISHED"
                    ? "text-emerald-950"
                    : "text-amber-950"
                }`}
              >
                {quiz.status === "PUBLISHED"
                  ? "Available to students"
                  : "Not currently available"}
              </h2>

              <p
                className={`mt-3 leading-7 ${
                  quiz.status === "PUBLISHED"
                    ? "text-emerald-800"
                    : "text-amber-800"
                }`}
              >
                {quiz.status === "PUBLISHED"
                  ? "Students can discover and attempt this quiz."
                  : "Add questions and publish the quiz when it is ready."}
              </p>

              {quiz.status !== "PUBLISHED" && (
                <Link
                  to="/admin/quizzes"
                  className="mt-5 inline-flex rounded-xl bg-amber-600 px-5 py-3 font-bold text-white transition hover:bg-amber-700"
                >
                  Manage quiz status
                </Link>
              )}
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  iconClass,
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-slate-950">
        {value}
      </p>
    </article>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-slate-500">
        {label}
      </span>

      <span className="break-words font-black text-slate-950 sm:max-w-md sm:text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

export default AdminQuizDetailsPage;
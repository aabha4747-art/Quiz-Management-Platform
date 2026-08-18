import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  FileQuestion,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import ConfirmModal from "../../components/ui/ConfirmModal";

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

function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [changingStatusId, setChangingStatusId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [quizToDelete, setQuizToDelete] = useState(null);
  const [statusChange, setStatusChange] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const loadData = async () => {
    try {
      setLoading(true);

      const [quizResponse, categoryResponse] =
        await Promise.all([
          api.get("/quizzes"),
          api.get("/categories"),
        ]);

      setQuizzes(quizResponse.data.quizzes || []);
      setCategories(categoryResponse.data.categories || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load quiz management data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredQuizzes = useMemo(() => {
    const searchValue = searchText.trim().toLowerCase();

    return quizzes.filter((quiz) => {
      const title = quiz.title?.toLowerCase() || "";
      const description =
        quiz.description?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue) ||
        description.includes(searchValue);

      const matchesCategory =
        selectedCategory === "ALL" ||
        String(quiz.category_id) === selectedCategory;

      const matchesStatus =
        selectedStatus === "ALL" ||
        quiz.status === selectedStatus;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    quizzes,
    searchText,
    selectedCategory,
    selectedStatus,
  ]);

  const publishedCount = quizzes.filter(
    (quiz) => quiz.status === "PUBLISHED"
  ).length;

  const draftCount = quizzes.filter(
    (quiz) => quiz.status === "DRAFT"
  ).length;

  const totalQuestions = quizzes.reduce(
    (total, quiz) =>
      total + Number(quiz.question_count || 0),
    0
  );

  const requestStatusChange = (quiz, newStatus) => {
    if (!newStatus || quiz.status === newStatus) {
      return;
    }

    setStatusChange({
      quiz,
      newStatus,
    });
  };

  const cancelStatusChange = () => {
    if (changingStatusId) {
      return;
    }

    setStatusChange(null);
  };

  const handleStatusChange = async () => {
    if (!statusChange) {
      return;
    }

    const { quiz, newStatus } = statusChange;

    try {
      setChangingStatusId(quiz.id);

      const response = await api.patch(
        `/quizzes/${quiz.id}/status`,
        {
          status: newStatus,
        }
      );

      const updatedQuiz = response.data.quiz;

      setQuizzes((current) =>
        current.map((currentQuiz) =>
          String(currentQuiz.id) === String(quiz.id)
            ? {
                ...currentQuiz,
                status:
                  updatedQuiz?.status || newStatus,
                updated_at:
                  updatedQuiz?.updated_at ||
                  currentQuiz.updated_at,
              }
            : currentQuiz
        )
      );

      toast.success(`Quiz changed to ${newStatus}`);
      setStatusChange(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to change quiz status."
      );
    } finally {
      setChangingStatusId(null);
    }
  };

  const confirmDeleteQuiz = (quiz) => {
    setQuizToDelete(quiz);
  };

  const cancelDeleteQuiz = () => {
    if (deletingId) {
      return;
    }

    setQuizToDelete(null);
  };

  const handleDelete = async () => {
    if (!quizToDelete) {
      return;
    }

    try {
      setDeletingId(quizToDelete.id);

      await api.delete(`/quizzes/${quizToDelete.id}`);

      setQuizzes((current) =>
        current.filter(
          (quiz) =>
            String(quiz.id) !==
            String(quizToDelete.id)
        )
      );

      toast.success("Quiz deleted successfully");
      setQuizToDelete(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete quiz."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 sm:px-8">
      <section className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-800 p-8 text-white shadow-xl sm:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
                Admin workspace
              </p>

              <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                Quiz Management
              </h1>

              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                Create assessments, manage questions and
                control which quizzes are available to
                students.
              </p>
            </div>

            <Link
              to="/admin/quizzes/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:bg-indigo-50"
            >
              <Plus size={19} />
              Create quiz
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <BookOpen
              className="text-indigo-600"
              size={24}
            />

            <p className="mt-4 text-sm text-slate-500">
              Total quizzes
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {quizzes.length}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <CheckCircle2
              className="text-emerald-600"
              size={24}
            />

            <p className="mt-4 text-sm text-slate-500">
              Published
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {publishedCount}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <XCircle
              className="text-amber-600"
              size={24}
            />

            <p className="mt-4 text-sm text-slate-500">
              Drafts
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {draftCount}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <FileQuestion
              className="text-cyan-600"
              size={24}
            />

            <p className="mt-4 text-sm text-slate-500">
              Total questions
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {totalQuestions}
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
                placeholder="Search quizzes..."
                className="w-full rounded-xl border border-slate-300 py-3.5 pl-12 pr-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="relative">
              <Filter
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="ALL">
                  All categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={String(category.id)}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="ALL">
                All statuses
              </option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">
                Published
              </option>
              <option value="ARCHIVED">
                Archived
              </option>
            </select>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Assessments
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-950">
                {filteredQuizzes.length}{" "}
                {filteredQuizzes.length === 1
                  ? "quiz"
                  : "quizzes"}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <StatusTab
                label="All"
                value="ALL"
                count={quizzes.length}
                selectedStatus={selectedStatus}
                onSelect={setSelectedStatus}
              />

              <StatusTab
                label="Published"
                value="PUBLISHED"
                count={publishedCount}
                selectedStatus={selectedStatus}
                onSelect={setSelectedStatus}
              />

              <StatusTab
                label="Draft"
                value="DRAFT"
                count={draftCount}
                selectedStatus={selectedStatus}
                onSelect={setSelectedStatus}
              />

              <StatusTab
                label="Archived"
                value="ARCHIVED"
                count={
                  quizzes.filter(
                    (quiz) => quiz.status === "ARCHIVED"
                  ).length
                }
                selectedStatus={selectedStatus}
                onSelect={setSelectedStatus}
              />
            </div>
          </div>
        </section>

        {loading ? (
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-3xl bg-white"
              />
            ))}
          </section>
        ) : filteredQuizzes.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <BookOpen
              size={42}
              className="mx-auto text-slate-400"
            />

            <h3 className="mt-4 text-xl font-black text-slate-900">
              No quizzes found
            </h3>

            <p className="mt-2 text-slate-500">
              Create a quiz or change the current filters.
            </p>
          </section>
        ) : (
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            {filteredQuizzes.map((quiz) => (
              <article
                key={quiz.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl"
              >
                <div className="border-b border-slate-200 p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            difficultyStyles[
                              quiz.difficulty
                            ] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {quiz.difficulty}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            statusStyles[quiz.status] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {quiz.status}
                        </span>

                        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                          {quiz.category_name ||
                            "Uncategorised"}
                        </span>
                      </div>

                      <h3 className="mt-4 text-2xl font-black text-slate-950">
                        {quiz.title}
                      </h3>

                      <p className="mt-3 line-clamp-2 leading-7 text-slate-500">
                        {quiz.description ||
                          "No description has been added."}
                      </p>
                    </div>

                    <select
                      value={quiz.status}
                      disabled={
                        String(changingStatusId) ===
                        String(quiz.id)
                      }
                      onChange={(event) =>
                        requestStatusChange(
                          quiz,
                          event.target.value
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="DRAFT">
                        Draft
                      </option>
                      <option value="PUBLISHED">
                        Published
                      </option>
                      <option value="ARCHIVED">
                        Archived
                      </option>
                    </select>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <Clock3
                        size={17}
                        className="text-indigo-600"
                      />

                      <p className="mt-2 text-sm font-bold">
                        {quiz.duration_minutes} min
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <FileQuestion
                        size={17}
                        className="text-cyan-600"
                      />

                      <p className="mt-2 text-sm font-bold">
                        {quiz.question_count ?? 0}{" "}
                        questions
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <CheckCircle2
                        size={17}
                        className="text-emerald-600"
                      />

                      <p className="mt-2 text-sm font-bold">
                        {Number(
                          quiz.passing_percentage || 0
                        ).toFixed(0)}
                        % pass
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <BookOpen
                        size={17}
                        className="text-amber-600"
                      />

                      <p className="mt-2 text-sm font-bold">
                        {quiz.max_attempts ?? "No limit"}{" "}
                        attempts
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 p-5">
                  <Link
                    to={`/admin/quizzes/${quiz.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={17} />
                    View
                  </Link>

                  <Link
                    to={`/admin/quizzes/${quiz.id}/edit`}
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 font-bold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <Pencil size={17} />
                    Edit
                  </Link>

                  <Link
                    to={`/admin/quizzes/${quiz.id}/questions`}
                    className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 font-bold text-cyan-700 transition hover:bg-cyan-100"
                  >
                    <FileQuestion size={17} />
                    Questions
                  </Link>

                  <button
                    type="button"
                    disabled={
                      String(deletingId) ===
                      String(quiz.id)
                    }
                    onClick={() =>
                      confirmDeleteQuiz(quiz)
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto"
                  >
                    <Trash2 size={17} />

                    {String(deletingId) ===
                    String(quiz.id)
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>

      <ConfirmModal
        open={Boolean(quizToDelete)}
        title="Delete quiz?"
        message={`Are you sure you want to delete "${
          quizToDelete?.title || ""
        }"? Questions and related quiz data may also be removed.`}
        confirmText="Delete quiz"
        danger
        loading={
          String(deletingId) ===
          String(quizToDelete?.id)
        }
        onCancel={cancelDeleteQuiz}
        onConfirm={handleDelete}
      />

      <ConfirmModal
        open={Boolean(statusChange)}
        title="Change quiz status?"
        message={`Change "${
          statusChange?.quiz?.title || ""
        }" from ${
          statusChange?.quiz?.status || ""
        } to ${statusChange?.newStatus || ""}?`}
        confirmText={`Change to ${
          statusChange?.newStatus || ""
        }`}
        loading={
          String(changingStatusId) ===
          String(statusChange?.quiz?.id)
        }
        onCancel={cancelStatusChange}
        onConfirm={handleStatusChange}
      />
    </main>
  );
}


function StatusTab({
  label,
  value,
  count,
  selectedStatus,
  onSelect,
}) {
  const active = selectedStatus === value;

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition ${
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      {label}

      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          active
            ? "bg-white/20 text-white"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

export default AdminQuizzesPage;
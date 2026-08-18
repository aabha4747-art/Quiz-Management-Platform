import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  FolderOpen,
  Save,
  Target,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../api/axios";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const initialFormData = {
  title: "",
  description: "",
  categoryId: "",
  difficulty: "MEDIUM",
  durationMinutes: 30,
  passingPercentage: 60,
  maxAttempts: 2,
};

function AdminQuizFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(initialFormData);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);

        const categoryResponse = await api.get("/categories");
        const loadedCategories =
          categoryResponse.data.categories || [];

        setCategories(loadedCategories);

        if (editing) {
          const quizResponse = await api.get(`/quizzes/${id}`);

          const quiz =
            quizResponse.data.quiz ||
            quizResponse.data.data?.quiz;

          if (!quiz) {
            throw new Error("Quiz information was not returned");
          }

          setFormData({
            title: quiz.title || "",
            description: quiz.description || "",
            categoryId: String(quiz.category_id || ""),
            difficulty: quiz.difficulty || "MEDIUM",
            durationMinutes: Number(
              quiz.duration_minutes || 30
            ),
            passingPercentage: Number(
              quiz.passing_percentage || 60
            ),
            maxAttempts: Number(quiz.max_attempts || 2),
          });
        } else if (loadedCategories.length > 0) {
          setFormData((current) => ({
            ...current,
            categoryId: String(loadedCategories[0].id),
          }));
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Unable to load quiz form."
        );

        if (editing) {
          navigate("/admin/quizzes", {
            replace: true,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [editing, id, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const title = formData.title.trim();
    const description = formData.description.trim();

    if (title.length < 3) {
      toast.error(
        "Quiz title must contain at least 3 characters."
      );
      return false;
    }

    if (title.length > 200) {
      toast.error(
        "Quiz title cannot exceed 200 characters."
      );
      return false;
    }

    if (description.length < 5) {
      toast.error(
        "Quiz description must contain at least 5 characters."
      );
      return false;
    }

    if (!formData.categoryId) {
      toast.error("Select a quiz category.");
      return false;
    }

    const durationMinutes = Number(
      formData.durationMinutes
    );

    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1 ||
      durationMinutes > 600
    ) {
      toast.error(
        "Duration must be between 1 and 600 minutes."
      );
      return false;
    }

    const passingPercentage = Number(
      formData.passingPercentage
    );

    if (
      Number.isNaN(passingPercentage) ||
      passingPercentage < 0 ||
      passingPercentage > 100
    ) {
      toast.error(
        "Passing percentage must be between 0 and 100."
      );
      return false;
    }

    const maxAttempts = Number(formData.maxAttempts);

    if (
      !Number.isInteger(maxAttempts) ||
      maxAttempts < 1 ||
      maxAttempts > 100
    ) {
      toast.error(
        "Maximum attempts must be between 1 and 100."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      categoryId: Number(formData.categoryId),
      difficulty: formData.difficulty,
      durationMinutes: Number(formData.durationMinutes),
      passingPercentage: Number(
        formData.passingPercentage
      ),
      maxAttempts: Number(formData.maxAttempts),
      status: "DRAFT",
    };

    try {
      setSaving(true);

      if (editing) {
        await api.put(`/quizzes/${id}`, payload);

        toast.success("Quiz updated successfully");

        navigate(`/admin/quizzes/${id}/questions`);
        return;
      }

      const response = await api.post("/quizzes", payload);

      const createdQuiz =
        response.data.quiz ||
        response.data.data?.quiz;

      if (!createdQuiz?.id) {
        throw new Error(
          "Quiz was created, but its ID was not returned"
        );
      }

      toast.success("Quiz created successfully");

      navigate(
        `/admin/quizzes/${createdQuiz.id}/questions`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          `Unable to ${editing ? "update" : "create"} quiz.`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner
        fullScreen
        size="lg"
        title={
          editing
            ? "Loading quiz"
            : "Preparing quiz form"
        }
        message={
          editing
            ? "Retrieving the quiz information."
            : "Loading available categories and form options."
        }
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 sm:px-8">
      <section className="mx-auto max-w-6xl">
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
              Admin workspace
            </p>

            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              {editing ? "Edit Quiz" : "Create Quiz"}
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              {editing
                ? "Update the assessment settings and continue managing its questions."
                : "Configure the assessment first, then add questions and answer options."}
            </p>
          </div>
        </section>

        {categories.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
            <FolderOpen
              size={42}
              className="mx-auto text-amber-600"
            />

            <h2 className="mt-4 text-2xl font-black text-amber-950">
              Create a category first
            </h2>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-amber-800">
              Every quiz must belong to a category. Add at
              least one category before creating a quiz.
            </p>

            <Link
              to="/admin/categories"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-3 font-bold text-white transition hover:bg-amber-700"
            >
              Manage categories
            </Link>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-8 xl:grid-cols-[1.4fr_0.6fr]"
          >
            <section className="space-y-8">
              <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                    <BookOpen size={23} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-slate-950">
                      Quiz information
                    </h2>

                    <p className="mt-1 text-slate-500">
                      Enter the title, description and category.
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <div>
                    <label
                      htmlFor="quiz-title"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Quiz title
                    </label>

                    <input
                      id="quiz-title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Example: Python Fundamentals"
                      maxLength={200}
                      autoFocus
                      className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="quiz-description"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Description
                    </label>

                    <textarea
                      id="quiz-description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe what learners will be assessed on."
                      rows={6}
                      maxLength={3000}
                      className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />

                    <p className="mt-2 text-right text-sm text-slate-400">
                      {formData.description.length}/3000
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="quiz-category"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Category
                    </label>

                    <select
                      id="quiz-category"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="">
                        Select a category
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
                </div>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600">
                    <FileQuestion size={23} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-slate-950">
                      Assessment settings
                    </h2>

                    <p className="mt-1 text-slate-500">
                      Configure difficulty, duration and scoring.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="quiz-difficulty"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Difficulty
                    </label>

                    <select
                      id="quiz-difficulty"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="quiz-duration"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Duration in minutes
                    </label>

                    <input
                      id="quiz-duration"
                      name="durationMinutes"
                      type="number"
                      min="1"
                      max="600"
                      step="1"
                      value={formData.durationMinutes}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="quiz-passing-score"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Passing percentage
                    </label>

                    <input
                      id="quiz-passing-score"
                      name="passingPercentage"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.passingPercentage}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="quiz-attempts"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Maximum attempts
                    </label>

                    <input
                      id="quiz-attempts"
                      name="maxAttempts"
                      type="number"
                      min="1"
                      max="100"
                      step="1"
                      value={formData.maxAttempts}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>
                </div>
              </article>
            </section>

            <aside className="space-y-6">
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-8">
                <p className="text-sm font-black uppercase tracking-wider text-indigo-600">
                  Quiz summary
                </p>

                <h2 className="mt-3 break-words text-2xl font-black text-slate-950">
                  {formData.title.trim() ||
                    "Untitled assessment"}
                </h2>

                <p className="mt-3 line-clamp-4 leading-7 text-slate-500">
                  {formData.description.trim() ||
                    "Your quiz description will appear here."}
                </p>

                <div className="mt-6 space-y-3">
                  <SummaryRow
                    icon={<FolderOpen size={18} />}
                    label="Category"
                    value={
                      categories.find(
                        (category) =>
                          String(category.id) ===
                          String(formData.categoryId)
                      )?.name || "Not selected"
                    }
                  />

                  <SummaryRow
                    icon={<Clock3 size={18} />}
                    label="Duration"
                    value={`${formData.durationMinutes || 0} min`}
                  />

                  <SummaryRow
                    icon={<Target size={18} />}
                    label="Passing score"
                    value={`${formData.passingPercentage || 0}%`}
                  />

                  <SummaryRow
                    icon={<CheckCircle2 size={18} />}
                    label="Difficulty"
                    value={formData.difficulty}
                  />

                  <SummaryRow
                    icon={<BookOpen size={18} />}
                    label="Attempts"
                    value={formData.maxAttempts}
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-black text-amber-950">
                    Saved as draft
                  </p>

                  <p className="mt-2 text-sm leading-6 text-amber-800">
                    Add questions before publishing this quiz to
                    students.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={19} />

                  {saving
                    ? editing
                      ? "Saving changes..."
                      : "Creating quiz..."
                    : editing
                      ? "Save and manage questions"
                      : "Create and add questions"}
                </button>
              </article>
            </aside>
          </form>
        )}
      </section>
    </main>
  );
}

function SummaryRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-3 text-slate-500">
        {icon}
        <span className="text-sm">{label}</span>
      </div>

      <span className="max-w-32 truncate text-right text-sm font-black text-slate-950">
        {value}
      </span>
    </div>
  );
}

export default AdminQuizFormPage;
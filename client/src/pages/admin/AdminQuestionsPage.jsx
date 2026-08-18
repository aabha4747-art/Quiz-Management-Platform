import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileQuestion,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import ConfirmModal from "../../components/ui/ConfirmModal";

const emptyForm = {
  questionText: "",
  marks: "1",
  explanation: "",
  difficulty: "EASY",
  position: "1",
  options: [
    {
      optionText: "",
      isCorrect: true,
    },
    {
      optionText: "",
      isCorrect: false,
    },
    {
      optionText: "",
      isCorrect: false,
    },
    {
      optionText: "",
      isCorrect: false,
    },
  ],
};

const difficultyStyles = {
  EASY: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HARD: "bg-rose-100 text-rose-700",
};

function AdminQuestionsPage() {
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const loadData = async () => {
    try {
      const [questionResponse, quizResponse] = await Promise.all([
        api.get(`/quizzes/${quizId}/questions`),
        api.get(`/quizzes/${quizId}`),
      ]);

      setQuestions(questionResponse.data.questions || []);
      setQuiz(quizResponse.data.quiz || questionResponse.data.quiz);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load question management data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [quizId]);

  const filteredQuestions = useMemo(() => {
    const searchValue = searchText.trim().toLowerCase();

    if (!searchValue) {
      return questions;
    }

    return questions.filter((question) => {
      return (
        question.question_text
          ?.toLowerCase()
          .includes(searchValue) ||
        question.explanation
          ?.toLowerCase()
          .includes(searchValue)
      );
    });
  }, [questions, searchText]);

  const quizIsPublished = quiz?.status === "PUBLISHED";

  const openCreateModal = () => {
    if (quizIsPublished) {
      toast.error(
        "Unpublish the quiz before adding questions."
      );
      return;
    }

    setEditingQuestion(null);

    setFormData({
      ...emptyForm,
      position: String(questions.length + 1),
      options: emptyForm.options.map((option) => ({
        ...option,
      })),
    });

    setModalOpen(true);
  };

  const openEditModal = (question) => {
    if (quizIsPublished) {
      toast.error(
        "Unpublish the quiz before editing questions."
      );
      return;
    }

    setEditingQuestion(question);

    setFormData({
      questionText: question.question_text || "",
      marks: String(question.marks || 1),
      explanation: question.explanation || "",
      difficulty: question.difficulty || "EASY",
      position: String(question.position || 1),
      options: (question.options || []).map((option) => ({
        optionText: option.optionText || "",
        isCorrect: Boolean(option.isCorrect),
      })),
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingQuestion(null);
  };

  const updateField = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const updateOptionText = (index, value) => {
    setFormData((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index
          ? {
              ...option,
              optionText: value,
            }
          : option
      ),
    }));
  };

  const markCorrectOption = (index) => {
    setFormData((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => ({
        ...option,
        isCorrect: optionIndex === index,
      })),
    }));
  };

  const addOption = () => {
    if (formData.options.length >= 8) {
      toast.error("A question can contain at most 8 options.");
      return;
    }

    setFormData((current) => ({
      ...current,
      options: [
        ...current.options,
        {
          optionText: "",
          isCorrect: false,
        },
      ],
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      toast.error("A question must contain at least 2 options.");
      return;
    }

    const removedOptionWasCorrect =
      formData.options[index]?.isCorrect;

    const updatedOptions = formData.options.filter(
      (_, optionIndex) => optionIndex !== index
    );

    if (
      removedOptionWasCorrect &&
      updatedOptions.length > 0
    ) {
      updatedOptions[0] = {
        ...updatedOptions[0],
        isCorrect: true,
      };
    }

    setFormData((current) => ({
      ...current,
      options: updatedOptions,
    }));
  };

  const validateForm = () => {
    if (formData.questionText.trim().length < 5) {
      toast.error(
        "Question text must contain at least 5 characters."
      );
      return false;
    }

    if (
      Number(formData.marks) <= 0 ||
      Number.isNaN(Number(formData.marks))
    ) {
      toast.error("Marks must be greater than zero.");
      return false;
    }

    if (
      Number(formData.position) < 1 ||
      !Number.isInteger(Number(formData.position))
    ) {
      toast.error("Position must be a positive integer.");
      return false;
    }

    if (
      formData.options.some(
        (option) => !option.optionText.trim()
      )
    ) {
      toast.error("Every option must contain text.");
      return false;
    }

    const correctOptionCount = formData.options.filter(
      (option) => option.isCorrect
    ).length;

    if (correctOptionCount !== 1) {
      toast.error(
        "Exactly one option must be marked as correct."
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
      questionText: formData.questionText.trim(),
      marks: Number(formData.marks),
      explanation:
        formData.explanation.trim() || null,
      difficulty: formData.difficulty,
      position: Number(formData.position),
      options: formData.options.map((option) => ({
        optionText: option.optionText.trim(),
        isCorrect: option.isCorrect,
      })),
    };

    try {
      setSaving(true);

      if (editingQuestion) {
        await api.put(
          `/questions/${editingQuestion.id}`,
          payload
        );

        toast.success("Question updated successfully.");
      } else {
        await api.post(
          `/quizzes/${quizId}/questions`,
          payload
        );

        toast.success("Question created successfully.");
      }

      setModalOpen(false);
      setEditingQuestion(null);
      await loadData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to save question."
      );
    } finally {
      setSaving(false);
    }
  };

  const requestDeleteQuestion = (question) => {
    if (quizIsPublished) {
      toast.error(
        "Unpublish the quiz before deleting questions."
      );
      return;
    }

    setQuestionToDelete(question);
  };

  const cancelDeleteQuestion = () => {
    if (deletingId) {
      return;
    }

    setQuestionToDelete(null);
  };

  const handleDelete = async () => {
    if (!questionToDelete) {
      return;
    }

    try {
      setDeletingId(questionToDelete.id);

      await api.delete(`/questions/${questionToDelete.id}`);

      setQuestions((current) =>
        current.filter(
          (currentQuestion) =>
            String(currentQuestion.id) !==
            String(questionToDelete.id)
        )
      );

      toast.success("Question deleted successfully.");
      setQuestionToDelete(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete question."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 sm:px-8">
      <section className="mx-auto max-w-7xl">
        <Link
          to="/admin/quizzes"
          className="inline-flex items-center gap-2 font-semibold text-slate-600 transition hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Back to quizzes
        </Link>

        <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-800 p-8 text-white shadow-xl sm:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
                Question management
              </p>

              <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                {quiz?.title || "Quiz questions"}
              </h1>

              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                Create questions, configure answer options and select
                the correct response.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
                  {questions.length} question
                  {questions.length === 1 ? "" : "s"}
                </span>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    quizIsPublished
                      ? "bg-emerald-400/20 text-emerald-100"
                      : "bg-amber-400/20 text-amber-100"
                  }`}
                >
                  {quiz?.status || "DRAFT"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              disabled={quizIsPublished}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={19} />
              Add question
            </button>
          </div>
        </section>

        {quizIsPublished && (
          <section className="mt-6 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <AlertTriangle
              size={22}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <h2 className="font-black">
                This quiz is published
              </h2>

              <p className="mt-1 leading-7">
                Change the quiz status to Draft or Unpublished before
                adding, editing or deleting questions.
              </p>
            </div>
          </section>
        )}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Question bank
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-950">
                {filteredQuestions.length} shown
              </h2>
            </div>

            <div className="relative w-full lg:max-w-md">
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
                placeholder="Search questions..."
                className="w-full rounded-xl border border-slate-300 py-3.5 pl-12 pr-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>
        </section>

        {loading ? (
          <section className="mt-6 space-y-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-3xl bg-white"
              />
            ))}
          </section>
        ) : filteredQuestions.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <FileQuestion
              size={44}
              className="mx-auto text-slate-400"
            />

            <h3 className="mt-4 text-xl font-black text-slate-900">
              No questions found
            </h3>

            <p className="mt-2 text-slate-500">
              Add a question or change the search term.
            </p>
          </section>
        ) : (
          <section className="mt-6 space-y-5">
            {filteredQuestions.map((question) => {
              const correctOption = question.options?.find(
                (option) => option.isCorrect
              );

              return (
                <article
                  key={question.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg sm:p-7"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">
                          Question {question.position}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            difficultyStyles[
                              question.difficulty
                            ] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {question.difficulty}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {Number(question.marks)} mark
                          {Number(question.marks) === 1
                            ? ""
                            : "s"}
                        </span>
                      </div>

                      <h2 className="mt-5 text-xl font-black leading-8 text-slate-950 sm:text-2xl">
                        {question.question_text}
                      </h2>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(question)
                        }
                        disabled={quizIsPublished}
                        className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Edit question"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          requestDeleteQuestion(question)
                        }
                        disabled={
                          quizIsPublished ||
                          String(deletingId) ===
                            String(question.id)
                        }
                        className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Delete question"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {(question.options || []).map(
                      (option, optionIndex) => (
                        <div
                          key={option.id}
                          className={`flex items-center gap-3 rounded-2xl border p-4 ${
                            option.isCorrect
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-black ${
                              option.isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-white text-slate-600"
                            }`}
                          >
                            {option.isCorrect ? (
                              <CheckCircle2 size={18} />
                            ) : (
                              String.fromCharCode(
                                65 + optionIndex
                              )
                            )}
                          </span>

                          <span
                            className={`font-semibold ${
                              option.isCorrect
                                ? "text-emerald-900"
                                : "text-slate-700"
                            }`}
                          >
                            {option.optionText}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
                      Correct answer
                    </p>

                    <p className="mt-2 font-bold text-emerald-900">
                      {correctOption?.optionText ||
                        "No correct option configured"}
                    </p>
                  </div>

                  {question.explanation && (
                    <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-indigo-600">
                        Explanation
                      </p>

                      <p className="mt-2 leading-7 text-indigo-900">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 px-5 py-8 backdrop-blur-sm">
          <section className="mx-auto w-full max-w-3xl rounded-3xl bg-white p-7 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                  {editingQuestion
                    ? "Edit question"
                    : "New question"}
                </p>

                <h2 className="mt-2 text-3xl font-black text-slate-950">
                  {editingQuestion
                    ? "Update question"
                    : "Create question"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-6"
            >
              <div>
                <label
                  htmlFor="questionText"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Question
                </label>

                <textarea
                  id="questionText"
                  name="questionText"
                  value={formData.questionText}
                  onChange={updateField}
                  rows={4}
                  placeholder="Enter the question text"
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="marks"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Marks
                  </label>

                  <input
                    id="marks"
                    name="marks"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.marks}
                    onChange={updateField}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="difficulty"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Difficulty
                  </label>

                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={updateField}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="position"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Position
                  </label>

                  <input
                    id="position"
                    name="position"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.position}
                    onChange={updateField}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="explanation"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Explanation
                </label>

                <textarea
                  id="explanation"
                  name="explanation"
                  value={formData.explanation}
                  onChange={updateField}
                  rows={3}
                  placeholder="Explain why the correct answer is correct"
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black text-slate-950">
                      Answer options
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Select exactly one correct option.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addOption}
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 font-bold text-indigo-700 hover:bg-indigo-100"
                  >
                    <Plus size={17} />
                    Add option
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {formData.options.map(
                    (option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${
                          option.isCorrect
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            markCorrectOption(optionIndex)
                          }
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black ${
                            option.isCorrect
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-slate-600"
                          }`}
                          title="Mark as correct"
                        >
                          {option.isCorrect ? (
                            <CheckCircle2 size={19} />
                          ) : (
                            String.fromCharCode(
                              65 + optionIndex
                            )
                          )}
                        </button>

                        <input
                          type="text"
                          value={option.optionText}
                          onChange={(event) =>
                            updateOptionText(
                              optionIndex,
                              event.target.value
                            )
                          }
                          placeholder={`Option ${
                            optionIndex + 1
                          }`}
                          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeOption(optionIndex)
                          }
                          className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-600 hover:bg-rose-100"
                          aria-label="Remove option"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingQuestion
                    ? "Save changes"
                    : "Create question"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}


      <ConfirmModal
        open={Boolean(questionToDelete)}
        title="Delete question?"
        message={`Are you sure you want to delete question ${
          questionToDelete?.position || ""
        }: "${questionToDelete?.question_text || ""}"? This action cannot be undone.`}
        confirmText="Delete question"
        danger
        loading={
          String(deletingId) ===
          String(questionToDelete?.id)
        }
        onCancel={cancelDeleteQuestion}
        onConfirm={handleDelete}
      />
    </main>
  );
}

export default AdminQuestionsPage;
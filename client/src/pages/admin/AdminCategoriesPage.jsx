import { useEffect, useMemo, useState } from "react";
import {
  FolderOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import ConfirmModal from "../../components/ui/ConfirmModal";

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const loadCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.categories || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const searchValue = searchText.trim().toLowerCase();

    if (!searchValue) {
      return categories;
    }

    return categories.filter((category) => {
      const name = category.name?.toLowerCase() || "";
      const description =
        category.description?.toLowerCase() || "";

      return (
        name.includes(searchValue) ||
        description.includes(searchValue)
      );
    });
  }, [categories, searchText]);

  const openCreateModal = () => {
    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
    });

    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name || "",
      description: category.description || "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSaving(true);

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, {
          name,
          description,
        });

        toast.success("Category updated successfully");
      } else {
        await api.post("/categories", {
          name,
          description,
        });

        toast.success("Category created successfully");
      }

      setModalOpen(false);
      setEditingCategory(null);

      setFormData({
        name: "",
        description: "",
      });

      await loadCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirmation = (category) => {
    setCategoryToDelete(category);
  };

  const closeDeleteConfirmation = () => {
    if (deleting) {
      return;
    }

    setCategoryToDelete(null);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) {
      return;
    }

    try {
      setDeleting(true);

      await api.delete(
        `/categories/${categoryToDelete.id}`
      );

      setCategories((current) =>
        current.filter(
          (category) =>
            String(category.id) !==
            String(categoryToDelete.id)
        )
      );

      toast.success("Category deleted successfully");
      setCategoryToDelete(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete category."
      );
    } finally {
      setDeleting(false);
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
                Category Management
              </h1>

              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                Organize quizzes into clear topics and maintain the
                categories available across QuizNova.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:bg-indigo-50"
            >
              <Plus size={19} />
              Add category
            </button>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Categories
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-950">
                {categories.length} total
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
                placeholder="Search categories..."
                className="w-full rounded-xl border border-slate-300 py-3.5 pl-12 pr-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>
        </section>

        {loading ? (
          <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-3xl bg-white"
              />
            ))}
          </section>
        ) : filteredCategories.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <FolderOpen
              size={42}
              className="mx-auto text-slate-400"
            />

            <h3 className="mt-4 text-xl font-black text-slate-900">
              No categories found
            </h3>

            <p className="mt-2 text-slate-500">
              Add a category or change the search term.
            </p>
          </section>
        ) : (
          <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCategories.map((category) => (
              <article
                key={category.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                    <FolderOpen size={23} />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(category)
                      }
                      className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                      aria-label={`Edit ${category.name}`}
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openDeleteConfirmation(category)
                      }
                      className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Delete ${category.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                <h3 className="mt-5 text-2xl font-black text-slate-950">
                  {category.name}
                </h3>

                <p className="mt-3 min-h-14 leading-7 text-slate-500">
                  {category.description ||
                    "No description has been added."}
                </p>

                <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-500">
                    Quizzes
                  </span>

                  <span className="text-xl font-black text-slate-950">
                    {category.quiz_count ?? 0}
                  </span>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-5 py-8 backdrop-blur-sm">
          <section className="w-full max-w-xl rounded-3xl bg-white p-7 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                  {editingCategory
                    ? "Edit category"
                    : "New category"}
                </p>

                <h2 className="mt-2 text-3xl font-black text-slate-950">
                  {editingCategory
                    ? "Update category"
                    : "Create category"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                aria-label="Close category form"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Category name
                </label>

                <input
                  id="category-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: Python"
                  maxLength={100}
                  autoFocus
                  className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="category-description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="category-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the quizzes in this category."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
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
                    : editingCategory
                      ? "Save changes"
                      : "Create category"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <ConfirmModal
        open={Boolean(categoryToDelete)}
        title="Delete category?"
        message={`Are you sure you want to delete "${
          categoryToDelete?.name || ""
        }"? This action cannot be undone.`}
        confirmText="Delete category"
        danger
        loading={deleting}
        onCancel={closeDeleteConfirmation}
        onConfirm={handleDelete}
      />
    </main>
  );
}

export default AdminCategoriesPage;
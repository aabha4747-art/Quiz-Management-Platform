import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Award,
  Eye,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";

const statusStyles = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-rose-100 text-rose-700",
};

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
}

function formatTime(seconds) {
  const totalSeconds = Number(seconds || 0);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changingStatusId, setChangingStatusId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAttempts, setStudentAttempts] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadStudents = async () => {
    try {
      const response = await api.get("/users");
      setStudents(response.data.users || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const searchValue = searchText.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !searchValue ||
        student.name?.toLowerCase().includes(searchValue) ||
        student.email?.toLowerCase().includes(searchValue);

      const matchesStatus =
        selectedStatus === "ALL" ||
        student.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchText, selectedStatus]);

  const activeCount = students.filter(
    (student) => student.status === "ACTIVE"
  ).length;

  const inactiveCount = students.filter(
    (student) => student.status === "INACTIVE"
  ).length;

  const totalAttempts = students.reduce(
    (total, student) =>
      total + Number(student.total_attempts || 0),
    0
  );

  const openStudentDetails = async (student) => {
    try {
      setDetailsOpen(true);
      setDetailsLoading(true);
      setSelectedStudent(student);
      setStudentAttempts([]);

      const response = await api.get(`/users/${student.id}`);

      setSelectedStudent(response.data.user);
      setStudentAttempts(response.data.attempts || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load student details."
      );

      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    if (detailsLoading) {
      return;
    }

    setDetailsOpen(false);
    setSelectedStudent(null);
    setStudentAttempts([]);
  };

  const handleStatusChange = async (student) => {
    const newStatus =
      student.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const confirmed = window.confirm(
      `Change ${student.name}'s account to ${newStatus}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setChangingStatusId(student.id);

      const response = await api.patch(
        `/users/${student.id}/status`,
        {
          status: newStatus,
        }
      );

      const updatedUser = response.data.user;

      setStudents((current) =>
        current.map((currentStudent) =>
          String(currentStudent.id) === String(student.id)
            ? {
                ...currentStudent,
                status: updatedUser.status,
                updated_at: updatedUser.updated_at,
              }
            : currentStudent
        )
      );

      if (
        selectedStudent &&
        String(selectedStudent.id) === String(student.id)
      ) {
        setSelectedStudent((current) => ({
          ...current,
          status: updatedUser.status,
          updated_at: updatedUser.updated_at,
        }));
      }

      toast.success(
        `Student account changed to ${newStatus}`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update student status."
      );
    } finally {
      setChangingStatusId(null);
    }
  };

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Delete the account for "${student.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(student.id);

      await api.delete(`/users/${student.id}`);

      setStudents((current) =>
        current.filter(
          (currentStudent) =>
            String(currentStudent.id) !== String(student.id)
        )
      );

      if (
        selectedStudent &&
        String(selectedStudent.id) === String(student.id)
      ) {
        closeDetails();
      }

      toast.success("Student account deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete student."
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

          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
              Admin workspace
            </p>

            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              Student Management
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              Review student performance, manage account access and
              inspect quiz-attempt history.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Users size={24} className="text-indigo-600" />

            <p className="mt-4 text-sm text-slate-500">
              Total students
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {students.length}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <UserCheck size={24} className="text-emerald-600" />

            <p className="mt-4 text-sm text-slate-500">
              Active accounts
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {activeCount}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <UserX size={24} className="text-rose-600" />

            <p className="mt-4 text-sm text-slate-500">
              Inactive accounts
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {inactiveCount}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Activity size={24} className="text-cyan-600" />

            <p className="mt-4 text-sm text-slate-500">
              Total attempts
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {totalAttempts}
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
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
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-slate-300 py-3.5 pl-12 pr-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="ALL">All account statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </section>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Registered students
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-950">
            {filteredStudents.length} shown
          </h2>
        </div>

        {loading ? (
          <section className="mt-6 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-3xl bg-white"
              />
            ))}
          </section>
        ) : filteredStudents.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <UserRound
              size={44}
              className="mx-auto text-slate-400"
            />

            <h3 className="mt-4 text-xl font-black text-slate-900">
              No students found
            </h3>

            <p className="mt-2 text-slate-500">
              Change the search text or status filter.
            </p>
          </section>
        ) : (
          <section className="mt-6 space-y-4">
            {filteredStudents.map((student) => (
              <article
                key={student.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg sm:p-6"
              >
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-black text-indigo-700">
                      {student.name?.charAt(0)?.toUpperCase() ||
                        "S"}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-xl font-black text-slate-950">
                          {student.name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            statusStyles[student.status] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {student.status}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-slate-500">
                        {student.email}
                      </p>

                      <p className="mt-2 text-sm text-slate-400">
                        Joined {formatDate(student.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="grid flex-1 gap-3 sm:grid-cols-4 xl:max-w-2xl">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Attempts
                      </p>

                      <p className="mt-2 text-xl font-black text-slate-950">
                        {student.total_attempts ?? 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Quizzes
                      </p>

                      <p className="mt-2 text-xl font-black text-slate-950">
                        {student.quizzes_attempted ?? 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-indigo-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                        Average
                      </p>

                      <p className="mt-2 text-xl font-black text-indigo-700">
                        {Number(
                          student.average_score || 0
                        ).toFixed(0)}
                        %
                      </p>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        Highest
                      </p>

                      <p className="mt-2 text-xl font-black text-emerald-700">
                        {Number(
                          student.highest_score || 0
                        ).toFixed(0)}
                        %
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        openStudentDetails(student)
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye size={17} />
                      Details
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(student)
                      }
                      disabled={
                        String(changingStatusId) ===
                        String(student.id)
                      }
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-bold disabled:opacity-60 ${
                        student.status === "ACTIVE"
                          ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {student.status === "ACTIVE" ? (
                        <UserX size={17} />
                      ) : (
                        <UserCheck size={17} />
                      )}

                      {String(changingStatusId) ===
                      String(student.id)
                        ? "Updating..."
                        : student.status === "ACTIVE"
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(student)}
                      disabled={
                        String(deletingId) ===
                        String(student.id)
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                    >
                      <Trash2 size={17} />

                      {String(deletingId) ===
                      String(student.id)
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>

      {detailsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 px-5 py-8 backdrop-blur-sm">
          <section className="mx-auto w-full max-w-5xl rounded-3xl bg-white p-7 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                  Student profile
                </p>

                <h2 className="mt-2 text-3xl font-black text-slate-950">
                  {selectedStudent?.name || "Student details"}
                </h2>

                <p className="mt-2 text-slate-500">
                  {selectedStudent?.email}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
                aria-label="Close student details"
              >
                <X size={20} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="mt-10 py-16 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

                <p className="mt-4 font-medium text-slate-500">
                  Loading student details...
                </p>
              </div>
            ) : (
              <>
                <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <Activity
                      size={21}
                      className="text-indigo-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Total attempts
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      {selectedStudent?.total_attempts ?? 0}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <ShieldCheck
                      size={21}
                      className="text-cyan-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Unique quizzes
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      {selectedStudent?.quizzes_attempted ??
                        0}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-indigo-50 p-5">
                    <Award
                      size={21}
                      className="text-indigo-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Average score
                    </p>

                    <p className="mt-2 text-2xl font-black text-indigo-700">
                      {Number(
                        selectedStudent?.average_score || 0
                      ).toFixed(0)}
                      %
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-5">
                    <Award
                      size={21}
                      className="text-emerald-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Highest score
                    </p>

                    <p className="mt-2 text-2xl font-black text-emerald-700">
                      {Number(
                        selectedStudent?.highest_score || 0
                      ).toFixed(0)}
                      %
                    </p>
                  </div>
                </section>

                <section className="mt-8">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                      Attempt history
                    </p>

                    <h3 className="mt-2 text-2xl font-black text-slate-950">
                      {studentAttempts.length} attempt
                      {studentAttempts.length === 1 ? "" : "s"}
                    </h3>
                  </div>

                  {studentAttempts.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                      This student has not attempted any quizzes.
                    </div>
                  ) : (
                    <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                              Quiz
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                              Score
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                              Status
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                              Time
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                              Date
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200 bg-white">
                          {studentAttempts.map((attempt) => (
                            <tr key={attempt.id}>
                              <td className="px-5 py-4">
                                <p className="font-bold text-slate-900">
                                  {attempt.quiz_title}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                  {attempt.category_name}
                                </p>
                              </td>

                              <td className="px-5 py-4 font-black text-slate-900">
                                {Number(
                                  attempt.percentage || 0
                                ).toFixed(0)}
                                %
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                                    attempt.status === "PASSED"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : attempt.status === "FAILED"
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {attempt.status}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-slate-600">
                                {attempt.time_taken_seconds == null
                                  ? "In progress"
                                  : formatTime(
                                      attempt.time_taken_seconds
                                    )}
                              </td>

                              <td className="px-5 py-4 text-slate-600">
                                {formatDate(attempt.started_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminStudentsPage;
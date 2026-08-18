import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Eye,
  History,
  PlayCircle,
  Trophy,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import MetricCard from "../../components/ui/MetricCard";
import FilterBar from "../../components/ui/FilterBar";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const ITEMS_PER_PAGE = 8;

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

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const remainingSeconds =
    totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

function AttemptHistoryPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("ALL");

  const [
    selectedDifficulty,
    setSelectedDifficulty,
  ] = useState("ALL");

  const [sortOrder, setSortOrder] =
    useState("LATEST");

  const [currentPage, setCurrentPage] =
    useState(1);

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        const response = await api.get(
          "/attempts"
        );

        const rows =
          response.data.attempts ??
          response.data.history ??
          response.data.data?.attempts ??
          [];

        setAttempts(
          Array.isArray(rows) ? rows : []
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Unable to load attempt history."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAttempts();
  }, []);

  const filteredAttempts = useMemo(() => {
    const searchValue = searchText
      .trim()
      .toLowerCase();

    return [...attempts]
      .filter((attempt) => {
        const quizTitle = String(
          attempt.quiz_title ??
            attempt.title ??
            ""
        ).toLowerCase();

        const categoryName = String(
          attempt.category_name ?? ""
        ).toLowerCase();

        const matchesSearch =
          !searchValue ||
          quizTitle.includes(searchValue) ||
          categoryName.includes(searchValue);

        const matchesStatus =
          selectedStatus === "ALL" ||
          attempt.status === selectedStatus;

        const matchesDifficulty =
          selectedDifficulty === "ALL" ||
          attempt.difficulty ===
            selectedDifficulty;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesDifficulty
        );
      })
      .sort((first, second) => {
        const firstDate = new Date(
          first.completed_at ||
            first.started_at ||
            0
        ).getTime();

        const secondDate = new Date(
          second.completed_at ||
            second.started_at ||
            0
        ).getTime();

        if (sortOrder === "OLDEST") {
          return firstDate - secondDate;
        }

        if (
          sortOrder === "HIGHEST_SCORE"
        ) {
          return (
            Number(
              second.percentage || 0
            ) -
            Number(
              first.percentage || 0
            )
          );
        }

        if (
          sortOrder === "LOWEST_SCORE"
        ) {
          return (
            Number(
              first.percentage || 0
            ) -
            Number(
              second.percentage || 0
            )
          );
        }

        return secondDate - firstDate;
      });
  }, [
    attempts,
    searchText,
    selectedStatus,
    selectedDifficulty,
    sortOrder,
  ]);

  const statistics = useMemo(() => {
    const completedAttempts =
      attempts.filter((attempt) =>
        ["PASSED", "FAILED"].includes(
          attempt.status
        )
      );

    const passedCount =
      completedAttempts.filter(
        (attempt) =>
          attempt.status === "PASSED"
      ).length;

    const averageScore =
      completedAttempts.length > 0
        ? completedAttempts.reduce(
            (total, attempt) =>
              total +
              Number(
                attempt.percentage || 0
              ),
            0
          ) / completedAttempts.length
        : 0;

    const highestScore =
      completedAttempts.length > 0
        ? Math.max(
            ...completedAttempts.map(
              (attempt) =>
                Number(
                  attempt.percentage || 0
                )
            )
          )
        : 0;

    const passRate =
      completedAttempts.length > 0
        ? (passedCount /
            completedAttempts.length) *
          100
        : 0;

    return {
      total: attempts.length,
      averageScore,
      highestScore,
      passRate,
    };
  }, [attempts]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAttempts.length /
        ITEMS_PER_PAGE
    )
  );

  const paginatedAttempts = useMemo(() => {
    const startIndex =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return filteredAttempts.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [
    filteredAttempts,
    currentPage,
  ]);

  const filtersActive =
    searchText.trim() !== "" ||
    selectedStatus !== "ALL" ||
    selectedDifficulty !== "ALL" ||
    sortOrder !== "LATEST";

  const resetFilters = () => {
    setSearchText("");
    setSelectedStatus("ALL");
    setSelectedDifficulty("ALL");
    setSortOrder("LATEST");
    setCurrentPage(1);
  };

  const columns = [
    {
      key: "quiz",
      header: "Quiz",
      render: (attempt) => (
        <QuizIdentity attempt={attempt} />
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (attempt) => (
        <div>
          <p className="font-bold text-slate-800">
            {attempt.category_name ||
              "General"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {attempt.difficulty || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "score",
      header: "Score",
      render: (attempt) => (
        <AttemptScore attempt={attempt} />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (attempt) => (
        <StatusBadge
          status={
            attempt.status ||
            "IN_PROGRESS"
          }
        />
      ),
    },
    {
      key: "time",
      header: "Time taken",
      render: (attempt) => (
        <span className="font-semibold text-slate-700">
          {formatTime(
            attempt.time_taken_seconds
          )}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (attempt) => (
        <span className="text-sm text-slate-500">
          {formatDate(
            attempt.completed_at ||
              attempt.started_at
          )}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (attempt) => (
        <AttemptAction
          attempt={attempt}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <LoadingSpinner
        fullScreen
        size="lg"
        title="Loading attempt history"
        message="Retrieving your quiz attempts."
      />
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Performance"
        title="Attempt History"
        description="Review your previous quiz attempts, compare scores and continue unfinished assessments."
        primaryAction={{
          label: "Browse quizzes",
          to: "/student/quizzes",
          icon: PlayCircle,
          showArrow: true,
        }}
      />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={BookOpenCheck}
          label="Total attempts"
          value={statistics.total}
          note="All quiz attempts"
          iconClass="bg-indigo-100 text-indigo-700"
        />

        <MetricCard
          icon={BarChart3}
          label="Average score"
          value={`${statistics.averageScore.toFixed(
            0
          )}%`}
          note="Across completed attempts"
          iconClass="bg-cyan-100 text-cyan-700"
        />

        <MetricCard
          icon={Trophy}
          label="Best score"
          value={`${statistics.highestScore.toFixed(
            0
          )}%`}
          note="Your highest result"
          iconClass="bg-amber-100 text-amber-700"
        />

        <MetricCard
          icon={CheckCircle2}
          label="Pass rate"
          value={`${statistics.passRate.toFixed(
            0
          )}%`}
          note="Completed attempts passed"
          iconClass="bg-emerald-100 text-emerald-700"
        />
      </section>

      <FilterBar
        searchValue={searchText}
        onSearchChange={(event) => {
          setSearchText(
            event.target.value
          );

          setCurrentPage(1);
        }}
        searchPlaceholder="Search quiz or category..."
        onReset={resetFilters}
        resetDisabled={!filtersActive}
      >
        <FilterBar.Select
          value={selectedStatus}
          onChange={(event) => {
            setSelectedStatus(
              event.target.value
            );

            setCurrentPage(1);
          }}
          ariaLabel="Filter attempts by status"
        >
          <option value="ALL">
            All statuses
          </option>

          <option value="PASSED">
            Passed
          </option>

          <option value="FAILED">
            Failed
          </option>

          <option value="IN_PROGRESS">
            In progress
          </option>

          <option value="EXPIRED">
            Expired
          </option>
        </FilterBar.Select>

        <FilterBar.Select
          value={selectedDifficulty}
          onChange={(event) => {
            setSelectedDifficulty(
              event.target.value
            );

            setCurrentPage(1);
          }}
          ariaLabel="Filter attempts by difficulty"
        >
          <option value="ALL">
            All difficulties
          </option>

          <option value="EASY">
            Easy
          </option>

          <option value="MEDIUM">
            Medium
          </option>

          <option value="HARD">
            Hard
          </option>
        </FilterBar.Select>

        <FilterBar.Select
          value={sortOrder}
          onChange={(event) => {
            setSortOrder(
              event.target.value
            );

            setCurrentPage(1);
          }}
          ariaLabel="Sort attempts"
        >
          <option value="LATEST">
            Latest first
          </option>

          <option value="OLDEST">
            Oldest first
          </option>

          <option value="HIGHEST_SCORE">
            Highest score
          </option>

          <option value="LOWEST_SCORE">
            Lowest score
          </option>
        </FilterBar.Select>
      </FilterBar>

      <section>
        <div className="mb-5">
          <p className="ui-label">
            Attempts
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            {filteredAttempts.length} result
            {filteredAttempts.length === 1
              ? ""
              : "s"}
          </h2>
        </div>

        <div className="hidden xl:block">
          <DataTable
            columns={columns}
            rows={paginatedAttempts}
            getRowKey={(attempt) =>
              attempt.id
            }
            emptyState={
              <EmptyState
                icon={History}
                title="No attempts found"
                message="Try changing your filters or start a new quiz."
                action={{
                  label: "Browse quizzes",
                  to: "/student/quizzes",
                }}
              />
            }
            pagination={{
              currentPage,
              totalPages,
              onPrevious: () =>
                setCurrentPage(
                  (current) =>
                    Math.max(
                      current - 1,
                      1
                    )
                ),
              onNext: () =>
                setCurrentPage(
                  (current) =>
                    Math.min(
                      current + 1,
                      totalPages
                    )
                ),
            }}
          />
        </div>

        <div className="space-y-4 xl:hidden">
          {paginatedAttempts.length === 0 ? (
            <EmptyState
              icon={History}
              title="No attempts found"
              message="Try changing your filters or start a new quiz."
              action={{
                label: "Browse quizzes",
                to: "/student/quizzes",
              }}
            />
          ) : (
            paginatedAttempts.map(
              (attempt) => (
                <AttemptMobileCard
                  key={attempt.id}
                  attempt={attempt}
                />
              )
            )
          )}

          {paginatedAttempts.length > 0 && (
            <MobilePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() =>
                setCurrentPage(
                  (current) =>
                    Math.max(
                      current - 1,
                      1
                    )
                )
              }
              onNext={() =>
                setCurrentPage(
                  (current) =>
                    Math.min(
                      current + 1,
                      totalPages
                    )
                )
              }
            />
          )}
        </div>
      </section>
    </PageContainer>
  );
}

function QuizIdentity({ attempt }) {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
        <BookOpenCheck size={21} />
      </div>

      <div className="min-w-0">
        <p className="max-w-56 truncate font-black text-slate-950">
          {attempt.quiz_title ||
            attempt.title ||
            "Quiz"}
        </p>

        {attempt.attempt_number && (
          <p className="mt-1 text-xs text-slate-500">
            Attempt #
            {attempt.attempt_number}
          </p>
        )}
      </div>
    </div>
  );
}

function AttemptScore({ attempt }) {
  const completed = [
    "PASSED",
    "FAILED",
  ].includes(attempt.status);

  return (
    <span className="text-xl font-black text-slate-950">
      {completed
        ? `${Number(
            attempt.percentage || 0
          ).toFixed(0)}%`
        : "—"}
    </span>
  );
}

function AttemptAction({ attempt }) {
  if (
    attempt.status === "IN_PROGRESS"
  ) {
    return (
      <Link
        to={`/student/attempt/${attempt.id}`}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-indigo-700"
      >
        <PlayCircle size={17} />
        Resume
      </Link>
    );
  }

  if (
    ["PASSED", "FAILED"].includes(
      attempt.status
    )
  ) {
    return (
      <Link
        to={`/student/results/${attempt.id}`}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
      >
        <Eye size={17} />
        Review
      </Link>
    );
  }

  if (
    attempt.status === "EXPIRED"
  ) {
    return (
      <span className="inline-flex rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-500">
        Expired
      </span>
    );
  }

  return (
    <span className="text-sm font-bold text-slate-400">
      —
    </span>
  );
}

function AttemptMobileCard({
  attempt,
}) {
  return (
    <article className="ui-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <QuizIdentity attempt={attempt} />

        <StatusBadge
          status={
            attempt.status ||
            "IN_PROGRESS"
          }
          size="sm"
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="ui-surface-muted p-4">
          <p className="ui-label">
            Score
          </p>

          <p className="mt-2 text-2xl font-black text-slate-950">
            {[
              "PASSED",
              "FAILED",
            ].includes(attempt.status)
              ? `${Number(
                  attempt.percentage || 0
                ).toFixed(0)}%`
              : "—"}
          </p>
        </div>

        <div className="ui-surface-muted p-4">
          <p className="ui-label">
            Time
          </p>

          <p className="mt-2 font-black text-slate-950">
            {formatTime(
              attempt.time_taken_seconds
            )}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays size={17} />

          {formatDate(
            attempt.completed_at ||
              attempt.started_at
          )}
        </div>

        <AttemptAction attempt={attempt} />
      </div>
    </article>
  );
}

function MobilePagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}) {
  return (
    <div className="ui-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Page{" "}
        <span className="font-black text-slate-950">
          {currentPage}
        </span>{" "}
        of{" "}
        <span className="font-black text-slate-950">
          {totalPages}
        </span>
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="ui-button-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={
            currentPage === totalPages
          }
          className="ui-button-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AttemptHistoryPage;
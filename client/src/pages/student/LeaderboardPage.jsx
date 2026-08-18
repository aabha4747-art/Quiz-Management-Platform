import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Award,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
  Filter,
  Medal,
  RefreshCw,
  Search,
  Trophy,
  Users,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";
import useAuth from "../../hooks/useAuth";

import LoadingSpinner from "../../components/ui/LoadingSpinner";

const ITEMS_PER_PAGE = 10;

/* =========================================================
   HELPERS
========================================================= */

function getInitials(
  name = "Student"
) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) =>
      word
        .charAt(0)
        .toUpperCase()
    )
    .join("");
}

function getStudentId(
  student
) {
  return String(
    student?.user_id ??
      student?.student_id ??
      student?.id ??
      ""
  );
}

function getStudentName(
  student
) {
  return (
    student?.student_name ??
    student?.name ??
    student?.user_name ??
    "Student"
  );
}

function getAverageScore(
  student
) {
  return Number(
    student?.average_score ??
      0
  );
}

function getHighestScore(
  student
) {
  return Number(
    student?.highest_score ??
      0
  );
}

function getAttemptCount(
  student
) {
  return Number(
    student?.total_attempts ??
      0
  );
}

function getPassedCount(
  student
) {
  return Number(
    student?.passed_quizzes ??
      0
  );
}

function getXp(
  student
) {
  return Number(
    student?.xp ??
      0
  );
}

function getRank(
  student
) {
  return Number(
    student?.rank ??
      0
  );
}

/* =========================================================
   PAGE
========================================================= */

function LeaderboardPage() {
  const {
    user,
  } = useAuth();

  const [
    leaderboard,
    setLeaderboard,
  ] = useState([]);

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    currentUserEntry,
    setCurrentUserEntry,
  ] = useState(null);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit:
      ITEMS_PER_PAGE,
    totalStudents: 0,
    totalPages: 1,
    hasPreviousPage:
      false,
    hasNextPage:
      false,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    period,
    setPeriod,
  ] = useState("all");

  const [
    categoryId,
    setCategoryId,
  ] = useState("");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  useEffect(() => {
    const loadCategories =
      async () => {
        try {
          const response =
            await api.get(
              "/categories"
            );

          const rows =
            response.data
              ?.categories ||
            [];

          setCategories(
            Array.isArray(
              rows
            )
              ? rows
              : []
          );
        } catch (error) {
          console.error(
            "Category load error:",
            error
          );

          toast.error(
            "Unable to load leaderboard categories."
          );
        }
      };

    loadCategories();
  }, []);

  /* =======================================================
     LEADERBOARD
  ======================================================= */

  useEffect(() => {
    const timeout =
      window.setTimeout(
        () => {
          loadLeaderboard();
        },
        searchText
          ? 350
          : 0
      );

    return () =>
      window.clearTimeout(
        timeout
      );
  }, [
    period,
    categoryId,
    searchText,
    currentPage,
  ]);

  const loadLeaderboard =
    async (
      manualRefresh = false
    ) => {
      try {
        if (
          manualRefresh
        ) {
          setRefreshing(
            true
          );
        } else {
          setLoading(
            true
          );
        }

        const params = {
          period,

          page:
            currentPage,

          limit:
            ITEMS_PER_PAGE,
        };

        if (
          categoryId
        ) {
          params.categoryId =
            categoryId;
        }

        if (
          searchText.trim()
        ) {
          params.search =
            searchText.trim();
        }

        const response =
          await api.get(
            "/leaderboard",
            {
              params,
            }
          );

        const rows =
          response.data
            ?.leaderboard ||
          [];

        setLeaderboard(
          Array.isArray(
            rows
          )
            ? rows
            : []
        );

        setCurrentUserEntry(
          response.data
            ?.currentUser ||
            null
        );

        setPagination({
          page:
            response.data
              ?.pagination
              ?.page ??
            currentPage,

          limit:
            response.data
              ?.pagination
              ?.limit ??
            ITEMS_PER_PAGE,

          totalStudents:
            response.data
              ?.pagination
              ?.totalStudents ??
            0,

          totalPages:
            response.data
              ?.pagination
              ?.totalPages ??
            1,

          hasPreviousPage:
            Boolean(
              response.data
                ?.pagination
                ?.hasPreviousPage
            ),

          hasNextPage:
            Boolean(
              response.data
                ?.pagination
                ?.hasNextPage
            ),
        });

        if (
          manualRefresh
        ) {
          toast.success(
            "Leaderboard refreshed"
          );
        }
      } catch (error) {
        console.error(
          "Leaderboard load error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to load the leaderboard."
        );
      } finally {
        setLoading(
          false
        );

        setRefreshing(
          false
        );
      }
    };

  /* =======================================================
     FILTER HANDLERS
  ======================================================= */

  const changePeriod =
    (
      nextPeriod
    ) => {
      setPeriod(
        nextPeriod
      );

      setCurrentPage(
        1
      );
    };

  const changeCategory =
    (
      event
    ) => {
      setCategoryId(
        event.target.value
      );

      setCurrentPage(
        1
      );
    };

  const changeSearch =
    (
      event
    ) => {
      setSearchText(
        event.target.value
      );

      setCurrentPage(
        1
      );
    };

  const resetFilters =
    () => {
      setPeriod(
        "all"
      );

      setCategoryId(
        ""
      );

      setSearchText(
        ""
      );

      setCurrentPage(
        1
      );
    };

  const filtersActive =
    period !== "all" ||
    categoryId !== "" ||
    searchText.trim() !==
      "";

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const topThree =
    useMemo(() => {
      if (
        currentPage !== 1
      ) {
        return [];
      }

      return leaderboard.filter(
        (student) =>
          getRank(
            student
          ) <= 3
      );
    }, [
      leaderboard,
      currentPage,
    ]);

  const totalAttemptsOnPage =
    leaderboard.reduce(
      (
        total,
        student
      ) =>
        total +
        getAttemptCount(
          student
        ),
      0
    );

  const totalPassesOnPage =
    leaderboard.reduce(
      (
        total,
        student
      ) =>
        total +
        getPassedCount(
          student
        ),
      0
    );

  const highestAverage =
    leaderboard.length >
    0
      ? Math.max(
          ...leaderboard.map(
            (
              student
            ) =>
              getAverageScore(
                student
              )
          )
        )
      : 0;

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading &&
    leaderboard.length ===
      0
  ) {
    return (
      <LoadingSpinner
        fullScreen
        size="lg"
        title="Loading leaderboard"
        message="Calculating BioNova rankings and student performance."
      />
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f7faf9] px-5 py-8 sm:px-8">
      <section className="mx-auto max-w-7xl">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-cyan-800 to-blue-700 p-8 text-white shadow-xl sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100">
                <Trophy
                  size={17}
                />

                BioNova rankings
              </div>

              <h1 className="mt-5 text-4xl font-black sm:text-5xl">
                Leaderboard
              </h1>

              <p className="mt-4 max-w-2xl leading-7 text-cyan-50">
                Compare your biotechnology quiz performance, build XP and move up the BioNova rankings.
              </p>
            </div>

            {currentUserEntry && (
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-cyan-100">
                  Your rank
                </p>

                <div className="mt-2 flex items-end gap-3">
                  <p className="text-4xl font-black">
                    #
                    {getRank(
                      currentUserEntry
                    )}
                  </p>

                  <p className="pb-1 text-sm text-cyan-100">
                    of{" "}
                    {
                      pagination.totalStudents
                    }
                  </p>
                </div>

                <div className="mt-3 flex gap-4 text-xs text-cyan-100">
                  <span>
                    {
                      currentUserEntry.xp
                    }{" "}
                    XP
                  </span>

                  <span>
                    Avg{" "}
                    {getAverageScore(
                      currentUserEntry
                    ).toFixed(
                      0
                    )}
                    %
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5">
            {/* PERIOD */}

            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-teal-700">
                Ranking period
              </p>

              <div className="mt-3 inline-flex rounded-xl bg-slate-100 p-1">
                <PeriodButton
                  active={
                    period ===
                    "all"
                  }
                  onClick={() =>
                    changePeriod(
                      "all"
                    )
                  }
                >
                  Overall
                </PeriodButton>

                <PeriodButton
                  active={
                    period ===
                    "weekly"
                  }
                  onClick={() =>
                    changePeriod(
                      "weekly"
                    )
                  }
                >
                  Weekly
                </PeriodButton>

                <PeriodButton
                  active={
                    period ===
                    "monthly"
                  }
                  onClick={() =>
                    changePeriod(
                      "monthly"
                    )
                  }
                >
                  Monthly
                </PeriodButton>
              </div>
            </div>

            {/* SEARCH + CATEGORY */}

            <div className="grid gap-4 lg:grid-cols-[1fr_280px_auto]">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={
                    searchText
                  }
                  onChange={
                    changeSearch
                  }
                  placeholder="Search students..."
                  className="w-full rounded-xl border border-slate-300 py-3.5 pl-11 pr-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div className="relative">
                <Filter
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={
                    categoryId
                  }
                  onChange={
                    changeCategory
                  }
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-10 font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="">
                    All categories
                  </option>

                  {categories.map(
                    (
                      category
                    ) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    loadLeaderboard(
                      true
                    )
                  }
                  disabled={
                    refreshing
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  <span className="hidden sm:inline">
                    Refresh
                  </span>
                </button>

                {filtersActive && (
                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-black text-rose-700 transition hover:bg-rose-100"
                  >
                    <X
                      size={17}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Users}
            label="Ranked students"
            value={
              pagination.totalStudents
            }
            iconClass="bg-teal-100 text-teal-700"
          />

          <SummaryCard
            icon={
              BookOpenCheck
            }
            label="Attempts on page"
            value={
              totalAttemptsOnPage
            }
            iconClass="bg-cyan-100 text-cyan-700"
          />

          <SummaryCard
            icon={Award}
            label="Passes on page"
            value={
              totalPassesOnPage
            }
            iconClass="bg-emerald-100 text-emerald-700"
          />

          <SummaryCard
            icon={Trophy}
            label="Best average on page"
            value={`${highestAverage.toFixed(
              0
            )}%`}
            iconClass="bg-amber-100 text-amber-700"
          />
        </section>

        {/* =================================================
            PODIUM
        ================================================= */}

        {topThree.length >
          0 && (
          <section className="mt-8">
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-teal-700">
                Top performers
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Leaderboard podium
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Rankings shown for the selected period and category.
              </p>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {topThree.map(
                (
                  student
                ) => (
                  <PodiumCard
                    key={
                      getStudentId(
                        student
                      )
                    }
                    student={
                      student
                    }
                    rank={
                      getRank(
                        student
                      )
                    }
                    currentUserId={
                      user?.id
                    }
                  />
                )
              )}
            </div>
          </section>
        )}

        {/* =================================================
            RANKINGS HEADER
        ================================================= */}

        <section className="mt-8">
          <p className="text-sm font-black uppercase tracking-wider text-teal-700">
            Rankings
          </p>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-3xl font-black text-slate-950">
              {
                pagination.totalStudents
              }{" "}
              student
              {pagination.totalStudents ===
              1
                ? ""
                : "s"}
            </h2>

            <p className="text-sm font-semibold text-slate-500">
              Page{" "}
              {
                pagination.page
              }{" "}
              of{" "}
              {
                pagination.totalPages
              }
            </p>
          </div>
        </section>

        {/* =================================================
            EMPTY
        ================================================= */}

        {leaderboard.length ===
        0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Trophy
              size={44}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-4 text-xl font-black text-slate-950">
              No rankings found
            </h2>

            <p className="mt-2 text-slate-500">
              No students match the selected leaderboard filters.
            </p>

            {filtersActive && (
              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="mt-5 rounded-xl bg-teal-600 px-5 py-3 font-black text-white transition hover:bg-teal-700"
              >
                Clear filters
              </button>
            )}
          </section>
        ) : (
          <>
            {/* ===============================================
                DESKTOP TABLE
            =============================================== */}

            <section className="mt-6 hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <TableHeading>
                        Rank
                      </TableHeading>

                      <TableHeading>
                        Student
                      </TableHeading>

                      <TableHeading>
                        XP
                      </TableHeading>

                      <TableHeading>
                        Level
                      </TableHeading>

                      <TableHeading>
                        Average
                      </TableHeading>

                      <TableHeading>
                        Best
                      </TableHeading>

                      <TableHeading>
                        Passed
                      </TableHeading>

                      <TableHeading>
                        Attempts
                      </TableHeading>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {leaderboard.map(
                      (
                        student
                      ) => (
                        <LeaderboardRow
                          key={
                            getStudentId(
                              student
                            )
                          }
                          student={
                            student
                          }
                          currentUserId={
                            user?.id
                          }
                        />
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ===============================================
                MOBILE
            =============================================== */}

            <section className="mt-6 space-y-4 lg:hidden">
              {leaderboard.map(
                (
                  student
                ) => (
                  <MobileLeaderboardCard
                    key={
                      getStudentId(
                        student
                      )
                    }
                    student={
                      student
                    }
                    currentUserId={
                      user?.id
                    }
                  />
                )
              )}
            </section>

            {/* ===============================================
                PAGINATION
            =============================================== */}

            <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing page{" "}
                <span className="font-black text-slate-900">
                  {
                    pagination.page
                  }
                </span>{" "}
                of{" "}
                <span className="font-black text-slate-900">
                  {
                    pagination.totalPages
                  }
                </span>
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (
                        current
                      ) =>
                        Math.max(
                          current -
                            1,
                          1
                        )
                    )
                  }
                  disabled={
                    !pagination.hasPreviousPage
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft
                    size={18}
                  />

                  Previous
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (
                        current
                      ) =>
                        Math.min(
                          current +
                            1,
                          pagination.totalPages
                        )
                    )
                  }
                  disabled={
                    !pagination.hasNextPage
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next

                  <ChevronRight
                    size={18}
                  />
                </button>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

/* =========================================================
   PERIOD BUTTON
========================================================= */

function PeriodButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2.5 text-sm font-black transition ${
        active
          ? "bg-white text-teal-700 shadow-sm"
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon: Icon,
  label,
  value,
  iconClass,
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
      >
        <Icon
          size={23}
        />
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

/* =========================================================
   PODIUM
========================================================= */

function PodiumCard({
  student,
  rank,
  currentUserId,
}) {
  const isCurrentUser =
    getStudentId(
      student
    ) ===
    String(
      currentUserId
    );

  const styles = {
    1: {
      container:
        "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50",

      avatar:
        "bg-amber-500 text-white",

      icon: Crown,

      iconClass:
        "text-amber-500",

      label:
        "Champion",
    },

    2: {
      container:
        "border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100",

      avatar:
        "bg-slate-500 text-white",

      icon: Medal,

      iconClass:
        "text-slate-500",

      label:
        "Second place",
    },

    3: {
      container:
        "border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50",

      avatar:
        "bg-orange-600 text-white",

      icon: Medal,

      iconClass:
        "text-orange-600",

      label:
        "Third place",
    },
  };

  const style =
    styles[rank] ||
    styles[3];

  const Icon =
    style.icon;

  return (
    <article
      className={`relative overflow-hidden rounded-3xl border p-6 shadow-sm ${style.container} ${
        isCurrentUser
          ? "ring-4 ring-teal-200"
          : ""
      }`}
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/50" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black ${style.avatar}`}
          >
            {getInitials(
              getStudentName(
                student
              )
            )}
          </div>

          <Icon
            size={33}
            className={
              style.iconClass
            }
          />
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-wider text-slate-500">
          {style.label}
        </p>

        <h3 className="mt-2 text-2xl font-black text-slate-950">
          {getStudentName(
            student
          )}
        </h3>

        {isCurrentUser && (
          <span className="mt-3 inline-flex rounded-full bg-teal-600 px-3 py-1 text-xs font-black text-white">
            You
          </span>
        )}

        <div className="mt-6 grid grid-cols-3 gap-3">
          <MiniMetric
            label="XP"
            value={getXp(
              student
            )}
          />

          <MiniMetric
            label="Average"
            value={`${getAverageScore(
              student
            ).toFixed(
              0
            )}%`}
          />

          <MiniMetric
            label="Passed"
            value={getPassedCount(
              student
            )}
          />
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   MINI METRIC
========================================================= */

function MiniMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-white/70 p-3 text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   TABLE
========================================================= */

function TableHeading({
  children,
}) {
  return (
    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}

function LeaderboardRow({
  student,
  currentUserId,
}) {
  const isCurrentUser =
    getStudentId(
      student
    ) ===
    String(
      currentUserId
    );

  return (
    <tr
      className={
        isCurrentUser
          ? "bg-teal-50"
          : "transition hover:bg-slate-50"
      }
    >
      <td className="px-6 py-5">
        <RankBadge
          rank={getRank(
            student
          )}
        />
      </td>

      <td className="px-6 py-5">
        <StudentIdentity
          student={
            student
          }
          isCurrentUser={
            isCurrentUser
          }
        />
      </td>

      <td className="px-6 py-5 font-black text-teal-700">
        {getXp(
          student
        )}
      </td>

      <td className="px-6 py-5 font-black text-slate-900">
        {student.level ??
          1}
      </td>

      <td className="px-6 py-5">
        <span className="text-lg font-black text-teal-700">
          {getAverageScore(
            student
          ).toFixed(
            0
          )}
          %
        </span>
      </td>

      <td className="px-6 py-5 font-black text-slate-900">
        {getHighestScore(
          student
        ).toFixed(
          0
        )}
        %
      </td>

      <td className="px-6 py-5 font-black text-emerald-600">
        {getPassedCount(
          student
        )}
      </td>

      <td className="px-6 py-5 font-black text-slate-900">
        {getAttemptCount(
          student
        )}
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function MobileLeaderboardCard({
  student,
  currentUserId,
}) {
  const isCurrentUser =
    getStudentId(
      student
    ) ===
    String(
      currentUserId
    );

  return (
    <article
      className={`rounded-3xl border bg-white p-5 shadow-sm ${
        isCurrentUser
          ? "border-teal-300 ring-4 ring-teal-100"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <StudentIdentity
          student={
            student
          }
          isCurrentUser={
            isCurrentUser
          }
        />

        <RankBadge
          rank={getRank(
            student
          )}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MobileMetric
          label="XP"
          value={getXp(
            student
          )}
        />

        <MobileMetric
          label="Level"
          value={
            student.level ??
            1
          }
        />

        <MobileMetric
          label="Average"
          value={`${getAverageScore(
            student
          ).toFixed(
            0
          )}%`}
        />

        <MobileMetric
          label="Best score"
          value={`${getHighestScore(
            student
          ).toFixed(
            0
          )}%`}
        />

        <MobileMetric
          label="Passed"
          value={getPassedCount(
            student
          )}
        />

        <MobileMetric
          label="Attempts"
          value={getAttemptCount(
            student
          )}
        />
      </div>
    </article>
  );
}

function MobileMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   STUDENT IDENTITY
========================================================= */

function StudentIdentity({
  student,
  isCurrentUser,
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 font-black text-teal-700">
        {getInitials(
          getStudentName(
            student
          )
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-black text-slate-950">
            {getStudentName(
              student
            )}
          </p>

          {isCurrentUser && (
            <span className="rounded-full bg-teal-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
              You
            </span>
          )}
        </div>

        {student.email && (
          <p className="mt-1 truncate text-sm text-slate-500">
            {
              student.email
            }
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   RANK BADGE
========================================================= */

function RankBadge({
  rank,
}) {
  if (rank === 1) {
    return (
      <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-amber-100 px-3 font-black text-amber-700">
        <Crown
          size={19}
        />
      </span>
    );
  }

  if (rank === 2) {
    return (
      <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-slate-200 px-3 font-black text-slate-700">
        <Medal
          size={19}
        />
      </span>
    );
  }

  if (rank === 3) {
    return (
      <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-orange-100 px-3 font-black text-orange-700">
        <Medal
          size={19}
        />
      </span>
    );
  }

  return (
    <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-slate-100 px-3 font-black text-slate-700">
      #{rank}
    </span>
  );
}

export default LeaderboardPage;
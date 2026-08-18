import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Award,
  Bell,
  BookOpen,
  ChartNoAxesCombined,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  Medal,
  Search,
  Sparkles,
  Trophy,
  UserRound,
  X,
} from "lucide-react";

import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import useAuth from "../hooks/useAuth";
import api from "../api/axios";

/* =========================================================
   CONFIG
========================================================= */

const API_ORIGIN =
  "http://localhost:5000";

/* =========================================================
   STUDENT NAVIGATION
========================================================= */

const navigationItems = [
  {
    label: "Dashboard",
    path: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Quizzes",
    path: "/student/quizzes",
    icon: Search,
  },
  {
    label: "Attempt History",
    path: "/student/attempts",
    icon: Clock3,
  },
  {
    label: "Progress",
    path: "/student/progress",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Leaderboard",
    path: "/student/leaderboard",
    icon: Trophy,
  },
  {
    label: "Certificates",
    path: "/student/certificates",
    icon: Award,
  },
];

/* =========================================================
   STATIC PAGE TITLES
========================================================= */

const pageTitles = {
  "/student/dashboard": {
    eyebrow: "Student workspace",
    title: "Dashboard",
  },

  "/student/profile": {
    eyebrow: "Student account",
    title: "My Profile",
  },

  "/student/quizzes": {
    eyebrow: "Biotechnology quiz library",
    title: "My Quizzes",
  },

  "/student/attempts": {
    eyebrow: "Learning performance",
    title: "Attempt History",
  },

  "/student/progress": {
    eyebrow: "Learning analytics",
    title: "Progress",
  },

  "/student/leaderboard": {
    eyebrow: "BioNova rankings",
    title: "Leaderboard",
  },

  "/student/certificates": {
    eyebrow: "BioNova credentials",
    title: "My Certificates",
  },
};

/* =========================================================
   INITIALS
========================================================= */

function getInitials(
  name = "Student"
) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part
        .charAt(0)
        .toUpperCase()
    )
    .join("");
}

/* =========================================================
   DATE HELPERS
========================================================= */

function formatRelativeTime(
  dateValue
) {
  if (!dateValue) {
    return "";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const difference =
    Date.now() -
    date.getTime();

  const minutes =
    Math.floor(
      difference /
        (1000 * 60)
    );

  const hours =
    Math.floor(
      difference /
        (1000 * 60 * 60)
    );

  const days =
    Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} ${
      hours === 1
        ? "hour"
        : "hours"
    } ago`;
  }

  if (days < 7) {
    return `${days} ${
      days === 1
        ? "day"
        : "days"
    } ago`;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    }
  ).format(date);
}

/* =========================================================
   IMAGE URL
========================================================= */

function getProfilePictureUrl(
  value
) {
  if (!value) {
    return null;
  }

  if (
    value.startsWith("http")
  ) {
    return value;
  }

  return `${API_ORIGIN}${value}`;
}

/* =========================================================
   STUDENT LAYOUT
========================================================= */

function StudentLayout() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    user,
    logout,
  } = useAuth();

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [
    profileMenuOpen,
    setProfileMenuOpen,
  ] = useState(false);

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);

  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    dashboard,
    setDashboard,
  ] = useState(null);

  const [
    certificates,
    setCertificates,
  ] = useState([]);

  const [
    notificationLoading,
    setNotificationLoading,
  ] = useState(true);

  const [
    readNotificationIds,
    setReadNotificationIds,
  ] = useState([]);

  const notificationRef =
    useRef(null);

  const profileMenuRef =
    useRef(null);

  /* =======================================================
     CLOSE MENUS WHEN ROUTE CHANGES
  ======================================================= */

  useEffect(() => {
    setSidebarOpen(false);
    setProfileMenuOpen(false);
    setNotificationOpen(false);
  }, [location.pathname]);

  /* =======================================================
     CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  ======================================================= */

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          notificationRef.current &&
          !notificationRef.current.contains(
            event.target
          )
        ) {
          setNotificationOpen(
            false
          );
        }

        if (
          profileMenuRef.current &&
          !profileMenuRef.current.contains(
            event.target
          )
        ) {
          setProfileMenuOpen(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =======================================================
     LOAD USER-SPECIFIC DATA
  ======================================================= */

  useEffect(() => {
    const loadStudentData =
      async () => {
        try {
          setNotificationLoading(
            true
          );

          const results =
            await Promise.allSettled(
              [
                api.get(
                  "/student/profile"
                ),

                api.get(
                  "/student/dashboard"
                ),

                api.get(
                  "/certificates"
                ),
              ]
            );

          const [
            profileResult,
            dashboardResult,
            certificatesResult,
          ] = results;

          if (
            profileResult.status ===
            "fulfilled"
          ) {
            setProfile(
              profileResult.value
                .data?.profile ||
                null
            );
          }

          if (
            dashboardResult.status ===
            "fulfilled"
          ) {
            setDashboard(
              dashboardResult.value
                .data
                ?.dashboard ||
                null
            );
          }

          if (
            certificatesResult.status ===
            "fulfilled"
          ) {
            setCertificates(
              Array.isArray(
                certificatesResult
                  .value.data
                  ?.certificates
              )
                ? certificatesResult
                    .value.data
                    .certificates
                : []
            );
          }
        } catch (error) {
          console.error(
            "Student layout data error:",
            error
          );
        } finally {
          setNotificationLoading(
            false
          );
        }
      };

    loadStudentData();
  }, [
    location.pathname,
  ]);

  /* =======================================================
     LOAD READ NOTIFICATION STATE
  ======================================================= */

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    try {
      const saved =
        localStorage.getItem(
          `bionova_notifications_read_${user.id}`
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        if (
          Array.isArray(
            parsed
          )
        ) {
          setReadNotificationIds(
            parsed
          );
        }
      }
    } catch {
      setReadNotificationIds(
        []
      );
    }
  }, [user?.id]);

  /* =======================================================
     CURRENT PAGE
  ======================================================= */

  const currentPage =
    pageTitles[
      location.pathname
    ] ||
    getDynamicPageTitle(
      location.pathname
    );

  const isQuizListPage =
    location.pathname ===
    "/student/quizzes";

  /* =======================================================
     REAL USER NOTIFICATIONS
  ======================================================= */

  const notifications =
    useMemo(() => {
      const items = [];

      /* ---------------------------------------------------
         INCOMPLETE ONBOARDING
      --------------------------------------------------- */

      if (
        profile &&
        profile.personal_info_completed &&
        !profile.onboarding_completed
      ) {
        items.push({
          id:
            `onboarding-${profile.onboarding_step || 2}`,

          type:
            "ONBOARDING",

          title:
            "Complete your BioNova setup",

          message:
            "Finish your biotechnology interests and learning preferences to improve recommendations.",

          link:
            "/student/onboarding",

          createdAt:
            profile.profile_updated_at ||
            profile.account_created_at,

          icon:
            Sparkles,

          iconClass:
            "bg-violet-100 text-violet-700",
        });
      }

      /* ---------------------------------------------------
         ACTIVE QUIZ
      --------------------------------------------------- */

      const activeAttempt =
        dashboard
          ?.activeAttempt;

      if (activeAttempt) {
        items.push({
          id:
            `active-attempt-${activeAttempt.id}`,

          type:
            "ACTIVE_ATTEMPT",

          title:
            "Quiz in progress",

          message:
            `Continue ${activeAttempt.quiz_title || "your biotechnology quiz"}.`,

          link:
            `/student/attempt/${activeAttempt.id}`,

          createdAt:
            activeAttempt.started_at,

          icon:
            Clock3,

          iconClass:
            "bg-cyan-100 text-cyan-700",
        });
      }

      /* ---------------------------------------------------
         CERTIFICATES
      --------------------------------------------------- */

      certificates
        .slice(0, 3)
        .forEach(
          (certificate) => {
            items.push({
              id:
                `certificate-${certificate.id}`,

              type:
                "CERTIFICATE",

              title:
                "Certificate earned",

              message:
                `You earned a BioNova certificate for ${certificate.quiz_title}.`,

              link:
                "/student/certificates",

              createdAt:
                certificate.issued_at,

              icon:
                Award,

              iconClass:
                "bg-violet-100 text-violet-700",
            });
          }
        );

      /* ---------------------------------------------------
         RECENT QUIZ RESULTS
      --------------------------------------------------- */

      const recentAttempts =
        Array.isArray(
          dashboard
            ?.recentAttempts
        )
          ? dashboard
              .recentAttempts
          : [];

      recentAttempts
        .slice(0, 4)
        .forEach(
          (attempt) => {
            const percentage =
              Number(
                attempt.percentage ||
                  0
              );

            const passed =
              attempt.status ===
              "PASSED";

            items.push({
              id:
                `attempt-${attempt.id}`,

              type:
                passed
                  ? "QUIZ_PASSED"
                  : "QUIZ_COMPLETED",

              title:
                passed
                  ? "Assessment passed"
                  : "Assessment completed",

              message:
                `${attempt.quiz_title}: ${percentage.toFixed(
                  0
                )}% score.`,

              link:
                `/student/results/${attempt.id}`,

              createdAt:
                attempt.completed_at ||
                attempt.started_at,

              icon:
                passed
                  ? CheckCircle2
                  : BookOpen,

              iconClass:
                passed
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700",
            });
          }
        );

      /* ---------------------------------------------------
         LEARNING STREAK
      --------------------------------------------------- */

      const currentStreak =
        Number(
          profile
            ?.current_streak ||
            0
        );

      if (
        currentStreak > 0
      ) {
        items.push({
          id:
            `streak-${currentStreak}-${profile?.last_quiz_date || "current"}`,

          type:
            "STREAK",

          title:
            `${currentStreak}-day learning streak`,

          message:
            "Keep learning biotechnology to continue your streak.",

          link:
            "/student/quizzes",

          createdAt:
            profile?.last_quiz_date,

          icon:
            Flame,

          iconClass:
            "bg-orange-100 text-orange-600",
        });
      }

      /* ---------------------------------------------------
         LEVEL
      --------------------------------------------------- */

      const level =
        Number(
          profile?.level ||
            1
        );

      if (level > 1) {
        items.push({
          id:
            `level-${level}`,

          type:
            "LEVEL",

          title:
            `You reached Level ${level}`,

          message:
            `${profile?.xp || 0} XP earned on BioNova.`,

          link:
            "/student/progress",

          createdAt:
            profile
              ?.profile_updated_at,

          icon:
            Trophy,

          iconClass:
            "bg-yellow-100 text-yellow-700",
        });
      }

      /* ---------------------------------------------------
         SORT
      --------------------------------------------------- */

      return items
        .filter(Boolean)
        .sort(
          (
            first,
            second
          ) => {
            const firstTime =
              first.createdAt
                ? new Date(
                    first.createdAt
                  ).getTime()
                : 0;

            const secondTime =
              second.createdAt
                ? new Date(
                    second.createdAt
                  ).getTime()
                : 0;

            return (
              secondTime -
              firstTime
            );
          }
        )
        .slice(0, 10);
    }, [
      profile,
      dashboard,
      certificates,
    ]);

  /* =======================================================
     UNREAD COUNT
  ======================================================= */

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            !readNotificationIds.includes(
              notification.id
            )
        ).length,
      [
        notifications,
        readNotificationIds,
      ]
    );

  /* =======================================================
     SAVE READ STATE
  ======================================================= */

  const saveReadIds = (
    ids
  ) => {
    setReadNotificationIds(
      ids
    );

    if (user?.id) {
      localStorage.setItem(
        `bionova_notifications_read_${user.id}`,
        JSON.stringify(
          ids
        )
      );
    }
  };

  /* =======================================================
     OPEN NOTIFICATION
  ======================================================= */

  const handleNotificationClick =
    (notification) => {
      const nextIds =
        readNotificationIds.includes(
          notification.id
        )
          ? readNotificationIds
          : [
              ...readNotificationIds,
              notification.id,
            ];

      saveReadIds(
        nextIds
      );

      setNotificationOpen(
        false
      );

      navigate(
        notification.link
      );
    };

  /* =======================================================
     MARK ALL READ
  ======================================================= */

  const handleMarkAllRead =
    () => {
      const ids =
        notifications.map(
          (notification) =>
            notification.id
        );

      saveReadIds(
        Array.from(
          new Set([
            ...readNotificationIds,
            ...ids,
          ])
        )
      );
    };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout =
    async () => {
      try {
        await logout();

        toast.success(
          "Logged out successfully"
        );

        navigate(
          "/login",
          {
            replace: true,
          }
        );
      } catch {
        toast.error(
          "Unable to log out"
        );
      }
    };

  /* =======================================================
     DISPLAY USER
  ======================================================= */

  const displayName =
    profile?.name ||
    user?.name ||
    "Student";

  const displayEmail =
    profile?.email ||
    user?.email ||
    "";

  const profilePicture =
    getProfilePictureUrl(
      profile
        ?.profile_picture_url ||
        user
          ?.profile_picture_url
    );

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f7faf9]">
      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setSidebarOpen(
              false
            )
          }
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* BRAND */}

        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link
            to="/student/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-lg font-black shadow-lg shadow-teal-950/40">
              B
            </div>

            <div>
              <p className="text-lg font-black">
                BioNova
              </p>

              <p className="text-xs text-slate-400">
                Biotechnology Learning
              </p>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-7">
          <p className="mb-4 px-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Learning
          </p>

          {navigationItems.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <NavLink
                  key={
                    item.path
                  }
                  to={
                    item.path
                  }
                  className={({
                    isActive,
                  }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3.5 font-semibold transition ${
                      isActive
                        ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-950/30"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    }`
                  }
                >
                  <Icon
                    size={20}
                  />

                  {item.label}
                </NavLink>
              );
            }
          )}
        </nav>

        {/* PROFILE FOOTER */}

        <div className="border-t border-white/10 p-4">
          <Link
            to="/student/profile"
            className="block rounded-2xl border border-white/10 bg-slate-900 p-4 transition hover:border-teal-500/30 hover:bg-slate-900/80"
          >
            <div className="flex items-center gap-3">
              <Avatar
                name={
                  displayName
                }
                image={
                  profilePicture
                }
                sizeClass="h-11 w-11"
                textClass="text-sm"
              />

              <div className="min-w-0">
                <p className="truncate font-bold text-white">
                  {displayName}
                </p>

                <p className="mt-1 truncate text-xs text-slate-400">
                  {displayEmail}
                </p>
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-slate-300 transition hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut
              size={19}
            />

            Logout
          </button>
        </div>
      </aside>

      {/* ===================================================
          MAIN AREA
      =================================================== */}

      <div className="min-h-screen lg:pl-72">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() =>
                setSidebarOpen(
                  true
                )
              }
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 lg:hidden"
            >
              <Menu
                size={21}
              />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm text-slate-500">
                {
                  currentPage.eyebrow
                }
              </p>

              <h1 className="truncate text-lg font-black text-slate-950 sm:text-xl">
                {
                  currentPage.title
                }
              </h1>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-2 sm:gap-3">
            {/* HEADER ACTION */}

            {isQuizListPage ? (
              <Link
                to="/student/dashboard"
                className="hidden items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-bold text-white transition hover:bg-teal-700 md:inline-flex"
              >
                Go to dashboard

                <LayoutDashboard
                  size={18}
                />
              </Link>
            ) : (
              <Link
                to="/student/quizzes"
                className="hidden items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-bold text-white transition hover:bg-teal-700 md:inline-flex"
              >
                Browse quizzes

                <Search
                  size={18}
                />
              </Link>
            )}

            {/* =================================================
                NOTIFICATION BELL
            ================================================= */}

            <div
              ref={
                notificationRef
              }
              className="relative"
            >
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setNotificationOpen(
                    (current) =>
                      !current
                  );

                  setProfileMenuOpen(
                    false
                  );
                }}
                className={`relative rounded-xl border p-3 transition ${
                  notificationOpen
                    ? "border-teal-300 bg-teal-50 text-teal-700"
                    : "border-slate-200 text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                }`}
              >
                <Bell
                  size={20}
                />

                {unreadCount >
                  0 && (
                  <>
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />

                    {unreadCount >
                      1 && (
                      <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
                        {unreadCount >
                        9
                          ? "9+"
                          : unreadCount}
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* ===============================================
                  NOTIFICATION DROPDOWN
              =============================================== */}

              {notificationOpen && (
                <div className="absolute right-0 mt-3 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  {/* HEADER */}

                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                      <h3 className="font-black text-slate-950">
                        Notifications
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {unreadCount >
                        0
                          ? `${unreadCount} unread`
                          : "You're all caught up"}
                      </p>
                    </div>

                    {unreadCount >
                      0 && (
                      <button
                        type="button"
                        onClick={
                          handleMarkAllRead
                        }
                        className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800"
                      >
                        <Check
                          size={14}
                        />

                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* CONTENT */}

                  <div className="max-h-[430px] overflow-y-auto">
                    {notificationLoading ? (
                      <div className="p-8 text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600" />

                        <p className="mt-3 text-sm text-slate-500">
                          Loading notifications...
                        </p>
                      </div>
                    ) : notifications.length ===
                      0 ? (
                      <div className="px-6 py-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <Bell
                            size={22}
                          />
                        </div>

                        <h4 className="mt-4 font-black text-slate-900">
                          No notifications
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Your quiz results,
                          certificates and
                          learning updates will
                          appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.map(
                        (
                          notification
                        ) => {
                          const Icon =
                            notification.icon;

                          const unread =
                            !readNotificationIds.includes(
                              notification.id
                            );

                          return (
                            <button
                              key={
                                notification.id
                              }
                              type="button"
                              onClick={() =>
                                handleNotificationClick(
                                  notification
                                )
                              }
                              className={`flex w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition last:border-b-0 hover:bg-slate-50 ${
                                unread
                                  ? "bg-teal-50/40"
                                  : "bg-white"
                              }`}
                            >
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notification.iconClass}`}
                              >
                                <Icon
                                  size={19}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-2">
                                  <p className="flex-1 font-bold text-slate-950">
                                    {
                                      notification.title
                                    }
                                  </p>

                                  {unread && (
                                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-600" />
                                  )}
                                </div>

                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                  {
                                    notification.message
                                  }
                                </p>

                                {notification.createdAt && (
                                  <p className="mt-2 text-xs font-semibold text-slate-400">
                                    {formatRelativeTime(
                                      notification.createdAt
                                    )}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        }
                      )
                    )}
                  </div>

                  {/* FOOTER */}

                  <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
                    <Link
                      to="/student/dashboard"
                      onClick={() =>
                        setNotificationOpen(
                          false
                        )
                      }
                      className="block text-center text-sm font-bold text-teal-700 hover:text-teal-800"
                    >
                      Go to dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                PROFILE MENU
            ================================================= */}

            <div
              ref={
                profileMenuRef
              }
              className="relative"
            >
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(
                    (current) =>
                      !current
                  );

                  setNotificationOpen(
                    false
                  );
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 transition hover:border-teal-200 hover:bg-teal-50/50"
              >
                <Avatar
                  name={
                    displayName
                  }
                  image={
                    profilePicture
                  }
                  sizeClass="h-9 w-9"
                  textClass="text-sm"
                />

                <div className="hidden text-left xl:block">
                  <p className="max-w-36 truncate text-sm font-bold text-slate-950">
                    {
                      displayName
                    }
                  </p>

                  <p className="text-xs text-slate-500">
                    Student
                  </p>
                </div>

                <ChevronDown
                  size={17}
                  className={`hidden text-slate-400 transition sm:block ${
                    profileMenuOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {/* PROFILE DROPDOWN */}

              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={
                          displayName
                        }
                        image={
                          profilePicture
                        }
                        sizeClass="h-11 w-11"
                        textClass="text-sm"
                      />

                      <div className="min-w-0">
                        <p className="truncate font-black text-slate-950">
                          {
                            displayName
                          }
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          {
                            displayEmail
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      to="/student/profile"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
                    >
                      <UserRound
                        size={18}
                      />

                      My Profile
                    </Link>

                    <Link
                      to="/student/certificates"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      <Award
                        size={18}
                      />

                      My Certificates
                    </Link>

                    {profile &&
                      !profile.onboarding_completed && (
                        <Link
                          to="/student/onboarding"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold text-violet-700 transition hover:bg-violet-50"
                        >
                          <Sparkles
                            size={18}
                          />

                          Continue onboarding
                        </Link>
                      )}

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <LogOut
                        size={18}
                      />

                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* =================================================
            CHILD PAGE
        ================================================= */}

        <div className="min-h-[calc(100vh-5rem)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({
  name,
  image,
  sizeClass,
  textClass,
}) {
  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 font-black uppercase text-white ${sizeClass} ${textClass}`}
    >
      {image &&
      !imageFailed ? (
        <img
          src={image}
          alt={
            name
              ? `${name} profile`
              : "Profile"
          }
          className="h-full w-full object-cover"
          onError={() =>
            setImageFailed(
              true
            )
          }
        />
      ) : (
        getInitials(
          name
        )
      )}
    </div>
  );
}

/* =========================================================
   DYNAMIC PAGE TITLES
========================================================= */

function getDynamicPageTitle(
  pathname
) {
  /* QUIZ DETAILS */

  if (
    pathname.startsWith(
      "/student/quizzes/"
    )
  ) {
    return {
      eyebrow:
        "Biotechnology assessment",

      title:
        "Quiz Details",
    };
  }

  /* QUIZ ATTEMPT */

  if (
    pathname.startsWith(
      "/student/attempt/"
    )
  ) {
    return {
      eyebrow:
        "Assessment",

      title:
        "Quiz Attempt",
    };
  }

  /* QUIZ RESULT */

  if (
    pathname.startsWith(
      "/student/results/"
    )
  ) {
    return {
      eyebrow:
        "Performance",

      title:
        "Quiz Result",
    };
  }

  /* CERTIFICATE DETAILS */

  if (
    pathname.startsWith(
      "/student/certificates/"
    )
  ) {
    return {
      eyebrow:
        "BioNova credential",

      title:
        "Certificate",
    };
  }

  return {
    eyebrow:
      "Biotechnology learning",

    title:
      "BioNova",
  };
}

export default StudentLayout;
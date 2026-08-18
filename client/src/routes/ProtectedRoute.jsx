import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import useAuth from "../hooks/useAuth";
import api from "../api/axios";

function ProtectedRoute({
  allowedRoles,
}) {
  const location =
    useLocation();

  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();

  const [
    profileChecking,
    setProfileChecking,
  ] = useState(false);

  const [
    personalInfoCompleted,
    setPersonalInfoCompleted,
  ] = useState(null);

  /*
    This remembers which route the
    student profile was checked for.

    It prevents an old value such as
    personalInfoCompleted = false
    from immediately redirecting the
    student after Step 1 has actually
    been completed.
  */
  const [
    checkedPath,
    setCheckedPath,
  ] = useState(null);

  /* =========================================================
     CHECK STUDENT PROFILE
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const checkStudentProfile =
      async () => {
        /*
          Wait until AuthContext finishes
          checking the current session.
        */
        if (loading) {
          return;
        }

        /*
          Not authenticated.

          The normal login redirect below
          will handle this.
        */
        if (
          !isAuthenticated ||
          !user
        ) {
          if (!cancelled) {
            setPersonalInfoCompleted(
              null
            );

            setCheckedPath(
              location.pathname
            );

            setProfileChecking(
              false
            );
          }

          return;
        }

        /*
          Admin users do not need
          student onboarding checks.
        */
        if (
          user.role !==
          "STUDENT"
        ) {
          if (!cancelled) {
            setPersonalInfoCompleted(
              true
            );

            setCheckedPath(
              location.pathname
            );

            setProfileChecking(
              false
            );
          }

          return;
        }

        try {
          if (!cancelled) {
            setProfileChecking(
              true
            );
          }

          const response =
            await api.get(
              "/student/profile"
            );

          const profile =
            response.data
              ?.profile;

          if (!cancelled) {
            setPersonalInfoCompleted(
              Boolean(
                profile
                  ?.personal_info_completed
              )
            );

            setCheckedPath(
              location.pathname
            );
          }
        } catch (error) {
          console.error(
            "ProtectedRoute profile check error:",
            error
          );

          /*
            Fail safely.

            If we cannot verify the student's
            required profile information,
            don't accidentally allow access.
          */
          if (!cancelled) {
            setPersonalInfoCompleted(
              false
            );

            setCheckedPath(
              location.pathname
            );
          }
        } finally {
          if (!cancelled) {
            setProfileChecking(
              false
            );
          }
        }
      };

    checkStudentProfile();

    return () => {
      cancelled = true;
    };
  }, [
    loading,
    isAuthenticated,
    user?.id,
    user?.role,
    location.pathname,
  ]);

  /* =========================================================
     AUTH LOADING
  ========================================================= */

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  /* =========================================================
     NOT LOGGED IN
  ========================================================= */

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }

  /* =========================================================
     WRONG ROLE
  ========================================================= */

  if (
    allowedRoles &&
    !allowedRoles.includes(
      user?.role
    )
  ) {
    const destination =
      user?.role ===
      "ADMIN"
        ? "/admin/dashboard"
        : "/student/dashboard";

    return (
      <Navigate
        to={destination}
        replace
      />
    );
  }

  /* =========================================================
     STUDENT PROFILE CHECK
  ========================================================= */

  const isStudent =
    user?.role ===
    "STUDENT";

  /*
    The important fix:

    If the route changed, do NOT use
    the profile result from the previous
    route.

    Wait until /student/profile has been
    checked again.
  */
  if (
    isStudent &&
    (
      profileChecking ||
      checkedPath !==
        location.pathname
    )
  ) {
    return (
      <LoadingScreen />
    );
  }

  /* =========================================================
     ONBOARDING RULE
  ========================================================= */

  const isOnboardingPage =
    location.pathname ===
    "/student/onboarding";

  /*
    ONLY the compulsory About You step
    blocks access.

    onboarding_completed is deliberately
    NOT checked here.

    Therefore:

    personal_info_completed = false
      -> onboarding required

    personal_info_completed = true
    onboarding_completed = false
      -> dashboard allowed

    personal_info_completed = true
    onboarding_completed = true
      -> dashboard allowed
  */

  if (
    isStudent &&
    personalInfoCompleted ===
      false &&
    !isOnboardingPage
  ) {
    return (
      <Navigate
        to="/student/onboarding"
        replace
      />
    );
  }

  /* =========================================================
     ACCESS GRANTED
  ========================================================= */

  return <Outlet />;
}

/* =========================================================
   LOADING COMPONENT
========================================================= */

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600" />

        <p className="mt-4 font-semibold text-slate-600">
          Loading your account...
        </p>
      </div>
    </main>
  );
}

export default ProtectedRoute;
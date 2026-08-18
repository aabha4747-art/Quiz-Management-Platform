import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FlaskConical,
  GraduationCap,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";

import useAuth from "../../hooks/useAuth";

function RegisterPage() {
  const navigate =
    useNavigate();

  const { login } =
    useAuth();

  const [
    formData,
    setFormData,
  ] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };

  /* =======================================================
     REGISTER
  ======================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const name =
      formData.name.trim();

    const email =
      formData.email
        .trim()
        .toLowerCase();

    const password =
      formData.password;

    /* -----------------------------------------------------
       FRONTEND VALIDATION
    ----------------------------------------------------- */

    if (name.length < 2) {
      toast.error(
        "Please enter your full name."
      );

      return;
    }

    if (!email) {
      toast.error(
        "Please enter your email address."
      );

      return;
    }

    if (
      !email.includes("@")
    ) {
      toast.error(
        "Please enter a valid email address."
      );

      return;
    }

    if (
      password.length < 8
    ) {
      toast.error(
        "Password must contain at least 8 characters."
      );

      return;
    }

    try {
      setLoading(true);

      /* ===================================================
         STEP 1 — CREATE ACCOUNT
      =================================================== */

      const registerResponse =
        await api.post(
          "/auth/register",
          {
            name,
            email,
            password,
          }
        );

      /* ===================================================
         STEP 2 — AUTOMATIC LOGIN

         We log the student in immediately after
         successful registration so onboarding can
         call protected endpoints.
      =================================================== */

      const loginResponse =
        await api.post(
          "/auth/login",
          {
            email,
            password,
          }
        );

      /*
        AuthContext.login() saves:
        token
        user

        into localStorage.
      */

      login(
        loginResponse.data
      );

      toast.success(
        registerResponse.data
          ?.message ||
          "Account created successfully!"
      );

      /* ===================================================
         STEP 3 — OPEN ONBOARDING
      =================================================== */

      navigate(
        "/student/onboarding",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      /* ---------------------------------------------------
         EXPRESS-VALIDATOR ERRORS
      --------------------------------------------------- */

      const validationError =
        error.response?.data
          ?.errors?.[0]?.msg;

      const message =
        validationError ||
        error.response?.data
          ?.message ||
        "Unable to create account.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/40 to-cyan-50">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        {/* =================================================
            LEFT BRAND PANEL
        ================================================= */}

        <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-cyan-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          {/* DECORATION */}

          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-400/10" />

          <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-teal-400/10" />

          {/* BRAND */}

          <div className="relative">
            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 font-black shadow-lg">
                B
              </div>

              <div>
                <p className="text-xl font-black">
                  BioNova
                </p>

                <p className="text-xs text-cyan-100/70">
                  Biotechnology
                  Learning
                </p>
              </div>
            </Link>
          </div>

          {/* CONTENT */}

          <div className="relative max-w-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <FlaskConical
                size={28}
              />
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight">
              Build your
              personalized learning
              journey.
            </h1>

            <p className="mt-5 leading-7 text-cyan-100/80">
              Tell BioNova what you
              want to learn and we'll
              personalize quizzes,
              progress tracking and
              recommendations around
              your goals.
            </p>

            <div className="mt-8 space-y-4">
              <Benefit
                text="Personalized biotechnology learning"
              />

              <Benefit
                text="Certificates and achievements"
              />

              <Benefit
                text="XP, streaks and progress tracking"
              />

              <Benefit
                text="Recommendations based on your interests"
              />
            </div>
          </div>

          <p className="relative text-xs text-slate-400">
            BioNova Learning
            Platform
          </p>
        </section>

        {/* =================================================
            REGISTER FORM
        ================================================= */}

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-xl">
            {/* MOBILE BRAND */}

            <Link
              to="/"
              className="mb-8 flex items-center gap-3 lg:hidden"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 font-black text-white">
                B
              </div>

              <div>
                <p className="font-black text-slate-950">
                  BioNova
                </p>

                <p className="text-xs text-slate-500">
                  Biotechnology
                  Learning
                </p>
              </div>
            </Link>

            {/* STEP */}

            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-teal-700">
              <GraduationCap
                size={15}
              />

              Step 1 · Create
              Account
            </div>

            <h1 className="mt-4 text-3xl font-black text-slate-950">
              Start learning with
              BioNova
            </h1>

            <p className="mt-2 text-slate-500">
              Create your account.
              We'll personalize your
              learning experience in
              the next few steps.
            </p>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-8 space-y-5"
            >
              {/* NAME */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={
                      loading
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={
                      loading
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Create a secure password"
                    autoComplete="new-password"
                    disabled={
                      loading
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-12 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Minimum 8
                  characters.
                </p>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3.5 font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating your account..."
                  : "Create account"}

                {!loading && (
                  <ArrowRight
                    size={18}
                  />
                )}
              </button>
            </form>

            {/* GOOGLE PLACEHOLDER */}

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                or
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              disabled
              title="Google sign-in will be added later"
              className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3.5 font-bold text-slate-400"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 font-black">
                G
              </span>

              Continue with Google
            </button>

            <p className="mt-7 text-center text-sm text-slate-500">
              Already registered?{" "}
              <Link
                to="/login"
                className="font-black text-teal-700 hover:text-teal-800"
              >
                Login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   BENEFIT
========================================================= */

function Benefit({
  text,
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
        <CheckCircle2
          size={16}
        />
      </div>

      <span className="text-sm font-medium text-cyan-50">
        {text}
      </span>
    </div>
  );
}

export default RegisterPage;
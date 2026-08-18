import {
  useEffect,
  useState,
} from "react";

import {
  Dna,
  Eye,
  EyeOff,
  FlaskConical,
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";

function LoginPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    login,
  } = useAuth();

  const [
    formData,
    setFormData,
  ] = useState({
    email: "",
    password: "",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =========================================================
     PREFILL EMAIL ONLY AFTER REGISTRATION
  ========================================================= */

  useEffect(() => {
    const registeredEmail =
      location.state
        ?.registeredEmail;

    if (!registeredEmail) {
      return;
    }

    setFormData(
      (current) => ({
        ...current,
        email:
          registeredEmail,
      })
    );

    /*
      Remove the navigation state immediately.

      This prevents the old registered
      email from appearing again when
      the user later returns to /login.
    */
    window.history.replaceState(
      {},
      document.title,
      location.pathname
    );
  }, [
    location.pathname,
    location.state,
  ]);

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

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !formData.email.trim() ||
        !formData.password
      ) {
        toast.error(
          "Enter your email and password."
        );

        return;
      }

      try {
        setLoading(
          true
        );

        const loggedInUser =
          await login(
            formData.email,
            formData.password
          );

        toast.success(
          "Login successful"
        );

        if (
          loggedInUser
            ?.role ===
          "ADMIN"
        ) {
          navigate(
            "/admin/dashboard",
            {
              replace: true,
            }
          );

          return;
        }

        navigate(
          "/student/dashboard",
          {
            replace: true,
          }
        );
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Unable to log in."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  return (
    <main className="min-h-screen bg-[#f7faf9] lg:grid lg:grid-cols-2">
      {/* LEFT BRAND PANEL */}

      <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-teal-800 via-cyan-700 to-blue-700 px-12 py-10 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-white/10" />

        <div className="pointer-events-none absolute bottom-10 left-1/4 h-72 w-72 rounded-full bg-cyan-300/10" />

        <div className="pointer-events-none absolute right-10 top-[32%] opacity-[0.08]">
          <Dna
            size={280}
          />
        </div>

        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-4"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-black text-teal-700 shadow-lg">
              B
            </div>

            <div>
              <p className="text-2xl font-black leading-none">
                BioNova
              </p>

              <p className="mt-2 text-sm text-cyan-100">
                Biotechnology Learning Platform
              </p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 mt-14 max-w-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <FlaskConical
                size={18}
                className="text-cyan-100"
              />
            </div>

            <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-100">
              Learn biotechnology smarter
            </p>
          </div>

          <h1 className="mt-7 text-5xl font-black leading-[1.16]">
            Build stronger
            <br />
            biotech knowledge
            <br />
            through focused
            <br />
            assessments.
          </h1>

          <p className="mt-8 max-w-lg text-lg leading-8 text-cyan-50">
            Explore biotechnology quizzes, review your answers, measure your progress and strengthen concepts across molecular biology, genetics, microbiology and more.
          </p>
        </div>

        <p className="relative z-10 mt-auto pt-8 text-sm text-cyan-100/80">
          BioNova · Learn. Assess. Improve.
        </p>
      </section>

      {/* RIGHT LOGIN PANEL */}

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-xl">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 font-black text-white">
              B
            </div>

            <div>
              <p className="text-xl font-black text-slate-950">
                BioNova
              </p>

              <p className="text-sm text-slate-500">
                Biotechnology Learning
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-700">
              Welcome back
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight text-slate-950">
              Login to your account
            </h2>

            <p className="mt-3 text-slate-500">
              Enter your credentials to continue to BioNova.
            </p>

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-8 space-y-6"
            >
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-black text-slate-800"
                >
                  Email address
                </label>

                <div className="relative mt-2">
                  <Mail
                    size={19}
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
                    placeholder="student@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-300 py-3.5 pl-12 pr-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="text-sm font-black text-slate-800"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-black text-teal-700 hover:text-teal-800"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative mt-2">
                  <LockKeyhole
                    size={19}
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
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-300 py-3.5 pl-12 pr-12 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-teal-700"
                  >
                    {showPassword ? (
                      <EyeOff
                        size={19}
                      />
                    ) : (
                      <Eye
                        size={19}
                      />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  loading
                }
                className="inline-flex w-full items-center justify-center rounded-xl bg-teal-600 px-5 py-3.5 font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                New to BioNova?
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="text-center text-sm leading-6 text-slate-600">
              Create an account and start exploring biotechnology quizzes.{" "}
              <Link
                to="/register"
                className="font-black text-teal-700 hover:text-teal-800"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
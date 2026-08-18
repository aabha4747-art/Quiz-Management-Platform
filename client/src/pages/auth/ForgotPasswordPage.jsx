import {
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  FlaskConical,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import api from "../../api/axios";

function ForgotPasswordPage() {
  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    developmentToken,
    setDevelopmentToken,
  ] = useState("");

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      if (!normalizedEmail) {
        toast.error(
          "Please enter your email address."
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await api.post(
            "/auth/forgot-password",
            {
              email:
                normalizedEmail,
            }
          );

        setSubmitted(true);

        /*
          Your backend returns resetToken
          only in development mode.

          In production this should come
          through email instead.
        */
        const resetToken =
          response.data
            ?.resetToken;

        if (resetToken) {
          setDevelopmentToken(
            resetToken
          );
        }

        toast.success(
          "Password reset request processed."
        );
      } catch (error) {
        console.error(
          "Forgot password error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to process password reset request."
        );
      } finally {
        setLoading(false);
      }
    };

  const continueToReset =
    () => {
      if (
        !developmentToken
      ) {
        return;
      }

      navigate(
        `/reset-password?token=${encodeURIComponent(
          developmentToken
        )}`
      );
    };

  return (
    <main className="min-h-screen bg-[#f7faf9] lg:grid lg:grid-cols-2">
      {/* ===================================================
          LEFT BRAND PANEL
      =================================================== */}

      <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-teal-800 via-cyan-700 to-blue-700 px-12 py-10 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-white/10" />

        <div className="pointer-events-none absolute bottom-10 left-1/4 h-72 w-72 rounded-full bg-cyan-300/10" />

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

        <div className="relative z-10 mt-16 max-w-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <ShieldCheck
              size={25}
              className="text-cyan-100"
            />
          </div>

          <p className="mt-8 text-sm font-black uppercase tracking-[0.18em] text-cyan-100">
            Secure account recovery
          </p>

          <h1 className="mt-5 text-5xl font-black leading-[1.15]">
            Forgot your
            <br />
            password?
            <br />
            We can help.
          </h1>

          <p className="mt-8 max-w-lg text-lg leading-8 text-cyan-50">
            Reset your BioNova password securely and return to your biotechnology learning journey.
          </p>
        </div>

        <p className="relative z-10 mt-auto pt-8 text-sm text-cyan-100/80">
          BioNova · Learn. Assess. Improve.
        </p>
      </section>

      {/* ===================================================
          RIGHT PANEL
      =================================================== */}

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-xl">
          {/* MOBILE BRAND */}

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
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-teal-700"
            >
              <ArrowLeft
                size={17}
              />

              Back to login
            </Link>

            {!submitted ? (
              <>
                <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-teal-700">
                  Password recovery
                </p>

                <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950">
                  Reset your password
                </h1>

                <p className="mt-3 leading-7 text-slate-500">
                  Enter the email address associated with your BioNova account.
                </p>

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="mt-8"
                >
                  <label
                    htmlFor="forgot-email"
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
                      id="forgot-email"
                      type="email"
                      value={
                        email
                      }
                      onChange={(
                        event
                      ) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="student@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-300 py-3.5 pl-12 pr-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      loading
                    }
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-teal-600 px-5 py-3.5 font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Processing..."
                      : "Continue"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2
                    size={27}
                  />
                </div>

                <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
                  Request received
                </p>

                <h1 className="mt-3 text-3xl font-black text-slate-950">
                  Check your reset instructions
                </h1>

                <p className="mt-3 leading-7 text-slate-500">
                  If an active BioNova account exists for{" "}
                  <strong className="text-slate-800">
                    {email}
                  </strong>
                  , password reset instructions have been generated.
                </p>

                {/* DEVELOPMENT ONLY */}

                {developmentToken && (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <p className="text-sm font-black text-amber-900">
                      Development mode
                    </p>

                    <p className="mt-2 text-sm leading-6 text-amber-800">
                      Email delivery is not connected yet, so BioNova can use the generated development reset token directly.
                    </p>

                    <button
                      type="button"
                      onClick={
                        continueToReset
                      }
                      className="mt-4 w-full rounded-xl bg-amber-600 px-5 py-3 font-black text-white transition hover:bg-amber-700"
                    >
                      Continue to Reset Password
                    </button>
                  </div>
                )}

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(
                        false
                      );

                      setDevelopmentToken(
                        ""
                      );
                    }}
                    className="flex-1 rounded-xl border border-slate-300 px-5 py-3 font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    Try another email
                  </button>

                  <Link
                    to="/login"
                    className="flex flex-1 items-center justify-center rounded-xl bg-teal-600 px-5 py-3 font-black text-white transition hover:bg-teal-700"
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
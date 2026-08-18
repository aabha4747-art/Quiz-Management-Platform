import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import api from "../../api/axios";

function ResetPasswordPage() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const token =
    searchParams.get(
      "token"
    ) || "";

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState(false);

  /* =======================================================
     PASSWORD RULES
  ======================================================= */

  const passwordRules =
    useMemo(
      () => ({
        length:
          newPassword.length >=
          8,

        uppercase:
          /[A-Z]/.test(
            newPassword
          ),

        lowercase:
          /[a-z]/.test(
            newPassword
          ),

        number:
          /[0-9]/.test(
            newPassword
          ),
      }),
      [
        newPassword,
      ]
    );

  const passwordValid =
    Object.values(
      passwordRules
    ).every(Boolean);

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!token) {
        toast.error(
          "Password reset link is invalid."
        );

        return;
      }

      if (!passwordValid) {
        toast.error(
          "Please meet all password requirements."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        toast.error(
          "Passwords do not match."
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await api.post(
            "/auth/reset-password",
            {
              token,
              newPassword,
            }
          );

        setSuccess(true);

        toast.success(
          response.data
            ?.message ||
            "Password reset successful."
        );
      } catch (error) {
        console.error(
          "Reset password error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to reset password."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =======================================================
     NO TOKEN
  ======================================================= */

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7faf9] px-5">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <X
              size={27}
            />
          </div>

          <h1 className="mt-5 text-3xl font-black text-slate-950">
            Invalid reset link
          </h1>

          <p className="mt-3 leading-7 text-slate-500">
            This password reset link does not contain a valid token.
          </p>

          <Link
            to="/forgot-password"
            className="mt-7 inline-flex rounded-xl bg-teal-600 px-5 py-3 font-black text-white transition hover:bg-teal-700"
          >
            Request a new reset link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7faf9] lg:grid lg:grid-cols-2">
      {/* ===================================================
          LEFT
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
              <p className="text-2xl font-black">
                BioNova
              </p>

              <p className="mt-1 text-sm text-cyan-100">
                Biotechnology Learning Platform
              </p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 mt-16 max-w-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <ShieldCheck
              size={25}
            />
          </div>

          <p className="mt-8 text-sm font-black uppercase tracking-[0.18em] text-cyan-100">
            Secure password reset
          </p>

          <h1 className="mt-5 text-5xl font-black leading-[1.15]">
            Create a new
            <br />
            secure password.
          </h1>

          <p className="mt-8 text-lg leading-8 text-cyan-50">
            Choose a strong password to protect your BioNova learning account.
          </p>
        </div>

        <p className="relative z-10 mt-auto text-sm text-cyan-100/80">
          BioNova · Learn. Assess. Improve.
        </p>
      </section>

      {/* ===================================================
          RIGHT
      =================================================== */}

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
            {!success ? (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-700"
                >
                  <ArrowLeft
                    size={17}
                  />

                  Back to login
                </Link>

                <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-teal-700">
                  New password
                </p>

                <h1 className="mt-3 text-4xl font-black text-slate-950">
                  Reset your password
                </h1>

                <p className="mt-3 leading-7 text-slate-500">
                  Enter and confirm your new BioNova password.
                </p>

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="mt-8 space-y-6"
                >
                  {/* NEW PASSWORD */}

                  <div>
                    <label className="text-sm font-black text-slate-800">
                      New password
                    </label>

                    <div className="relative mt-2">
                      <LockKeyhole
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={
                          newPassword
                        }
                        onChange={(
                          event
                        ) =>
                          setNewPassword(
                            event.target.value
                          )
                        }
                        placeholder="Create a new password"
                        autoComplete="new-password"
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-700"
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

                  {/* REQUIREMENTS */}

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-black text-slate-800">
                      Password requirements
                    </p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Rule
                        passed={
                          passwordRules.length
                        }
                        text="8+ characters"
                      />

                      <Rule
                        passed={
                          passwordRules.uppercase
                        }
                        text="Uppercase letter"
                      />

                      <Rule
                        passed={
                          passwordRules.lowercase
                        }
                        text="Lowercase letter"
                      />

                      <Rule
                        passed={
                          passwordRules.number
                        }
                        text="Number"
                      />
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div>
                    <label className="text-sm font-black text-slate-800">
                      Confirm password
                    </label>

                    <div className="relative mt-2">
                      <LockKeyhole
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={
                          confirmPassword
                        }
                        onChange={(
                          event
                        ) =>
                          setConfirmPassword(
                            event.target.value
                          )
                        }
                        placeholder="Confirm your new password"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-slate-300 py-3.5 pl-12 pr-12 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (
                              current
                            ) =>
                              !current
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-700"
                      >
                        {showConfirmPassword ? (
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

                    {confirmPassword &&
                      newPassword ===
                        confirmPassword && (
                        <p className="mt-2 flex items-center gap-2 text-sm font-bold text-emerald-600">
                          <Check
                            size={15}
                          />

                          Passwords match
                        </p>
                      )}
                  </div>

                  <button
                    type="submit"
                    disabled={
                      loading
                    }
                    className="inline-flex w-full items-center justify-center rounded-xl bg-teal-600 px-5 py-3.5 font-black text-white transition hover:bg-teal-700 disabled:opacity-60"
                  >
                    {loading
                      ? "Resetting password..."
                      : "Reset password"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2
                    size={30}
                  />
                </div>

                <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
                  Password updated
                </p>

                <h1 className="mt-3 text-3xl font-black text-slate-950">
                  Your password has been reset
                </h1>

                <p className="mt-3 leading-7 text-slate-500">
                  You can now sign in to BioNova using your new password.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/login",
                      {
                        replace:
                          true,
                      }
                    )
                  }
                  className="mt-7 w-full rounded-xl bg-teal-600 px-5 py-3.5 font-black text-white transition hover:bg-teal-700"
                >
                  Login with new password
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   PASSWORD RULE
========================================================= */

function Rule({
  passed,
  text,
}) {
  return (
    <div
      className={`flex items-center gap-2 text-sm font-bold ${
        passed
          ? "text-emerald-700"
          : "text-slate-400"
      }`}
    >
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full ${
          passed
            ? "bg-emerald-100"
            : "bg-slate-200"
        }`}
      >
        {passed ? (
          <Check
            size={12}
          />
        ) : (
          <X
            size={11}
          />
        )}
      </div>

      {text}
    </div>
  );
}

export default ResetPasswordPage;
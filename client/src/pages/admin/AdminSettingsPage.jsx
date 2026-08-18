import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Save,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  changePassword,
  getCurrentUser,
  updateProfile,
} from "../../api/userApi";

import LoadingSpinner from "../../components/ui/LoadingSpinner";

const initialProfileForm = {
  name: "",
  email: "",
};

const initialPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function AdminSettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState(
    initialProfileForm
  );

  const [passwordForm, setPasswordForm] = useState(
    initialPasswordForm
  );

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingPassword, setSavingPassword] =
    useState(false);

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const loadUser = async () => {
    try {
      setLoading(true);

      const response = await getCurrentUser();

      const currentUser =
        response.user || response.data?.user || null;

      if (!currentUser) {
        throw new Error(
          "User information was not returned"
        );
      }

      setUser(currentUser);

      setProfileForm({
        name: currentUser.name || "",
        email: currentUser.email || "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to load admin profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateProfileForm = () => {
    const name = profileForm.name.trim();

    if (name.length < 2) {
      toast.error(
        "Name must contain at least 2 characters."
      );

      return false;
    }

    if (name.length > 100) {
      toast.error(
        "Name cannot exceed 100 characters."
      );

      return false;
    }

    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) {
      toast.error("Enter your current password.");
      return false;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error(
        "New password must contain at least 8 characters."
      );

      return false;
    }

    if (
      passwordForm.newPassword ===
      passwordForm.currentPassword
    ) {
      toast.error(
        "The new password must be different from your current password."
      );

      return false;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      toast.error(
        "New password and confirmation do not match."
      );

      return false;
    }

    return true;
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    try {
      setSavingProfile(true);

      const response = await updateProfile({
        name: profileForm.name.trim(),
      });

      const updatedUser =
        response.user ||
        response.data?.user || {
          ...user,
          name: profileForm.name.trim(),
        };

      setUser(updatedUser);

      setProfileForm((current) => ({
        ...current,
        name: updatedUser.name || current.name,
      }));

      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    try {
      setSavingPassword(true);

      await changePassword({
        currentPassword:
          passwordForm.currentPassword,

        newPassword: passwordForm.newPassword,
      });

      setPasswordForm(initialPasswordForm);

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      toast.success(
        "Password changed successfully."
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to change password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner
        fullScreen
        size="lg"
        title="Loading settings"
        message="Preparing your profile and account information."
      />
    );
  }

  const initial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    "A";

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
              Account Settings
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              Manage your administrator profile, security
              preferences and account credentials.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[0.7fr_1.3fr]">
          <aside className="space-y-6">
            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-100 text-3xl font-black text-indigo-700">
                {initial}
              </div>

              <h2 className="mt-6 text-2xl font-black text-slate-950">
                {user?.name || "Platform Admin"}
              </h2>

              <p className="mt-2 break-all text-slate-500">
                {user?.email || "No email available"}
              </p>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4">
                <ShieldCheck
                  size={21}
                  className="shrink-0 text-emerald-600"
                />

                <div>
                  <p className="font-black text-emerald-900">
                    Administrator
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    Full platform access
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Account status
                </p>

                <p className="mt-2 font-black text-slate-950">
                  {user?.status || "ACTIVE"}
                </p>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <Settings size={21} />
                </div>

                <div>
                  <h2 className="font-black text-slate-950">
                    Preferences
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    More options coming soon
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="font-medium text-slate-600">
                    Appearance
                  </span>

                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                    Light
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="font-medium text-slate-600">
                    Notifications
                  </span>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    Enabled
                  </span>
                </div>
              </div>
            </article>
          </aside>

          <section className="space-y-8">
            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <UserRound size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    Profile information
                  </h2>

                  <p className="mt-1 text-slate-500">
                    Update your display name and review your
                    login email.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleProfileSubmit}
                className="mt-8 space-y-6"
              >
                <div>
                  <label
                    htmlFor="admin-name"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="admin-name"
                      name="name"
                      type="text"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your name"
                      maxLength={100}
                      className="w-full rounded-xl border border-slate-300 py-3.5 pl-12 pr-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-email"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="admin-email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-3.5 pl-12 pr-4 text-slate-500 outline-none"
                    />
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Email changes are disabled for security.
                  </p>
                </div>

                <div className="flex justify-end border-t border-slate-200 pt-6">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={18} />

                    {savingProfile
                      ? "Saving..."
                      : "Save profile"}
                  </button>
                </div>
              </form>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <KeyRound size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    Change password
                  </h2>

                  <p className="mt-1 text-slate-500">
                    Use a strong password that you do not use
                    elsewhere.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handlePasswordSubmit}
                className="mt-8 space-y-6"
              >
                <PasswordInput
                  id="current-password"
                  name="currentPassword"
                  label="Current password"
                  placeholder="Enter current password"
                  value={
                    passwordForm.currentPassword
                  }
                  onChange={handlePasswordChange}
                  visible={showCurrentPassword}
                  onToggle={() =>
                    setShowCurrentPassword(
                      (current) => !current
                    )
                  }
                />

                <PasswordInput
                  id="new-password"
                  name="newPassword"
                  label="New password"
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  visible={showNewPassword}
                  onToggle={() =>
                    setShowNewPassword(
                      (current) => !current
                    )
                  }
                />

                <PasswordInput
                  id="confirm-password"
                  name="confirmPassword"
                  label="Confirm new password"
                  placeholder="Enter new password again"
                  value={
                    passwordForm.confirmPassword
                  }
                  onChange={handlePasswordChange}
                  visible={showConfirmPassword}
                  onToggle={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                />

                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                  <div className="flex items-start gap-3">
                    <LockKeyhole
                      size={20}
                      className="mt-0.5 shrink-0 text-indigo-600"
                    />

                    <div>
                      <h3 className="font-black text-indigo-950">
                        Password requirements
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-indigo-800">
                        Use at least 8 characters. Avoid using
                        your name, email address or a previously
                        used password.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-200 pt-6">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <KeyRound size={18} />

                    {savingPassword
                      ? "Updating..."
                      : "Change password"}
                  </button>
                </div>
              </form>
            </article>
          </section>
        </section>
      </section>
    </main>
  );
}

function PasswordInput({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  visible,
  onToggle,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          className="w-full rounded-xl border border-slate-300 py-3.5 pl-12 pr-12 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-indigo-600"
          aria-label={
            visible ? "Hide password" : "Show password"
          }
        >
          {visible ? (
            <EyeOff size={19} />
          ) : (
            <Eye size={19} />
          )}
        </button>
      </div>
    </div>
  );
}

export default AdminSettingsPage;
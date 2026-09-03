import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CheckCircle2,
  CircleOff,
  Eye,
  EyeOff,
  History,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Settings2,
  Sun,
  Trash2,
  Type,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import ConfirmModal from "../components/common/ConfirmModal";
import UserAvatar from "../components/common/UserAvatar";
import API from "../utils/axios";
import toast from "react-hot-toast";
import { canApplyToJobs, getUserRoleLabel } from "../utils/badgeUtils";
import {
  canUseSpecialStyle,
  getSpecialUserStyle,
  SPECIAL_STYLE_VARIANTS,
} from "../utils/specialUserStyles";
import { isPlatformAdmin } from "../utils/userSignals";
import { getStoredThemeMode, setStoredThemeMode } from "../utils/theme";
import {
  APP_FONT_OPTIONS,
  getStoredFontMode,
  setStoredFontMode,
} from "../utils/font";

const APP_THEME_OPTIONS = [
  {
    value: "light",
    label: "Light",
    description: "Clean bright interface",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Low-light teal workspace",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Follow device setting",
    icon: Monitor,
  },
];

const FONT_PREVIEW_STYLES = {
  modern:
    '"Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif',
  professional:
    '"Inter", "Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  rounded:
    '"Nunito", "Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  editorial: '"Lora", Georgia, "Times New Roman", serif',
  compact:
    '"Roboto Condensed", "Inter", system-ui, -apple-system, sans-serif',
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const SectionCard = ({
  icon: Icon,
  title,
  description,
  tone = "primary",
  children,
}) => {
  const toneClass =
    tone === "success"
      ? "bg-success/10 text-success"
      : tone === "error"
        ? "bg-error/10 text-error"
        : tone === "secondary"
          ? "bg-secondary/10 text-secondary"
          : "bg-primary/10 text-primary";

  return (
    <section className="overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 shadow-sm">
      <div className="flex items-start gap-3 border border-base-200/70 bg-base-200/20 px-3 py-3 sm:p-5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${toneClass}`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-heading text-sm font-bold sm:text-lg">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-base-content/55 sm:text-sm">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="p-3 sm:p-5">{children}</div>
    </section>
  );
};

const ToggleRow = ({
  icon: Icon,
  title,
  subtitle,
  active,
  activeText,
  inactiveText,
  tone = "primary",
  toggleClass = "toggle-primary",
  loading,
  onChange,
  action,
}) => {
  const toneClass =
    tone === "success"
      ? "bg-success/10 text-success"
      : tone === "error"
        ? "bg-error/10 text-error"
        : "bg-primary/10 text-primary";

  return (
    <div className="rounded-xl border border-base-300/70 bg-base-100 p-3 shadow-sm sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              active ? toneClass : "bg-base-200 text-base-content/45"
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold sm:text-base">{title}</h3>
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-base-content/55 sm:line-clamp-none">
              {subtitle}
            </p>
            <span
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium sm:mt-3 sm:px-2.5 sm:py-1 sm:text-xs ${
                active ? toneClass : "bg-base-200 text-base-content/60"
              }`}
            >
              {active ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <CircleOff className="h-3.5 w-3.5" />
              )}
              {active ? activeText : inactiveText}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-medium text-base-content/50 sm:inline">
              {active ? "On" : "Off"}
            </span>
            <input
              type="checkbox"
              className={`toggle ${toggleClass}`}
              checked={active}
              onChange={onChange}
              disabled={loading}
            />
          </div>
          {action}
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const { user, logout, deleteAccount, isLoading, updateProfile, setUser } =
    useAuthStore();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [opportunityLoading, setOpportunityLoading] = useState(false);
  const [presenceLoading, setPresenceLoading] = useState(false);
  const [loginAuditLoading, setLoginAuditLoading] = useState(false);
  const [themeLoading, setThemeLoading] = useState(false);
  const [appThemeMode, setAppThemeMode] = useState(getStoredThemeMode);
  const [appFontMode, setAppFontMode] = useState(getStoredFontMode);
  const specialStyle = getSpecialUserStyle(user);
  const canStyleProfile = canUseSpecialStyle(user);

  const handleOpportunityToggle = async () => {
    setOpportunityLoading(true);
    try {
      const { data } = await API.patch("/users/me/opportunity-status", {
        openToOpportunities: !user?.openToOpportunities,
      });
      setUser({ ...user, openToOpportunities: data.openToOpportunities });
      toast.success(
        data.openToOpportunities
          ? "You are now open to opportunities!"
          : "Opportunity status disabled"
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setOpportunityLoading(false);
    }
  };

  const handlePresenceToggle = async () => {
    setPresenceLoading(true);
    try {
      const data = await updateProfile({
        showOnlineStatus: !(user?.showOnlineStatus !== false),
      });
      toast.success(
        data.user?.showOnlineStatus === false
          ? "Online status hidden"
          : "Online status enabled",
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setPresenceLoading(false);
    }
  };

  const handleLoginAuditToggle = async () => {
    const nextValue = !(user?.loginAuditEnabled !== false);
    setLoginAuditLoading(true);
    try {
      const { data } = await API.patch("/users/me/login-audit", {
        loginAuditEnabled: nextValue,
      });
      setUser(data.user || { ...user, loginAuditEnabled: data.loginAuditEnabled });
      toast.success(
        data.loginAuditEnabled === false
          ? "Login audit disabled for your account"
          : "Login audit enabled for your account",
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update login audit");
    } finally {
      setLoginAuditLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      toast.success("Your account has been deleted.");
      setShowDeleteModal(false);
      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to delete account.";
      toast.error(message);
    }
  };

  const handleThemeChange = async (profileThemeVariant) => {
    setThemeLoading(true);
    try {
      // Use store's updateProfile which properly merges the updated
      // user from the API response into the global auth store state
      await updateProfile({ profileThemeVariant });
      toast.success("Profile color updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update color");
    } finally {
      setThemeLoading(false);
    }
  };

  const handleAppThemeChange = (mode) => {
    const nextMode = setStoredThemeMode(mode);
    setAppThemeMode(nextMode);
    toast.success(
      nextMode === "system"
        ? "Theme will follow your device"
        : `${nextMode === "dark" ? "Dark" : "Light"} theme enabled`,
    );
  };

  const handleAppFontChange = (mode) => {
    const nextMode = setStoredFontMode(mode);
    setAppFontMode(nextMode);
    const selectedFont = APP_FONT_OPTIONS.find(
      (option) => option.value === nextMode,
    );
    toast.success(`${selectedFont?.label || "Selected"} font applied`);
  };

  return (
    <div className="settings-page mx-auto max-w-5xl space-y-3 p-3 pb-24 sm:space-y-4 sm:p-4 md:space-y-6 md:p-6">
      <div className="rounded-2xl border border-base-300/70 bg-base-100 px-3 py-3 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square h-10 w-10 min-w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content shadow-sm sm:h-12 sm:w-12 sm:min-w-12 sm:rounded-2xl">
              <Settings2 className="h-5 w-5 shrink-0" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold sm:text-2xl">
                Settings
              </h1>
              <p className="text-xs text-base-content/50 sm:text-sm">
                Manage account, privacy, appearance, and platform preferences.
              </p>
            </div>
          </div>
          <Link
            to="/edit-profile"
            className="btn btn-outline btn-sm w-full justify-center gap-2 sm:w-auto"
          >
            <UserRound className="h-4 w-4" />
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid min-w-0 gap-3 sm:gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="order-2 min-w-0 space-y-3 sm:space-y-4 2xl:order-1">
          <SectionCard
            icon={
              appThemeMode === "dark"
                ? Moon
                : appThemeMode === "light"
                  ? Sun
                  : Monitor
            }
            title="Appearance"
            description="Tune the theme and typography used across the full app."
          >
            <div className="space-y-4 sm:space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">App Theme</h3>
                  <span className="badge badge-sm badge-primary badge-soft capitalize">
                    {appThemeMode}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {APP_THEME_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const selected = appThemeMode === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleAppThemeChange(option.value)}
                        className={`rounded-xl border p-2.5 text-left transition-all hover:-translate-y-0.5 sm:p-3 ${
                          selected
                            ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                            : "border-base-300 bg-base-100 hover:border-primary/25 hover:bg-base-200/50"
                        }`}
                      >
                        <span
                          className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg sm:mb-3 sm:h-9 sm:w-9 ${
                            selected
                              ? "bg-primary text-primary-content"
                              : "bg-base-200 text-base-content/70"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="block text-xs font-semibold sm:text-sm">
                          {option.label}
                        </span>
                        <span className="mt-0.5 hidden text-xs text-base-content/45 sm:block">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Type className="h-4 w-4 text-secondary" />
                  <h3 className="text-sm font-semibold">App Font</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {APP_FONT_OPTIONS.map((option) => {
                    const selected = appFontMode === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleAppFontChange(option.value)}
                        className={`rounded-xl border p-2.5 text-left transition-all hover:-translate-y-0.5 sm:p-3 ${
                          selected
                            ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                            : "border-base-300 bg-base-100 hover:border-primary/25 hover:bg-base-200/50"
                        }`}
                      >
                        <span
                          className="block text-lg font-bold sm:text-xl"
                          style={{
                            fontFamily: FONT_PREVIEW_STYLES[option.value],
                          }}
                        >
                          {option.preview}
                        </span>
                        <span className="mt-1.5 block text-xs font-semibold sm:mt-2 sm:text-sm">
                          {option.label}
                        </span>
                        <span className="mt-0.5 hidden text-xs text-base-content/45 sm:block">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={Eye}
            title="Privacy & Visibility"
            description="Control how your activity and availability appear to others."
            tone="success"
          >
            <div className="divide-y divide-base-200/80 sm:space-y-3 sm:divide-y-0">
              <ToggleRow
                icon={user?.loginAuditEnabled !== false ? History : EyeOff}
                title="Login History"
                subtitle="Allow secure login audit records for this account when admin security checks are active."
                active={user?.loginAuditEnabled !== false}
                activeText="Audit records allowed"
                inactiveText="Audit recording disabled"
                loading={loginAuditLoading}
                onChange={handleLoginAuditToggle}
                action={
                  user?.loginAuditEnabled !== false ? (
                    <Link
                      to="/settings/login-history"
                      className="btn btn-outline btn-sm whitespace-nowrap"
                    >
                      View History
                    </Link>
                  ) : null
                }
              />

              {canApplyToJobs(user) && (
                <ToggleRow
                  icon={BriefcaseBusiness}
                  title="Open to Opportunities"
                  subtitle="Show a briefcase signal on your avatar and let job posters know you are available."
                  active={Boolean(user?.openToOpportunities)}
                  activeText="Visible on your profile"
                  inactiveText="Hidden from profile signals"
                  tone="success"
                  toggleClass="toggle-success"
                  loading={opportunityLoading}
                  onChange={handleOpportunityToggle}
                />
              )}

              <ToggleRow
                icon={user?.showOnlineStatus !== false ? Eye : EyeOff}
                title="Online Status"
                subtitle="When enabled, others can see your online dot and you can see theirs."
                active={user?.showOnlineStatus !== false}
                activeText="Visible and viewing others"
                inactiveText="Hidden from everyone"
                tone="success"
                toggleClass="toggle-success"
                loading={presenceLoading}
                onChange={handlePresenceToggle}
              />
            </div>
          </SectionCard>

          {canStyleProfile && (
            <SectionCard
              icon={Palette}
              title="Special Profile Color"
              description="Choose the highlight used on your profile, posts, jobs, avatar ring, and stories."
              tone="secondary"
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SPECIAL_STYLE_VARIANTS.filter(
                  (v) => !v.adminOnly || isPlatformAdmin(user),
                ).map((variant) => {
                  const selected =
                    (user?.profileThemeVariant || "teal") === variant.value;
                  return (
                    <button
                      key={variant.value}
                      type="button"
                      onClick={() => handleThemeChange(variant.value)}
                      disabled={themeLoading}
                      className={`rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 ${
                        selected
                          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                          : "border-base-300 bg-base-100 hover:border-primary/25 hover:bg-base-200/50"
                      }`}
                    >
                      <span
                        className={`block h-8 rounded-lg ${variant.swatch}`}
                      />
                      <span className="mt-2 block text-xs font-semibold">
                        {variant.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          )}
        </div>

        <aside className="order-1 min-w-0 space-y-3 sm:space-y-4 2xl:order-2">
          <section
            className={`rounded-2xl border p-3 shadow-sm sm:p-4 ${
              canStyleProfile
                ? specialStyle.shell
                : "border-base-300/70 bg-base-100"
            }`}
          >
            <div className="flex items-start gap-3">
              <UserAvatar user={user} size={56} />
              <div className="min-w-0">
                <h2 className="truncate font-heading text-lg font-bold">
                  {user?.name || "Your Account"}
                </h2>
                <p className="truncate text-sm text-base-content/50">
                  {user?.email}
                </p>
                <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                  {getUserRoleLabel(user)}
                </span>
              </div>
            </div>
            <div className="mt-3 divide-y divide-base-200 rounded-xl border border-base-300/60 bg-base-200/25 sm:mt-4">
              {[
                ["Theme", appThemeMode],
                [
                  "Font",
                  APP_FONT_OPTIONS.find(
                    (option) => option.value === appFontMode,
                  )?.label || appFontMode,
                ],
                [
                  "Online",
                  user?.showOnlineStatus !== false ? "Visible" : "Hidden",
                ],
                [
                  "Audit",
                  user?.loginAuditEnabled !== false ? "Allowed" : "Disabled",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                >
                  <span className="text-base-content/50">{label}</span>
                  <span className="truncate font-medium capitalize">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <SectionCard
            icon={LogOut}
            title="Account Actions"
            description="Session and account controls."
            tone="secondary"
          >
            <button
              onClick={logout}
              className="btn btn-outline btn-warning w-full gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </SectionCard>

          <SectionCard
            icon={Trash2}
            title="Danger Zone"
            description="Permanently delete your account and all associated data."
            tone="error"
          >
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-error w-full gap-2"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </SectionCard>
        </aside>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Your Account?"
        message="This will permanently delete your account, posts, comments, messages, applications, and all other data. This action cannot be undone."
        confirmText="Yes, Delete My Account"
        cancelText="No, Keep It"
        variant="danger"
        isLoading={isLoading}
        requireTyping="DELETE"
      />
    </div>
  );
};

export default Settings;

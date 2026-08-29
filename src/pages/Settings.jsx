import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CheckCircle2,
  CircleOff,
  Eye,
  EyeOff,
  History,
  Monitor,
  Moon,
  Palette,
  Sun,
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold font-heading mb-6">Settings</h1>

      {/* Account Info */}
      <div className="card bg-base-100 shadow-sm border border-base-300 p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Account Information</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-base-200">
            <span className="text-sm text-base-content/60">Name</span>
            <span className="text-sm font-medium">{user?.name}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-base-200">
            <span className="text-sm text-base-content/60">Email</span>
            <span className="text-sm font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-base-content/60">Identity</span>
            <span className="text-sm font-medium capitalize">
              {getUserRoleLabel(user)}
            </span>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-300 p-6 mb-6 overflow-hidden">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            {appThemeMode === "dark" ? (
              <Moon className="w-5 h-5" />
            ) : appThemeMode === "light" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Monitor className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">App Theme</h3>
            <p className="text-xs text-base-content/50 mt-1 max-w-md">
              Choose light, dark, or let ShortJob follow your device setting.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {APP_THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = appThemeMode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleAppThemeChange(option.value)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selected
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                    : "border-base-300 hover:border-primary/25 hover:bg-base-200/50"
                }`}
              >
                <span
                  className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${
                    selected ? "bg-primary text-primary-content" : "bg-base-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="block text-sm font-semibold">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-base-content/45">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-300 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                user?.loginAuditEnabled !== false
                  ? "bg-primary/10 text-primary"
                  : "bg-base-200 text-base-content/45"
              }`}
            >
              {user?.loginAuditEnabled !== false ? (
                <History className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">Login History</h3>
              <p className="text-xs text-base-content/50 mt-1 max-w-md">
                Control whether your account can create login audit records. If
                disabled here, no login photo or location record is captured for
                you even when admin security audit is globally active.
              </p>
              <div
                className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  user?.loginAuditEnabled !== false
                    ? "bg-primary/10 text-primary"
                    : "bg-base-200 text-base-content/60"
                }`}
              >
                {user?.loginAuditEnabled !== false ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <CircleOff className="w-3.5 h-3.5" />
                )}
                {user?.loginAuditEnabled !== false
                  ? "Audit records allowed"
                  : "Audit recording disabled"}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-3">
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <span className="text-xs font-medium text-base-content/50">
                {user?.loginAuditEnabled !== false ? "On" : "Off"}
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={user?.loginAuditEnabled !== false}
                onChange={handleLoginAuditToggle}
                disabled={loginAuditLoading}
              />
            </div>
            {user?.loginAuditEnabled !== false && (
              <Link
                to="/settings/login-history"
                className="btn btn-outline btn-sm min-w-28 whitespace-nowrap"
              >
                View History
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Open to Opportunities Toggle */}
      {canApplyToJobs(user) && (
        <div className="card bg-base-100 shadow-sm border border-base-300 p-6 mb-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4 min-w-0">
              <UserAvatar user={user} size={56} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <BriefcaseBusiness className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-lg">Opportunities</h3>
                </div>
                <p className="font-semibold text-sm">Open to Opportunities</p>
                <p className="text-xs text-base-content/50 mt-1 max-w-md">
                  Show a briefcase badge on your avatar and let institutions
                  know you are available for roles.
                </p>
                <div
                  className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    user?.openToOpportunities
                      ? "bg-success/10 text-success"
                      : "bg-base-200 text-base-content/60"
                  }`}
                >
                  {user?.openToOpportunities ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <CircleOff className="w-3.5 h-3.5" />
                  )}
                  {user?.openToOpportunities
                    ? "Visible on your profile"
                    : "Hidden from profile signals"}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <span className="text-xs font-medium text-base-content/50">
                {user?.openToOpportunities ? "On" : "Off"}
              </span>
              <input
                type="checkbox"
                className="toggle toggle-success"
                checked={user?.openToOpportunities || false}
                onChange={handleOpportunityToggle}
                disabled={opportunityLoading}
              />
            </div>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-sm border border-base-300 p-6 mb-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                user?.showOnlineStatus !== false
                  ? "bg-success/10 text-success"
                  : "bg-base-200 text-base-content/45"
              }`}
            >
              {user?.showOnlineStatus !== false ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg">Online Status</h3>
              <p className="font-semibold text-sm">
                Show when you are online
              </p>
              <p className="text-xs text-base-content/50 mt-1 max-w-md">
                When enabled, others can see your online dot and you can see
                theirs. When disabled, all online dots are hidden for you.
              </p>
              <div
                className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  user?.showOnlineStatus !== false
                    ? "bg-success/10 text-success"
                    : "bg-base-200 text-base-content/60"
                }`}
              >
                {user?.showOnlineStatus !== false ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <CircleOff className="w-3.5 h-3.5" />
                )}
                {user?.showOnlineStatus !== false
                  ? "Visible and viewing others"
                  : "Hidden from everyone"}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <span className="text-xs font-medium text-base-content/50">
              {user?.showOnlineStatus !== false ? "On" : "Off"}
            </span>
            <input
              type="checkbox"
              className="toggle toggle-success"
              checked={user?.showOnlineStatus !== false}
              onChange={handlePresenceToggle}
              disabled={presenceLoading}
            />
          </div>
        </div>
      </div>

      {canStyleProfile && (
        <div className="card bg-base-100 shadow-sm border border-base-300 p-6 mb-6 overflow-hidden">
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${specialStyle.soft}`}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Special Profile Color</h3>
              <p className="text-xs text-base-content/50 mt-1 max-w-md">
                Choose the highlight used on your profile, posts, jobs, avatar
                ring, and stories.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                  className={`rounded-xl border p-3 text-left transition-all ${
                    selected
                      ? "border-primary bg-primary/8 ring-1 ring-primary/30"
                      : "border-base-300 hover:border-primary/25 hover:bg-base-200/50"
                  }`}
                >
                  <span className={`block h-8 rounded-lg ${variant.swatch}`} />
                  <span className="mt-2 block text-xs font-semibold">
                    {variant.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="card bg-base-100 shadow-sm border border-base-300 p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Account Actions</h3>
        <div className="space-y-3">
          <button
            onClick={logout}
            className="btn btn-outline btn-warning w-full"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card bg-base-100 shadow-sm border border-error/30 p-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-lg text-error">Danger Zone</h3>
        </div>
        <p className="text-sm text-base-content/60 mb-4">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="btn btn-error w-full"
          disabled={isLoading}
        >
          Delete Account
        </button>
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

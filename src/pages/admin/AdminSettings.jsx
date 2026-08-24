import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Bot,
  Briefcase,
  Clock,
  FileText,
  MessageSquareWarning,
  Save,
  Shield,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  TimerReset,
  Zap,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { isAdminUser, isSuperAdminUser } from "../../utils/badgeUtils";
import API from "../../utils/axios";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    autoApprove: false,
    autoBlockThreshold: 3,
    emailNotifications: true,
    loginAuditEnabled: false,
    moderationEnabled: true,
    autoModerationEnabled: false,
    manualReviewWindowMinutes: 1440,
    requireRejectReason: true,
    notifyCreators: true,
    requireReviewNewUsers: false,
    contentModerationRules: true,
    moderationContentTypes: {
      posts: true,
      jobs: true,
      stories: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initial fetch — inlined in effect to avoid setState-in-effect lint
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await API.get("/admin/settings");
        if (data.settings) {
          setSettings(data.settings);
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Check admin access (after hooks)
  if (!isAuthenticated || !isAdminUser(currentUser)) {
    navigate("/feed");
    return null;
  }
  if (!isSuperAdminUser(currentUser)) {
    navigate("/admin");
    return null;
  }

  const fetchSettings = async () => {
    try {
      const { data } = await API.get("/admin/settings");
      if (data.settings) {
        setSettings(data.settings);
      }
      toast.success("Settings refreshed");
    } catch {
      // Use defaults
    }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleContentTypeChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      moderationContentTypes: {
        ...(prev.moderationContentTypes || {}),
        [key]: value,
      },
    }));
  };

  const handleImmediateChange = async (key, value) => {
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);
    setSaving(true);
    try {
      const { data } = await API.put("/admin/settings", nextSettings);
      if (data.settings) {
        setSettings(data.settings);
      }
      toast.success("Setting updated");
    } catch (err) {
      setSettings(settings);
      toast.error(err.response?.data?.message || "Failed to save setting");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.put("/admin/settings", settings);
      if (data.settings) {
        setSettings(data.settings);
      }
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          <div className="h-8 w-48 skeleton rounded mb-4"></div>
          <div className="card bg-base-100 border border-base-300 rounded-xl p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 skeleton rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const SettingToggle = ({ icon: Icon, title, description, checked, onClick }) => (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-base-200/50 border border-base-300/50">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-base-content/50 leading-relaxed mt-0.5">
            {description}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="btn btn-ghost btn-sm btn-circle shrink-0"
        aria-pressed={checked}
      >
        {checked ? (
          <ToggleRight className="w-6 h-6 text-success" />
        ) : (
          <ToggleLeft className="w-6 h-6 text-base-content/40" />
        )}
      </button>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading">Admin Settings</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/admin" className="btn btn-ghost btn-sm">
            Back to Dashboard
          </Link>
          <button
            onClick={fetchSettings}
            className="btn btn-ghost btn-sm"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="card bg-base-100 shadow-sm border border-base-300/50">
          <div className="card-body">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Login Security
            </h2>
            <SettingToggle
              icon={ShieldCheck}
              title="Require Location + Photo Capture at Login"
              description="When enabled, every user must allow location and camera access to sign in. No exceptions, no skip."
              checked={settings.loginAuditEnabled}
              onClick={() =>
                handleImmediateChange("loginAuditEnabled", !settings.loginAuditEnabled)
              }
            />
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-300/50">
          <div className="card-body">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Moderation Controls
            </h2>

            <div className="grid gap-3">
              <SettingToggle
                icon={Shield}
                title="Manual Moderation Queue"
                description="Send selected new content into the admin review queue before it appears publicly."
                checked={settings.moderationEnabled}
                onClick={() =>
                  handleChange("moderationEnabled", !settings.moderationEnabled)
                }
              />
              <SettingToggle
                icon={Zap}
                title="Auto-Approve New Content"
                description="Publish new content immediately. This overrides the manual queue while enabled."
                checked={settings.autoApprove}
                onClick={() =>
                  handleChange("autoApprove", !settings.autoApprove)
                }
              />
              <SettingToggle
                icon={Bot}
                title="Auto-Review After Window"
                description="After the manual review window expires, run rule-based moderation automatically."
                checked={settings.autoModerationEnabled}
                onClick={() =>
                  handleChange(
                    "autoModerationEnabled",
                    !settings.autoModerationEnabled,
                  )
                }
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["posts", "Posts", FileText],
                ["jobs", "Jobs", Briefcase],
                ["stories", "Stories", Clock],
              ].map(([key, label, Icon]) => {
                const checked = settings.moderationContentTypes?.[key] !== false;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleContentTypeChange(key, !checked)}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      checked
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-base-300 bg-base-100 text-base-content/55"
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-3" />
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {checked ? "Manual review enabled" : "Publishes directly"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-300/50">
          <div className="card-body">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TimerReset className="w-5 h-5 text-primary" />
              Review Rules
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-base-200/50 border border-base-300/50">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Manual Review Window (minutes)
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10080"
                  className="input input-bordered input-sm w-full"
                  value={settings.manualReviewWindowMinutes}
                  onChange={(e) =>
                    handleChange(
                      "manualReviewWindowMinutes",
                      parseInt(e.target.value) || 1,
                    )
                  }
                />
                <p className="text-xs text-base-content/50 mt-2">
                  Auto-review only runs after this time, and only if auto-review is enabled.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-base-200/50 border border-base-300/50">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Auto-Block Threshold
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="input input-bordered input-sm w-full"
                  value={settings.autoBlockThreshold}
                  onChange={(e) =>
                    handleChange("autoBlockThreshold", parseInt(e.target.value) || 1)
                  }
                />
                <p className="text-xs text-base-content/50 mt-2">
                  Report threshold reserved for automated enforcement workflows.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <SettingToggle
                icon={MessageSquareWarning}
                title="Require Rejection Notes"
                description="Admins must explain why content is rejected before the action is accepted."
                checked={settings.requireRejectReason}
                onClick={() =>
                  handleChange("requireRejectReason", !settings.requireRejectReason)
                }
              />
              <SettingToggle
                icon={Bell}
                title="Notify Creators"
                description="Send real-time approval and rejection updates to the content creator."
                checked={settings.notifyCreators}
                onClick={() =>
                  handleChange("notifyCreators", !settings.notifyCreators)
                }
              />
              <SettingToggle
                icon={Bell}
                title="Email Notifications"
                description="Keep email notifications enabled for future report and moderation alerts."
                checked={settings.emailNotifications}
                onClick={() =>
                  handleChange(
                    "emailNotifications",
                    !settings.emailNotifications,
                  )
                }
              />
            </div>
          </div>

          {/* Save button */}
          <div className="px-8 pb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary w-full gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

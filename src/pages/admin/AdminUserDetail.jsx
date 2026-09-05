import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Mail,
  MapPin,
  Calendar,
  Ban,
  Unlock,
  Award,
  Trash2,
  CheckCircle,
  History,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import {
  isAdminUser,
  isSuperAdminUser,
  getActiveBadges,
  getUserRoleLabel,
  TRUST_BADGES,
} from "../../utils/badgeUtils";
import { badgeConfig } from "../../utils/badgeConfig";
import BadgeChip from "../../components/common/BadgeChip";
import ConfirmModal from "../../components/common/ConfirmModal";
import UserAvatar from "../../components/common/UserAvatar";
import API from "../../utils/axios";
import toast from "../../utils/toast";

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/users/${id}`);
      setProfile(data.user);
      setNotes(data.user?.adminNotes || "");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initial fetch — inlined to avoid setState-in-effect lint
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data } = await API.get(`/admin/users/${id}`);
        setProfile(data.user);
        setNotes(data.user?.adminNotes || "");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Check admin access (after hooks)
  if (!isAuthenticated || !isAdminUser(currentUser)) {
    navigate("/feed");
    return null;
  }

  const handleBlockAction = async (action) => {
    setActionLoading(true);
    try {
      const endpoint = `/admin/users/${id}/${action}`;
      const body =
        action === "block"
          ? { reason: "Violation of community guidelines" }
          : {};
      await API.put(endpoint, body);
      toast.success(action === "block" ? "User blocked" : "User unblocked");
      await fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGrantBadge = async () => {
    if (!selectedBadge) return;
    setActionLoading(true);
    try {
      await API.put(`/admin/users/${id}/grant-badge`, {
        badgeType: selectedBadge,
      });
      toast.success(`Badge "${selectedBadge}" granted`);
      setSelectedBadge("");
      await fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Grant badge failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminRole = async () => {
    setActionLoading(true);
    try {
      const action = profile.isAdmin ? "remove-admin" : "make-admin";
      const { data } = await API.put(`/admin/users/${id}/${action}`);
      toast.success(data.message || (profile.isAdmin ? "Admin access removed" : "User promoted to admin"));
      await fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Admin role update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setActionLoading(true);
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      setShowDeleteModal(false);
      navigate("/admin/users");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeBadge = async (badgeType) => {
    setActionLoading(true);
    try {
      await API.put(`/admin/users/${id}/revoke-badge`, { badgeType });
      toast.success(`Badge "${badgeType}" revoked`);
      await fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Revoke badge failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    setActionLoading(true);
    try {
      await API.put(`/admin/users/${id}/notes`, { notes });
      toast.success("Admin note updated");
      await fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update note");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLoginAuditToggle = async () => {
    setActionLoading(true);
    try {
      const { data } = await API.put(`/admin/users/${id}/login-audit`, {
        loginAuditEnabled: !(profile?.loginAuditEnabled !== false),
      });
      toast.success(data.message || "Login audit preference updated");
      await fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Login audit update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-2 py-3 sm:px-4 md:p-6">
        <div className="space-y-4">
          <div className="h-8 w-48 skeleton rounded mb-4"></div>
          <div className="card bg-base-100 p-6 space-y-4">
            <div className="h-6 w-3/4 skeleton rounded"></div>
            <div className="h-4 w-1/2 skeleton rounded"></div>
            <div className="h-4 w-1/3 skeleton rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-2 py-20 text-center sm:px-4 md:p-6">
        <h2 className="text-xl font-semibold text-base-content/40">
          User not found
        </h2>
      </div>
    );
  }

  const activeBadges = getActiveBadges(profile);
  const trustStatus = profile.verifiedStatus || "none";
  const trustStatusLabel =
    badgeConfig[trustStatus]?.label ||
    trustStatus.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  const canManageUser =
    isSuperAdminUser(currentUser) &&
    currentUser?._id !== profile._id &&
    !profile.isSuperAdmin;
  const canViewPlatformControls = isSuperAdminUser(currentUser);

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-2 py-3 sm:px-4 md:space-y-6 md:p-6">
      {/* Header */}
      <div data-page-header className="rounded-xl border border-base-300/70 bg-base-100 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div data-page-heading-icon className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading sm:text-2xl">User Details</h1>
              <p className="text-xs text-base-content/50 sm:text-sm">
                {canViewPlatformControls
                  ? "Account trust, badges, notes, and access controls."
                  : "User moderation notes."}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Link to="/admin/users" className="btn btn-ghost btn-sm">
              Back to Users
            </Link>
            <Link to="/admin" className="btn btn-ghost btn-sm">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="card bg-base-100 shadow-sm border border-base-300/60">
        <div className="card-body p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <UserAvatar user={profile} size={64} ringClass="ring-2 ring-primary/15" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-bold">{profile.name}</h2>
                  {canViewPlatformControls &&
                    (profile.isSuperAdmin ? (
                      <span className="badge badge-primary badge-sm">Super Admin</span>
                    ) : profile.isAdmin ? (
                      <span className="badge badge-info badge-sm">Admin</span>
                    ) : null)}
                </div>
                {canViewPlatformControls && (
                  <p className="text-sm text-base-content/50">
                    {getUserRoleLabel(profile)}
                  </p>
                )}
              </div>
            </div>

            {canManageUser && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-end">
                <button
                  onClick={handleAdminRole}
                  className={`btn btn-sm gap-2 ${profile.isAdmin ? "btn-warning" : "btn-primary"}`}
                  disabled={actionLoading}
                >
                  {profile.isAdmin ? (
                    <ShieldOff className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  {profile.isAdmin ? "Remove Admin" : "Make Admin"}
                </button>
                {profile.isBlocked ? (
                  <button
                    onClick={() => handleBlockAction("unblock")}
                    className="btn btn-success btn-sm gap-2"
                    disabled={actionLoading}
                  >
                    <Unlock className="w-4 h-4" />
                    Unblock User
                  </button>
                ) : (
                  <button
                    onClick={() => handleBlockAction("block")}
                    className="btn btn-error btn-sm gap-2"
                    disabled={actionLoading}
                  >
                    <Ban className="w-4 h-4" />
                    Block User
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Platform controls and sensitive account state are super-admin only. */}
          {canViewPlatformControls && (
          <div className="grid grid-cols-1 gap-4 mt-5 md:grid-cols-2 md:gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-base-content/40" />
                <span>{profile.email}</span>
              </div>
              {profile.city && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-base-content/40" />
                  <span>
                    {profile.city}
                    {profile.state ? `, ${profile.state}` : ""}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-base-content/40" />
                <span>Joined: {formatDate(profile.createdAt)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-base-content/40" />
                <span>Email:</span>
                <span
                  className={`badge badge-sm ${
                    profile.isEmailVerified || trustStatus === "email"
                      ? "badge-success"
                      : "badge-warning"
                  }`}
                >
                  {profile.isEmailVerified || trustStatus === "email"
                    ? "Verified"
                    : "Unverified"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {profile.isVerified ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <Award className="w-4 h-4 text-base-content/40" />
                )}
                <span>Trust Status:</span>
                <span
                  className={`badge badge-sm ${
                    profile.isVerified ? "badge-success" : "badge-ghost"
                  }`}
                >
                  {trustStatus === "none" ? "None" : trustStatusLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {profile.loginAuditEnabled !== false ? (
                  <ShieldCheck className="w-4 h-4 text-primary" />
                ) : (
                  <ShieldOff className="w-4 h-4 text-base-content/40" />
                )}
                <span>Login Audit:</span>
                <span
                  className={`badge badge-sm ${
                    profile.loginAuditEnabled !== false
                      ? "badge-primary"
                      : "badge-ghost"
                  }`}
                >
                  {profile.loginAuditEnabled !== false ? "Allowed" : "Disabled"}
                </span>
              </div>
              {profile.isBlocked && (
                <div className="flex items-center gap-2 text-sm">
                  <Ban className="w-4 h-4 text-error" />
                  <span className="text-error">
                    Blocked: {profile.blockedReason || "No reason provided"}
                  </span>
                </div>
              )}
            </div>
          </div>
          )}

          {canViewPlatformControls && (
          <div className="mt-6 rounded-xl border border-base-300/60 bg-base-200/35 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    profile.loginAuditEnabled !== false
                      ? "bg-primary/10 text-primary"
                      : "bg-base-300/60 text-base-content/45"
                  }`}
                >
                  {profile.loginAuditEnabled !== false ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <ShieldOff className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    User Login Audit Preference
                  </h3>
                  <p className="mt-1 text-xs text-base-content/55">
                    When disabled for this account, login photo, location, and
                    face audit records are not created for this user.
                  </p>
                </div>
              </div>
              {canManageUser && (
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="text-xs font-medium text-base-content/50">
                    {profile.loginAuditEnabled !== false ? "On" : "Off"}
                  </span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={profile.loginAuditEnabled !== false}
                    onChange={handleLoginAuditToggle}
                    disabled={actionLoading}
                  />
                </div>
              )}
            </div>
          </div>
          )}

          {/* Badges Section */}
          {canViewPlatformControls && (
          <div className="mt-6">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" /> Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              {activeBadges.map((b) => (
                <div key={b._id || b.type} className="flex items-center gap-1">
                  <BadgeChip badgeType={b.type} size="sm" />
                  {canManageUser && (
                    <button
                      onClick={() => handleRevokeBadge(b.type)}
                      className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-error"
                      title={`Revoke ${b.type}`}
                      disabled={actionLoading}
                    >
                      <History className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Grant Badge */}
          {canManageUser && (
            <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="flex-1">
                <label className="label pb-1">
                  <span className="label-text text-xs font-medium">
                    Grant Trust Badge
                  </span>
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                >
                  <option value="">Select a trust badge...</option>
                  {TRUST_BADGES.map((badge) => (
                    <option key={badge} value={badge}>
                      {badgeConfig[badge]?.label || badge}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGrantBadge}
                disabled={!selectedBadge || actionLoading}
                className="btn btn-primary btn-sm"
              >
                Grant
              </button>
            </div>
          )}

          {/* Moderation Notes */}
          <div className="mt-6">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <History className="w-4 h-4" /> Moderation Notes
            </h3>
            <textarea
              className="textarea textarea-bordered w-full text-sm"
              rows={3}
              placeholder="Add moderation notes about this user..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              onClick={handleAddNote}
              disabled={actionLoading}
              className="btn btn-ghost btn-sm mt-2 w-full sm:w-auto"
            >
              Save Notes
            </button>
          </div>

          {/* Danger Zone */}
          {canManageUser && (
            <div className="mt-6 pt-4 border-t border-base-300/50">
              <h3 className="font-semibold text-error text-sm mb-3">
                Danger Zone
              </h3>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-error btn-sm gap-2 w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4" />
                Delete User
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
        title="Delete this user?"
        message="This will permanently delete the account and related platform activity. This action cannot be undone."
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        isLoading={actionLoading}
        requireTyping="DELETE"
      />
    </div>
  );
};

export default AdminUserDetail;

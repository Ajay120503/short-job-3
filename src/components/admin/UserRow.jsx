import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Ban, Unlock, Award, User } from "lucide-react";
import BadgeChip from "../common/BadgeChip";
import {
  getActiveBadges,
  getUserRoleLabel,
  isSuperAdminUser,
} from "../../utils/badgeUtils";
import useAuthStore from "../../store/authStore";
import API from "../../utils/axios";
import toast from "react-hot-toast";

/**
 * Reusable admin user row with block/unblock and badge-grant actions.
 *
 * @param {object} user - The user object to display
 * @param {function} onUpdate - Optional callback to refresh parent data after actions
 */
const UserRow = ({ user, onUpdate }) => {
  const { user: currentUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const canManageUsers =
    isSuperAdminUser(currentUser) &&
    currentUser?._id !== user._id &&
    !user.isSuperAdmin;

  const handleBlock = async (action) => {
    setLoading(true);
    try {
      const endpoint = `/admin/users/${user._id}/${action}`;
      await API.put(endpoint, {
        ...(action === "block" && {
          reason: "Violation of community guidelines",
        }),
      });
      toast.success(action === "block" ? "User blocked" : "User unblocked");
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGrantBadge = async (badgeType) => {
    setLoading(true);
    try {
      await API.put(`/admin/users/${user._id}/grant-badge`, { badgeType });
      toast.success(`Badge "${badgeType}" granted`);
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Grant badge failed");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const activeBadges = getActiveBadges(user);

  return (
    <tr className="hover:bg-base-200/30 transition-colors">
      <td>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {user.profilePic?.url ? (
              <img
                src={user.profilePic.url}
                alt={user.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-base-content/50">{user.email}</div>
          </div>
        </div>
      </td>
      <td>
        <span className="text-xs text-base-content/40">
          {getUserRoleLabel(user)}
        </span>
      </td>
      <td>
        <div className="flex flex-wrap gap-1 max-w-[150px]">
          {activeBadges.slice(0, 2).map((b) => (
            <BadgeChip key={b._id || b.type} badgeType={b.type} size="sm" />
          ))}
          {activeBadges.length === 0 && (
            <span className="text-xs text-base-content/30">No badges</span>
          )}
        </div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {user.isBlocked ? (
            <span className="badge badge-error badge-sm">Blocked</span>
          ) : (
            <span className="badge badge-success badge-sm">Active</span>
          )}
          {user.isVerified && <CheckCircle className="w-4 h-4 text-success" />}
        </div>
      </td>
      <td className="text-sm text-base-content/50">
        {formatDate(user.createdAt)}
      </td>
      <td className="text-right">
        <div className="flex gap-1 justify-end">
          <Link
            to={`/admin/users/${user._id}`}
            className="btn btn-ghost btn-xs btn-circle"
            title="View details"
          >
            <User className="w-3 h-3" />
          </Link>
          {canManageUsers && (
            user.isBlocked ? (
              <button
                onClick={() => handleBlock("unblock")}
                className="btn btn-ghost btn-xs btn-circle btn-success text-success"
                title="Unblock user"
                disabled={loading}
              >
                <Unlock className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={() => handleBlock("block")}
                className="btn btn-ghost btn-xs btn-circle btn-error text-error"
                title="Block user"
                disabled={loading}
              >
                <Ban className="w-3 h-3" />
              </button>
            )
          )}
          {canManageUsers && (
            <button
              onClick={() => handleGrantBadge("verified_institution")}
              className="btn btn-ghost btn-xs btn-circle"
              title="Grant verified badge"
              disabled={loading}
            >
              <Award className="w-3 h-3" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default UserRow;

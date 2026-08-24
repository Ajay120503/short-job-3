import { BriefcaseBusiness, Shield } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import { isPlatformAdmin } from "../../utils/userSignals";
import {
  canUseSpecialStyle,
  getSpecialUserStyle,
} from "../../utils/specialUserStyles";

/**
 * Reusable avatar component that shows a refined opportunity indicator
 * when the user has "Open to Opportunities" enabled.
 *
 * Props:
 * - user: { name, profilePic: { url }, openToOpportunities }
 * - size: pixel size of the avatar (default 40)
 * - className: additional classes for the wrapper
 * - showIndicator: whether to show the green "open to opportunities" indicator (default true)
 * - showPresence: whether to show online/offline status dot (default true)
 * - ringClass: custom ring classes to override the default indicator ring
 */
const UserAvatar = ({
  user,
  size = 40,
  className = "",
  showIndicator = true,
  showPresence = true,
  ringClass = "",
}) => {
  const socketContext = useSocket();
  const isOpen = showIndicator && user?.openToOpportunities;
  const isAdmin = isPlatformAdmin(user);
  const isSpecial = canUseSpecialStyle(user);
  const specialStyle = getSpecialUserStyle(user);
  const userId = user?._id || user?.id;
  const canViewPresence = socketContext?.canViewPresence !== false;
  const isOnline = Boolean(
    showPresence &&
      canViewPresence &&
      userId &&
      (user?.isOnline || socketContext?.isUserOnline?.(userId)),
  );
  const showPresenceDot = Boolean(showPresence && canViewPresence && userId);
  const name = user?.name || "U";
  const initial = name.charAt(0)?.toUpperCase() || "U";
  const profilePic = user?.profilePic;
  const imgUrl =
    typeof profilePic === "string" ? profilePic : profilePic?.url || "";

  const baseRing = isSpecial
    ? specialStyle.ring
    : isOpen
      ? "ring-2 ring-success ring-offset-2 ring-offset-base-100"
      : "ring-2 ring-base-100";

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={isOpen ? `${name} is open to opportunities` : undefined}
    >
      <div
        className={`w-full h-full rounded-full bg-placeholder overflow-hidden shadow-sm ${
          ringClass || baseRing
        }`}
      >
        {imgUrl ? (
          <img src={imgUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-base-content/40 font-bold"
            style={{ fontSize: Math.max(size * 0.4, 10) }}
          >
            {initial}
          </div>
        )}
      </div>

      {showPresenceDot && (
        <span
          className={`absolute rounded-full shadow-sm ring-2 ring-base-100 ${
            isOnline ? "bg-success" : "bg-base-300"
          }`}
          style={{
            width: Math.max(size * 0.22, 9),
            height: Math.max(size * 0.22, 9),
            right: Math.max(size * 0.02, 1),
            bottom: Math.max(size * 0.02, 1),
          }}
          title={isOnline ? "Online" : "Offline"}
          aria-label={isOnline ? "Online" : "Offline"}
        />
      )}

      {/* Admin badge */}
      {/* {isAdmin && (
        <span
          className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center rounded-full bg-neutral text-neutral-content shadow-sm ring-2 ring-base-100"
          style={{
            width: Math.max(size * 0.32, 14),
            height: Math.max(size * 0.32, 14),
          }}
          title="Platform admin"
        >
          <Shield
            strokeWidth={2.5}
            style={{
              width: Math.max(size * 0.16, 7),
              height: Math.max(size * 0.16, 7),
            }}
          />
        </span>
      )} */}

      {/* Open to Opportunities badge */}
      {/* {isOpen && (
        <span
          className="absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center rounded-full bg-success text-success-content shadow-sm ring-2 ring-base-100"
          style={{
            width: Math.max(size * 0.34, 14),
            height: Math.max(size * 0.34, 14),
          }}
          title="Open to opportunities"
        >
          <BriefcaseBusiness
            strokeWidth={2.5}
            style={{
              width: Math.max(size * 0.17, 7),
              height: Math.max(size * 0.17, 7),
            }}
          />
        </span>
      )} */}
    </div>
  );
};

export default UserAvatar;

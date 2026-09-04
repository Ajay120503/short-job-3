import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Briefcase,
  User,
  PlusCircle,
  Shield,
  MessageCircle,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { isAdminUser } from "../../utils/badgeUtils";
import UserAvatar from "./UserAvatar";
import { useSocket } from "../../context/SocketContext";

const BottomNav = () => {
  const { user } = useAuthStore();
  const { messageCount } = useSocket();
  const navigate = useNavigate();
  const isAdmin = isAdminUser(user);

  const navItems = [
    { to: "/feed", icon: Home, label: "Home" },
    { to: "/jobs", icon: Briefcase, label: "Jobs" },
    isAdmin
      ? { to: "/admin", icon: Shield, label: "Admin" }
      : { to: "/chat", icon: MessageCircle, label: "Chat", badge: messageCount },
    { to: `/profile/${user?._id}`, icon: User, label: "Profile", avatar: true },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100/95 backdrop-blur-xl border-t border-base-300/80 z-40 safe-area-bottom shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex min-h-[4rem] max-w-3xl items-center justify-around px-1 py-1.5 sm:px-4">
        {navItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex min-h-11 min-w-14 flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
                isActive
                  ? "text-primary"
                  : "text-base-content/40 hover:text-base-content/70"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.avatar ? (
                  <UserAvatar
                    user={user}
                    size={22}
                    showPresence={false}
                    className={isActive ? "scale-110" : ""}
                    ringClass={
                      isActive
                        ? "ring-2 ring-primary ring-offset-1 ring-offset-base-100"
                        : "ring-1 ring-base-300"
                    }
                  />
                ) : (
                  <span className="relative">
                    <item.icon
                      className={`w-5 h-5 transition-transform ${
                        isActive ? "scale-110" : ""
                      }`}
                    />
                    {item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </span>
                )}
                <span className="text-[10px] font-medium leading-tight">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Center Create Post Button */}
        <button
          onClick={() => navigate("/posts/create")}
          className="flex min-h-11 min-w-14 flex-col items-center justify-center gap-0.5 px-2 py-1 -mt-5"
        >
          <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-medium text-primary leading-tight">
            Post
          </span>
        </button>

        {navItems.slice(2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex min-h-11 min-w-14 flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
                isActive
                  ? "text-primary"
                  : "text-base-content/40 hover:text-base-content/70"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.avatar ? (
                  <UserAvatar
                    user={user}
                    size={22}
                    showPresence={false}
                    className={isActive ? "scale-110" : ""}
                    ringClass={
                      isActive
                        ? "ring-2 ring-primary ring-offset-1 ring-offset-base-100"
                        : "ring-1 ring-base-300"
                    }
                  />
                ) : (
                  <span className="relative">
                    <item.icon
                      className={`w-5 h-5 transition-transform ${
                        isActive ? "scale-110" : ""
                      }`}
                    />
                    {item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </span>
                )}
                <span className="text-[10px] font-medium leading-tight">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;

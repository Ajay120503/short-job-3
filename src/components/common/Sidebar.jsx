import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Compass,
  Briefcase,
  Bookmark,
  User,
  PlusCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Bell,
  MessageCircle,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import useAuthStore from "../../store/authStore";
import { useSocket } from "../../context/SocketContext";
import UserAvatar from "./UserAvatar";
import { isAdminUser, getUserRoleLabel } from "../../utils/badgeUtils";

const Sidebar = ({ collapsed, onToggle }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { notificationCount, messageCount } = useSocket();

  const primaryNavItems = [
    { to: "/feed", icon: Home, label: "Feed" },
    { to: "/explore", icon: Compass, label: "Explore" },
    { to: "/jobs", icon: Briefcase, label: "Jobs" },
    { to: "/saved", icon: Bookmark, label: "Saved" },
    { to: `/profile/${user?._id}`, icon: User, label: "Profile" },
  ];

  const isAdmin = isAdminUser(user);

  const secondaryNavItems = [
    {
      to: "/notifications",
      icon: Bell,
      label: "Notifications",
      badge: notificationCount,
    },
    {
      to: "/chat",
      icon: MessageCircle,
      label: "Messages",
      badge: messageCount,
    },
    { to: "/settings", icon: Settings, label: "Settings" },
    ...(isAdmin
      ? [
          { to: "/admin", icon: Shield, label: "Admin Dashboard" },
          { to: "/admin/login-records", icon: ShieldCheck, label: "Login Records" },
        ]
      : []),
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-base-100 border-r border-base-300 sticky top-0 h-screen transition-all duration-300 ease-in-out z-30 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo area */}
      <div
        className={`flex items-center h-16 px-4 border-b border-base-300 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <FontAwesomeIcon
                icon={faUserGraduate}
                className="w-4 h-4 text-white"
              />
            </div>
            <span className="text-lg font-bold text-primary">ShortJob</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="btn btn-ghost btn-circle btn-sm hover:bg-base-200"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3">
        {primaryNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-base-content/70 hover:bg-base-200"
              } ${collapsed ? "justify-center" : ""}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon
              className={`w-5 h-5 flex-shrink-0 ${
                collapsed ? "group-hover:scale-110 transition-transform" : ""
              }`}
            />
            {!collapsed && <span className="text-sm">{item.label}</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-neutral text-neutral-content rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Create Post */}
      <div className="px-2 pb-2">
        <button
          className={`btn btn-primary shadow-lg shadow-primary/20 hover:shadow-xl transition-all ${
            collapsed ? "btn-circle btn-sm w-10 h-10 mx-auto flex" : "w-full"
          }`}
          onClick={() => navigate("/posts/create")}
          title={collapsed ? "Create Post" : undefined}
        >
          <PlusCircle className="w-5 h-5" />
          {!collapsed && <span>Create Post</span>}
        </button>
      </div>

      {/* Secondary nav items */}
      <div className="px-2 py-1 border-t border-base-200 mt-1">
        {secondaryNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-base-content/50 hover:text-base-content/80 hover:bg-base-200"
              } ${collapsed ? "justify-center" : ""}`
            }
            title={collapsed ? item.label : undefined}
          >
            <div className="relative">
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </div>
            {!collapsed && <span className="text-sm flex-1">{item.label}</span>}
            {!collapsed && item.badge > 0 && (
              <span className="badge badge-xs badge-error text-white">
                {item.badge}
              </span>
            )}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-neutral text-neutral-content rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                {item.label}
                {item.badge > 0 ? ` (${item.badge})` : ""}
              </div>
            )}
          </NavLink>
        ))}
      </div>

      {/* User profile at bottom */}
      <div className="px-2 py-2 border-t border-base-300 mt-auto">
        <NavLink
          to={`/profile/${user?._id}`}
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-base-200 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <UserAvatar user={user} size={36} ringClass="ring-2 ring-base-200" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-base-content/50 truncate capitalize">
                {getUserRoleLabel(user)}
              </p>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;

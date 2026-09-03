import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Menu,
  X,
  Search,
  User,
  Briefcase,
  Bookmark,
  Bell,
  MessageCircle,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { useSocket } from "../../context/SocketContext";
import UserAvatar from "./UserAvatar";
import Brand from "./Brand";
import { isAdminUser } from "../../utils/badgeUtils";

const MobileHeader = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { notificationCount, messageCount } = useSocket();
  const isAdmin = isAdminUser(user);

  const handleNavigate = (to) => {
    setMenuOpen(false);
    navigate(to);
  };

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 bg-base-100/95 backdrop-blur-xl border-b border-base-300/80 shadow-sm safe-area-top">
        <div className="flex min-h-14 items-center justify-between px-3 py-2 sm:px-5">
          {/* Logo */}
          <Link to="/feed" className="flex items-center gap-2 shrink-0">
            <Brand size="sm" />
          </Link>

          {/* Right side: search + menu */}
          <div className="flex items-center gap-1">
            {/* Search button */}
            <button
              onClick={() => handleNavigate("/explore")}
              className="btn btn-ghost btn-circle btn-sm"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications quick access */}
            <button
              onClick={() => handleNavigate("/notifications")}
              className="btn btn-ghost btn-circle btn-sm relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            {/* Saved quick access */}
            <button
              onClick={() => handleNavigate("/saved")}
              className="btn btn-ghost btn-circle btn-sm"
              aria-label="Saved posts"
            >
              <Bookmark className="w-5 h-5" />
            </button>

            {/* Hamburger menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="btn btn-ghost btn-circle btn-sm"
              aria-label="Menu"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Slide-down menu */}
        {menuOpen && (
          <div className="border-t border-base-300 bg-base-100 animate-in slide-in-from-top-2 duration-200">
            {/* Quick links */}
            <div className="p-2 space-y-0.5">
              <button
                onClick={() => handleNavigate(`/profile/${user?._id}`)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-base-200 text-left"
              >
                <UserAvatar user={user} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-base-content/50">View Profile</p>
                </div>
                <User className="w-4 h-4 text-base-content/40" />
              </button>

              <button
                onClick={() => handleNavigate("/jobs")}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-base-200"
              >
                <Briefcase className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Jobs</span>
              </button>

              <button
                onClick={() => handleNavigate("/saved")}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-base-200"
              >
                <Bookmark className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Saved Posts</span>
              </button>

              <button
                onClick={() => handleNavigate("/chat")}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-base-200 relative"
              >
                <MessageCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Chat</span>
                {messageCount > 0 && (
                  <span className="ml-auto bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {messageCount > 9 ? "9+" : messageCount}
                  </span>
                )}
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleNavigate("/admin")}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-primary/10"
                >
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Admin Dashboard</span>
                </button>
              )}
            </div>

            <div className="border-t border-base-200 p-2 space-y-0.5">
              <button
                onClick={() => handleNavigate("/settings")}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-base-200"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm">Settings</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-error/10 text-error"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Overlay when menu is open */}
      {menuOpen && (
        <div
            className="lg:hidden fixed inset-0 bg-neutral/35 backdrop-blur-[1px] z-30"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
};

export default MobileHeader;

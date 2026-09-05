import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Search,
  Bell,
  MessageCircle,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { useSocket } from "../../context/SocketContext";
import UserAvatar from "./UserAvatar";
import Brand from "./Brand";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { notificationCount, messageCount } = useSocket();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="hidden md:flex items-center justify-between px-4 lg:px-6 py-2.5 bg-base-100/95 backdrop-blur-md border-b border-base-300/80 sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <Link to="/feed" className="flex items-center gap-2 shrink-0">
        <Brand size="sm" className="[&>span:last-child]:hidden lg:[&>span:last-child]:block" />
      </Link>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
        <label className="input input-bordered flex items-center gap-2 rounded-full">
          <Search className="w-4 h-4 text-base-content/40" />
          <input
            type="text"
            className="grow"
            placeholder="Search users, jobs, posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
      </form>

      {/* Right Icons */}
      <div className="flex items-center gap-1">
        <Link
          to="/notifications"
          className="btn btn-ghost btn-circle btn-sm hover:bg-primary/10 relative"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="count-badge count-badge-notification absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px]">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Link>
        <Link
          to="/chat"
          className="btn btn-ghost btn-circle btn-sm hover:bg-primary/10 relative"
        >
          <MessageCircle className="w-5 h-5" />
          {messageCount > 0 && (
            <span className="count-badge count-badge-message absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px]">
              {messageCount > 9 ? "9+" : messageCount}
            </span>
          )}
        </Link>

        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle btn-sm avatar hover:bg-primary/10"
          >
            <UserAvatar
              user={user}
              size={32}
              ringClass="ring-2 ring-primary/20"
            />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-xl border border-base-300/50 w-52 mt-2"
          >
            <li>
              <Link
                to={`/profile/${user?._id}`}
                className="flex items-center gap-2 py-2"
              >
                <User className="w-4 h-4" /> Profile
              </Link>
            </li>
            <li>
              <Link to="/settings" className="flex items-center gap-2 py-2">
                <Settings className="w-4 h-4" /> Settings
              </Link>
            </li>
            <li>
              <button
                onClick={logout}
                className="flex items-center gap-2 py-2 text-error hover:text-error/80"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

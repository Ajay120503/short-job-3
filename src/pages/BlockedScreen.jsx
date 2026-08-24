import { useNavigate } from "react-router-dom";
import {
  Bell,
  Bookmark,
  Briefcase,
  Compass,
  Home,
  LifeBuoy,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  PlusCircle,
  Search,
  Settings,
  ShieldAlert,
  User,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import useAuthStore from "../store/authStore";
import UserAvatar from "../components/common/UserAvatar";
import { getUserRoleLabel } from "../utils/badgeUtils";

const disabledNavItems = [
  { icon: Home, label: "Feed" },
  { icon: Compass, label: "Explore" },
  { icon: Briefcase, label: "Jobs" },
  { icon: Bookmark, label: "Saved" },
  { icon: User, label: "Profile" },
];

const secondaryItems = [
  { icon: Bell, label: "Notifications" },
  { icon: MessageCircle, label: "Messages" },
  { icon: Settings, label: "Settings" },
];

const DisabledNavButton = ({ icon: Icon, label }) => (
  <button
    type="button"
    disabled
    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-base-content/35 cursor-not-allowed"
    title={`${label} disabled while account is suspended`}
  >
    <Icon className="w-5 h-5 shrink-0" />
    <span className="text-sm">{label}</span>
  </button>
);

const BrandMark = ({ size = "md" }) => (
  <div
    className={`bg-primary rounded-lg flex items-center justify-center shadow-sm ${
      size === "sm" ? "w-8 h-8" : "w-9 h-9"
    }`}
  >
    <FontAwesomeIcon
      icon={faUserGraduate}
      className={`${size === "sm" ? "w-[18px] h-[18px]" : "w-5 h-5"} text-white`}
    />
  </div>
);

const BlockedScreen = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const storedBlockedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("blockedAccount") || "null");
    } catch {
      return null;
    }
  })();
  const blockedUser = user?.isBlocked ? user : storedBlockedUser;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-base-100">
      <header className="md:hidden sticky top-0 z-40 bg-base-100/95 backdrop-blur-md border-b border-base-300/80 shadow-sm safe-area-top">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 shrink-0">
            <BrandMark size="sm" />
            <span className="text-base font-bold text-primary">ShortJob</span>
          </div>
          <div className="flex items-center gap-1">
            {[Search, Bell, MessageCircle].map((Icon, index) => (
              <button
                key={index}
                type="button"
                disabled
                className="btn btn-ghost btn-circle btn-sm text-base-content/30 cursor-not-allowed"
                aria-label="Disabled feature"
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-circle btn-sm text-error"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-screen overflow-hidden">
        <aside className="hidden md:flex flex-col bg-base-100 border-r border-base-300 sticky top-0 h-screen w-64 z-30">
          <div className="flex items-center h-16 px-4 border-b border-base-300">
            <div className="flex items-center gap-2">
              <BrandMark size="sm" />
              <span className="text-lg font-bold text-primary">ShortJob</span>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3">
            {disabledNavItems.map((item) => (
              <DisabledNavButton key={item.label} {...item} />
            ))}
          </nav>

          <div className="px-2 pb-2">
            <button
              type="button"
              disabled
              className="btn btn-primary w-full opacity-45 cursor-not-allowed"
              title="Create Post disabled while account is suspended"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create Post</span>
            </button>
          </div>

          <div className="px-2 py-1 border-t border-base-200 mt-1">
            {secondaryItems.map((item) => (
              <DisabledNavButton key={item.label} {...item} />
            ))}
          </div>

          <div className="px-2 py-2 border-t border-base-300 mt-auto">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-base-200/60">
              <UserAvatar
                user={blockedUser}
                size={36}
                ringClass="ring-2 ring-base-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {blockedUser?.name || "Suspended account"}
                </p>
                <p className="text-xs text-base-content/50 truncate capitalize">
                  {getUserRoleLabel(blockedUser)}
                </p>
              </div>
              <Lock className="w-4 h-4 text-error" />
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto pb-[78px] md:pb-0">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
            <div className="rounded-xl border border-error/20 bg-error/5 p-4 mb-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-error" />
              </div>
              <div>
                <p className="text-sm font-semibold text-error">
                  App features are disabled
                </p>
                <p className="text-xs text-base-content/60 mt-0.5">
                  You can view this status page, contact support, or log out.
                </p>
              </div>
            </div>

            <section className="card bg-base-100 border border-base-300/70 shadow-sm">
              <div className="card-body p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="w-14 h-14 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-7 h-7 text-error" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-error/10 text-error px-2.5 py-1 text-xs font-semibold mb-3">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Access paused
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold font-heading text-neutral mb-2">
                      Account Suspended
                    </h1>

                    <p className="text-sm text-base-content/60 leading-relaxed">
                      Your ShortJob account is currently suspended
                      {blockedUser?.blockedReason ? " for the reason below" : ""}.
                      All posting, jobs, stories, messages, profile, and
                      browsing features are locked until an admin restores
                      access.
                    </p>

                    <div className="mt-5 grid gap-3">
                      {blockedUser?.blockedReason && (
                        <div className="rounded-lg border border-error/20 bg-error/5 p-4">
                          <p className="text-xs font-semibold text-error mb-1">
                            Suspension reason
                          </p>
                          <p className="text-sm text-base-content/75">
                            {blockedUser.blockedReason}
                          </p>
                        </div>
                      )}

                      {blockedUser?.adminNotes && (
                        <div className="rounded-lg border border-base-300 bg-base-200/50 p-4">
                          <p className="text-xs font-semibold text-base-content/50 mb-1">
                            Admin note
                          </p>
                          <p className="text-sm text-base-content/70">
                            {blockedUser.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <a
                        href="mailto:support@ShortJob.in"
                        className="btn btn-primary gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Contact Support
                      </a>
                      <button
                        onClick={handleLogout}
                        className="btn btn-outline btn-error gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-base-content/40">
              <LifeBuoy className="w-3.5 h-3.5" />
              ShortJob support usually reviews account appeals manually.
            </div>
          </div>
        </main>

        <aside className="hidden xl:flex w-80 border-l border-base-300 bg-base-100 p-4">
          <div className="w-full space-y-4">
            <div className="rounded-lg border border-base-300/70 bg-base-200/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Lock className="w-4 h-4 text-error" />
                Locked while suspended
              </div>
              <div className="space-y-2">
                {["Suggested people", "Recent jobs", "Profile tips"].map(
                  (label) => (
                    <div
                      key={label}
                      className="h-10 rounded-lg bg-base-100 border border-base-300/60 flex items-center px-3 text-xs text-base-content/35"
                    >
                      {label}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-base-100/95 backdrop-blur-md border-t border-base-300/80 z-40 safe-area-bottom shadow-lg">
        <div className="flex items-center justify-around py-1.5">
          {[
            { icon: Home, label: "Home" },
            { icon: Briefcase, label: "Jobs" },
            { icon: PlusCircle, label: "Post", center: true },
            { icon: Bookmark, label: "Saved" },
            { icon: User, label: "Profile" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              disabled
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-base-content/30 cursor-not-allowed ${
                item.center ? "-mt-5" : ""
              }`}
            >
              <div
                className={
                  item.center
                    ? "w-11 h-11 bg-primary/45 rounded-full flex items-center justify-center shadow-lg"
                    : ""
                }
              >
                <item.icon
                  className={`${item.center ? "w-6 h-6 text-white" : "w-5 h-5"}`}
                />
              </div>
              <span
                className={`text-[10px] font-medium leading-tight ${
                  item.center ? "text-primary/50" : ""
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default BlockedScreen;

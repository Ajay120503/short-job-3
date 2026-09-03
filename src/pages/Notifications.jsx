import { useState, useEffect } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Briefcase,
  Check,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import API from "../utils/axios";
import toast from "../utils/toast";
import ConfirmModal from "../components/common/ConfirmModal";
import { useSocket } from "../context/SocketContext";
import {
  canUseSpecialStyle,
  getSpecialUserStyle,
} from "../utils/specialUserStyles";

const iconMap = {
  post_like: { icon: Heart, color: "text-error", bg: "bg-error/10" },
  post_comment: {
    icon: MessageCircle,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  comment_like: { icon: Heart, color: "text-error", bg: "bg-error/10" },
  comment_reply: {
    icon: MessageCircle,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  new_follower: { icon: UserPlus, color: "text-success", bg: "bg-success/10" },
  job_applied: { icon: Briefcase, color: "text-accent", bg: "bg-accent/10" },
  application_status: {
    icon: Briefcase,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  new_message: {
    icon: MessageCircle,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  welcome: { icon: Bell, color: "text-primary", bg: "bg-primary/5" },
  content_approved: { icon: Check, color: "text-success", bg: "bg-success/10" },
  content_rejected: {
    icon: Bell,
    color: "text-error",
    bg: "bg-error/10",
  },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const { resetNotificationCount, setNotificationCount } = useSocket();

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/notifications");
      setNotifications(data.notifications || []);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      resetNotificationCount();
      toast.success("All marked as read");
    } catch {
      toast.error("Failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      const target = notifications.find((n) => n._id === id);
      const { data } = await API.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (data.wasUnread || target?.isRead === false) {
        setNotificationCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      const { data } = await API.delete("/notifications/clear-all");
      setNotifications([]);
      resetNotificationCount();
      setShowDeleteAllModal(false);
      toast.success(
        data.deletedCount
          ? `Deleted ${data.deletedCount} notifications`
          : "No notifications to delete",
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete notifications",
      );
    } finally {
      setDeletingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-3">
        <div className="h-10 w-48 skeleton mb-6"></div>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 bg-base-100 border border-base-300/50 rounded-xl p-4"
          >
            <div className="w-10 h-10 rounded-full skeleton"></div>
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-3/4 skeleton rounded"></div>
              <div className="h-3 w-1/3 skeleton rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Notifications</h1>
          <p className="text-sm text-base-content/40 mt-0.5">
            {notifications.filter((n) => !n.isRead).length || 0} unread
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="btn btn-ghost btn-sm gap-1.5 text-primary"
            >
              <Check className="w-4 h-4" /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-error"
              title="Delete all notifications"
              aria-label="Delete all notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-base-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Bell className="w-10 h-10 text-base-content/15" />
          </div>
          <h3 className="text-lg font-semibold text-base-content/40 mb-1">
            All caught up!
          </h3>
          <p className="text-sm text-base-content/30">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const item = iconMap[notif.type] || {
              icon: Bell,
              color: "text-primary",
              bg: "bg-primary/10",
            };
            const Icon = item.icon;
            const isSpecialSender = canUseSpecialStyle(notif.sender);
            const specialStyle = getSpecialUserStyle(notif.sender);

            return (
              <div
                key={notif._id}
                className={`relative flex items-start gap-4 border rounded-xl p-4 transition-all hover:shadow-sm group ${
                  isSpecialSender
                    ? `${specialStyle.shell} ${specialStyle.shellHover}`
                    : !notif.isRead
                      ? "border-l-4 border-l-primary border-base-300/50 bg-primary/[0.02] shadow-sm"
                      : "bg-base-100 border-base-300/50"
                }`}
              >
                {!notif.isRead && (
                  <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></div>
                )}

                <div
                  className={`w-10 h-10 rounded-xl ${
                    isSpecialSender ? specialStyle.soft : item.bg
                  } flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isSpecialSender ? specialStyle.icon : item.color
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-relaxed ${
                      !notif.isRead ? "font-semibold" : ""
                    }`}
                  >
                    {notif.link ? (
                      <Link
                        to={notif.link}
                        className={`transition-colors ${
                          isSpecialSender
                            ? specialStyle.muted
                            : "hover:text-primary"
                        }`}
                      >
                        {notif.message}
                      </Link>
                    ) : (
                      notif.message
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-base-content/30">
                      {new Date(notif.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {notif.sender?.name && (
                      <>
                        <span className="text-xs text-base-content/20">·</span>
                        <Link
                          to={`/profile/${notif.sender._id}`}
                          className={`text-xs hover:underline truncate max-w-[120px] ${
                            isSpecialSender ? specialStyle.muted : "text-primary"
                          }`}
                        >
                          {notif.sender.name}
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                <div className="dropdown dropdown-end flex-shrink-0 opacity-0 transition-all group-hover:opacity-100">
                  <button
                    tabIndex={0}
                    type="button"
                    className="btn btn-ghost btn-xs btn-circle text-base-content/35"
                    aria-label="Notification actions"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu z-20 w-36 rounded-box border border-base-300 bg-base-100 p-1 text-xs shadow-xl"
                  >
                    <li>
                      <button
                        onClick={() => handleDelete(notif._id)}
                        className="text-error"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={handleDeleteAll}
        title="Delete all notifications?"
        message="Unread notifications will be marked as read first, then all notifications will be permanently deleted."
        confirmText="Delete all"
        variant="danger"
        isLoading={deletingAll}
      />
    </div>
  );
};

export default Notifications;

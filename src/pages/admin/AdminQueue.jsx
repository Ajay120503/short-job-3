import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Clock, CheckCircle, RefreshCw, FileText, Briefcase, Image, Archive } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { isAdminUser } from "../../utils/badgeUtils";
import API from "../../utils/axios";
import toast from "react-hot-toast";
import QueueItem from "../../components/admin/QueueItem";

const AdminQueue = () => {
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queueType, setQueueType] = useState("post");
  const [section, setSection] = useState("queue");

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = section === "archive" ? "archive" : "queue";
      const { data } = await API.get(`/admin/${endpoint}?type=${queueType}`);
      setItems(data.items || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          `Failed to fetch moderation ${section === "archive" ? "archive" : "queue"}`,
      );
    } finally {
      setLoading(false);
    }
  }, [queueType, section]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const endpoint = section === "archive" ? "archive" : "queue";
        const { data } = await API.get(`/admin/${endpoint}?type=${queueType}`);
        setItems(data.items || []);
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            `Failed to fetch moderation ${section === "archive" ? "archive" : "queue"}`,
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [queueType, section]);

  // Check admin access (after hooks)
  if (!isAuthenticated || !isAdminUser(currentUser)) {
    navigate("/feed");
    return null;
  }

  const itemCount = items.length;
  const isArchive = section === "archive";

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-2 py-3 sm:px-4 md:space-y-6 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-base-300/70 bg-base-100 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading sm:text-2xl">
                Content Moderation
              </h1>
              <p className="text-xs text-base-content/50 sm:text-sm">
                Review pending content and revisit rejected archive items.
              </p>
            </div>
          </div>
          <Link to="/admin" className="btn btn-ghost btn-sm justify-start sm:justify-center">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Content type tabs */}
      <div className="rounded-xl border border-base-300/70 bg-base-100 p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-base-200/70 p-1 sm:inline-grid">
            {[
              ["queue", "Review Queue", Clock],
              ["archive", "Rejected Archive", Archive],
            ].map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setSection(key)}
                className={`btn btn-sm gap-1.5 ${
                  section === key
                    ? "bg-primary/10 text-primary ring-1 ring-primary/25"
                    : "btn-ghost text-base-content/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-lg bg-base-200/70 p-1 sm:inline-grid">
            {[
              ["post", "Posts", FileText],
              ["job", "Jobs", Briefcase],
              ["story", "Stories", Image],
            ].map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setQueueType(key)}
                className={`btn btn-sm gap-1.5 ${
                  queueType === key
                    ? "bg-primary/10 text-primary ring-1 ring-primary/25"
                    : "btn-ghost text-base-content/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchQueue}
            className="btn btn-ghost btn-sm justify-start gap-2 sm:justify-center"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div
        className={`rounded-xl border p-4 shadow-sm ${
          isArchive
            ? "border-error/20 bg-error/5"
            : "border-warning/20 bg-warning/5"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wide ${
                isArchive ? "text-error/80" : "text-warning/80"
              }`}
            >
              {isArchive ? "Rejected Archive" : "Pending Review"}
            </p>
            <p className={`mt-1 text-2xl font-bold ${isArchive ? "text-error" : "text-warning"}`}>
              {itemCount}
            </p>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              isArchive ? "bg-error/10 text-error" : "bg-warning/10 text-warning"
            }`}
          >
            {isArchive ? <Archive className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Queue List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card bg-base-100 border border-base-300 rounded-xl p-4 sm:p-5">
              <div className="space-y-3">
                <div className="h-4 w-3/4 skeleton rounded"></div>
                <div className="h-3 w-1/2 skeleton rounded"></div>
                <div className="h-3 w-full skeleton rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-base-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-base-content/20" />
          </div>
          <h3 className="text-xl font-semibold text-base-content/40 mb-1">
            {isArchive ? "Archive Empty" : "All Clear!"}
          </h3>
          <p className="text-sm text-base-content/30">
            No {isArchive ? "rejected" : "pending"} {queueType} items in the{" "}
            {isArchive ? "archive" : "moderation queue"}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <QueueItem
              key={item._id}
              item={item}
              type={queueType}
              mode={section}
              onUpdate={fetchQueue}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQueue;

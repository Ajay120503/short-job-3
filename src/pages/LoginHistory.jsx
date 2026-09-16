import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Clock, MapPin, MoreHorizontal, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import API from "../utils/axios";
import toast from "../utils/toast";
import useAuthStore from "../store/authStore";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Unknown";

const formatExpiry = (value) => {
  if (!value) return "Will expire 24 hours after you view it.";
  const expiresAt = new Date(new Date(value).getTime() + 24 * 60 * 60 * 1000);
  return `Auto deletes after ${formatDate(expiresAt)}.`;
};

const LoginHistory = () => {
  const { user } = useAuthStore();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const auditEnabled = user?.loginAuditEnabled !== false;

  const load = useCallback(async () => {
      if (!auditEnabled) return;
      setLoading(true);
      setError("");
      try {
        const { data } = await API.get("/users/me/login-history");
        setRecords(data.records || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load your login history. Please try again.");
      } finally {
        setLoading(false);
      }
  }, [auditEnabled]);

  useEffect(() => {
    const task = window.setTimeout(() => { load(); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  const handleDelete = async (recordId) => {
    try {
      await API.delete(`/users/me/login-history/${recordId}`);
      setRecords((prev) => prev.filter((record) => record._id !== recordId));
      toast.success("Login record deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete record");
    }
  };

  return (
    <div className="login-history-page max-w-3xl mx-auto p-4 md:p-6 pb-20">
      <header className="login-history-header mb-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link to="/settings" className="btn btn-ghost btn-sm gap-1.5"><ArrowLeft className="h-4 w-4" /> Settings</Link>
          {auditEnabled && <button type="button" onClick={load} disabled={loading} aria-label="Refresh login history" className="btn btn-ghost btn-sm btn-circle"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>}
        </div>
        <h1 className="text-2xl font-bold font-heading">Login History</h1>
        <p className="text-sm leading-6 text-base-content/60 mt-1">
          Review when and where you signed in.
        </p>
        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-base-content/60">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>These verification records are visible only to you and authorized platform admins.</p>
        </div>
      </header>

      {!auditEnabled ? (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center">
          <ShieldCheck className="w-10 h-10 text-base-content/20 mx-auto mb-3" />
          <p className="font-semibold text-base-content/65">
            Login audit is disabled
          </p>
          <p className="text-sm text-base-content/45 mt-1 max-w-md mx-auto">
            Your account will not create login photo or location records while
            this setting is off.
          </p>
          <Link to="/settings" className="btn btn-primary btn-sm mt-4">
            Open Settings
          </Link>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 skeleton rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-error/25 bg-base-100 p-6 text-center">
          <p className="text-sm text-base-content/75">{error}</p>
          <button type="button" onClick={load} className="btn btn-outline btn-sm mt-4">Try again</button>
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center">
          <Camera className="w-10 h-10 text-base-content/20 mx-auto mb-3" />
          <p className="font-semibold text-base-content/55">
            No login audit records yet
          </p>
          <p className="text-sm text-base-content/40 mt-1">
            Records appear here only after login security verification is enabled.
          </p>
        </div>
      ) : (
        <div className="login-history-records space-y-3">
          <p className="login-history-count text-xs font-semibold uppercase tracking-wide text-base-content/50">{records.length} {records.length === 1 ? "recent sign-in" : "recent sign-ins"}</p>
          {[...records].sort((a, b) => new Date(b.loginAt) - new Date(a.loginAt)).map((record) => (
            <article
              key={record._id}
              className="login-history-record rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5 grid grid-cols-[48px_minmax(0,1fr)_auto] gap-x-3 gap-y-4 shadow-sm sm:grid-cols-[64px_minmax(0,1fr)_auto]"
            >
              <div className="flex w-12 h-12 sm:w-16 sm:h-16 items-center justify-center rounded-xl overflow-hidden bg-base-200 shrink-0">
                {record.photo?.url ? (
                  <img
                    src={record.photo.url}
                    alt="Login verification"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : <ShieldCheck className="h-7 w-7 text-primary/60" />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold leading-5 [overflow-wrap:anywhere]">{record.device?.browser || "Unknown device"}</h2>
                <p className="mt-1.5 text-xs leading-5 text-base-content/65 flex items-start gap-1.5">
                  <Clock className="mt-0.5 w-3.5 h-3.5 shrink-0" />
                  <span>{formatDate(record.loginAt)}</span>
                </p>
                <p className="text-xs text-base-content/55 mt-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {[record.location?.city, record.location?.state]
                    .filter(Boolean)
                    .join(", ") || "Approximate location unavailable"}
                </p>
              </div>
              <div className="dropdown dropdown-end shrink-0">
                <button
                  tabIndex={0}
                  type="button"
                  className="btn btn-ghost btn-sm btn-circle"
                  aria-label="Login record actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <ul
                  tabIndex={0}
                  className="z-app-dropdown dropdown-content menu w-40 rounded-box border border-base-300 bg-base-100 p-1.5 text-xs shadow-xl"
                >
                  <li>
                    <button
                      type="button"
                      onClick={() => handleDelete(record._id)}
                      className="text-error"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </li>
                </ul>
              </div>
              <div className="col-span-full flex flex-wrap items-start gap-2 border-t border-base-300/50 pt-3">
                <span className={`badge badge-soft badge-sm shrink-0 ${record.userSeenAt ? "badge-success" : "badge-primary"}`}>{record.userSeenAt ? "Viewed" : "New record"}</span>
                <p className="min-w-0 flex-1 text-xs leading-5 text-base-content/55">{formatExpiry(record.userSeenAt)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoginHistory;

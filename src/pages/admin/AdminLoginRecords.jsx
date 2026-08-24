import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShieldCheck, MapPin, Clock, Laptop, Trash2 } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { isAdminUser, getUserRoleLabel } from "../../utils/badgeUtils";
import API from "../../utils/axios";
import UserAvatar from "../../components/common/UserAvatar";
import UserSignalBadge from "../../components/common/UserSignalBadge";
import LoginRecordDetail from "../../components/admin/LoginRecordDetail";
import toast from "react-hot-toast";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Unknown";

const AdminLoginRecords = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [records, setRecords] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    city: "",
    from: "",
    to: "",
    userId: queryParams.get("userId") || "",
  });

  useEffect(() => {
    if (!isAuthenticated || !isAdminUser(user)) {
      navigate("/feed");
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });
        const { data } = await API.get(`/admin/login-records?${params}`);
        setRecords(data.records || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters, isAuthenticated, navigate, user]);

  const handleDelete = async (recordId) => {
    try {
      await API.delete(`/admin/login-records/${recordId}`);
      setRecords((prev) => prev.filter((record) => record._id !== recordId));
      setExpanded((prev) => (prev === recordId ? null : prev));
      toast.success("Login record deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete record");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Login Records
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Admin-only audit trail for location and photo verified sign-ins.
          </p>
        </div>
        <Link to="/admin/settings" className="btn btn-outline btn-sm">
          Login Security Settings
        </Link>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-3 mb-4">
        <div className="grid gap-2 md:grid-cols-[1fr_160px_150px_150px]">
          <label className="input input-bordered input-sm flex items-center gap-2">
            <Search className="w-4 h-4 text-base-content/35" />
            <input
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              placeholder="Search by name or email"
              className="grow"
            />
          </label>
          <input
            className="input input-bordered input-sm"
            placeholder="City"
            value={filters.city}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, city: e.target.value }))
            }
          />
          <input
            className="input input-bordered input-sm"
            type="date"
            value={filters.from}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, from: e.target.value }))
            }
          />
          <input
            className="input input-bordered input-sm"
            type="date"
            value={filters.to}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, to: e.target.value }))
            }
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-20 skeleton rounded-2xl" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center">
          <ShieldCheck className="w-10 h-10 text-base-content/20 mx-auto mb-3" />
          <p className="font-semibold text-base-content/55">
            No login records found
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record) => {
            const userInfo = record.user || {};
            const isOpen = expanded === record._id;
            return (
              <div key={record._id} className="space-y-2">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : record._id)}
                  className="w-full rounded-2xl border border-base-300 bg-base-100 p-3 text-left hover:border-primary/30 transition-colors"
                >
                  <div className="grid gap-3 md:grid-cols-[72px_1.3fr_1fr_1fr_1fr_1fr_44px] md:items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-base-200">
                      {record.photo?.url ? (
                        <img
                          src={record.photo.url}
                          alt="Login"
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar user={userInfo} size={40} />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {userInfo.name || "Unknown user"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="badge badge-xs badge-primary badge-soft">
                            {getUserRoleLabel(userInfo)}
                          </span>
                          <UserSignalBadge user={userInfo} />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-base-content/55 truncate">
                      {userInfo.email}
                    </p>
                    <p className="text-xs text-base-content/55 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {[record.location?.city, record.location?.state]
                        .filter(Boolean)
                        .join(", ") || "Unknown"}
                    </p>
                    <p className="text-xs text-base-content/55 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(record.loginAt)}
                    </p>
                    <p className="text-xs text-base-content/55 flex items-center gap-1">
                      <Laptop className="w-3.5 h-3.5" />
                      {record.device?.browser || "Unknown"}
                    </p>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(record._id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(record._id);
                        }
                      }}
                      className="btn btn-ghost btn-sm btn-square text-error"
                      title="Delete login record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </span>
                  </div>
                </button>
                {isOpen && <LoginRecordDetail record={record} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminLoginRecords;

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShieldCheck, MapPin, Clock, Laptop, Trash2, Settings, Camera } from "lucide-react";
import useAuthStore from "../../store/authStore";
import {
  isAdminUser,
  isSuperAdminUser,
  getUserRoleLabel,
} from "../../utils/badgeUtils";
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
  const [expandedDetails, setExpandedDetails] = useState({});
  const [detailLoading, setDetailLoading] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    city: "",
    from: "",
    to: "",
    userId: queryParams.get("userId") || "",
  });
  const canDeleteRecords = isSuperAdminUser(user);

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

  const handleToggleRecord = async (recordId) => {
    if (expanded === recordId) {
      setExpanded(null);
      return;
    }

    setExpanded(recordId);
    if (expandedDetails[recordId]) return;

    setDetailLoading(recordId);
    try {
      const { data } = await API.get(`/admin/login-records/${recordId}`);
      if (data.record) {
        setExpandedDetails((prev) => ({ ...prev, [recordId]: data.record }));
        setRecords((prev) =>
          prev.map((record) =>
            record._id === recordId ? { ...record, ...data.record } : record,
          ),
        );
      }
    } catch (err) {
      setExpanded(null);
      toast.error(err.response?.data?.message || "Failed to open login record");
    } finally {
      setDetailLoading("");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-2 py-3 pb-20 sm:px-4 md:p-6">
      <div className="rounded-xl border border-base-300/70 bg-base-100 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading sm:text-2xl">
                Login Records
              </h1>
              <p className="text-xs text-base-content/50 sm:text-sm">
                Admin-only audit trail for location and photo verified sign-ins.
              </p>
            </div>
          </div>
          <Link to="/admin/settings" className="btn btn-outline btn-sm justify-start gap-2 sm:justify-center">
            <Settings className="h-4 w-4" />
            Login Security Settings
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-base-300/70 bg-base-100 p-3 shadow-sm">
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
            <div key={item} className="h-24 skeleton rounded-xl" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
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
              <div
                key={record._id}
                className={`overflow-hidden rounded-xl border bg-base-100 shadow-sm transition-all ${
                  isOpen
                    ? "border-primary/30 bg-primary/5"
                    : "border-base-300 hover:border-primary/30"
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleToggleRecord(record._id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleToggleRecord(record._id);
                    }
                  }}
                  className={`w-full cursor-pointer p-3 text-left transition-all hover:bg-primary/5 ${
                    isOpen
                      ? "border-primary/30 bg-primary/5"
                      : "border-base-300"
                  }`}
                >
                  <div
                    className={`grid gap-3 md:items-center ${
                      canDeleteRecords
                        ? "md:grid-cols-[72px_1.3fr_1fr_1fr_1fr_1fr_110px_44px]"
                        : "md:grid-cols-[72px_1.3fr_1fr_1fr_1fr_1fr_110px]"
                    }`}
                  >
                    <div className="w-full max-w-20 md:w-16 h-20 md:h-16 rounded-xl overflow-hidden bg-base-200">
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
                          <span className="badge badge-xs badge-primary badge-soft line-clamp-1">
                            {getUserRoleLabel(userInfo)}
                          </span>
                          <UserSignalBadge user={userInfo} />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-base-content/55 truncate">
                      {userInfo.email}
                    </p>
                    <p className="text-xs text-base-content/55 flex items-center gap-1 min-w-0">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {[record.location?.city, record.location?.state]
                          .filter(Boolean)
                          .join(", ") || "Unknown"}
                      </span>
                    </p>
                    <p className="text-xs text-base-content/55 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(record.loginAt)}
                    </p>
                    <p className="text-xs text-base-content/55 flex items-center gap-1">
                      <Laptop className="w-3.5 h-3.5" />
                      {record.device?.browser || "Unknown"}
                    </p>
                    <p
                      className={`text-xs flex items-center gap-1 ${
                        record.faceDetection?.detected
                          ? "text-success"
                          : "text-warning"
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {record.faceDetection?.detected
                        ? "Face verified"
                        : "Legacy record"}
                    </p>
                    {canDeleteRecords && (
                      <button
                        type="button"
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
                      </button>
                    )}
                  </div>
                </div>
                {isOpen && (
                  <div className="border-t border-base-300/70 bg-base-100 p-2 sm:p-3">
                    {detailLoading === record._id ? (
                      <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                          <div className="aspect-[4/5] skeleton rounded-2xl" />
                          <div className="space-y-3">
                            <div className="h-12 skeleton rounded-xl" />
                            <div className="grid gap-3 sm:grid-cols-2">
                              {[1, 2, 3, 4, 5, 6].map((item) => (
                                <div
                                  key={item}
                                  className="h-16 skeleton rounded-xl"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <LoginRecordDetail
                        record={expandedDetails[record._id] || record}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminLoginRecords;

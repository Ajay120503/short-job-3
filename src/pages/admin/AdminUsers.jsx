import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Download,
  RefreshCw,
  Shield,
  Ban,
  CheckCircle,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import API from "../../utils/axios";
import { getUserRoleLabel, isAdminUser } from "../../utils/badgeUtils";
import toast from "../../utils/toast";
import UserRow from "../../components/admin/UserRow";
import UserAvatar from "../../components/common/UserAvatar";

const StatCard = ({ icon: Icon, label, value, tone = "primary" }) => {
  const toneClass = {
    primary: "text-primary bg-primary/10",
    warning: "text-warning bg-warning/10",
    success: "text-success bg-success/10",
    info: "text-info bg-info/10",
  }[tone];

  return (
    <div className="rounded-xl border border-base-300/70 bg-base-100 p-3 shadow-sm sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold uppercase tracking-wide text-base-content/45">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

const UserMobileCard = ({ user }) => (
  <Link
    to={`/admin/users/${user._id}`}
    className="block rounded-xl border border-base-300/60 bg-base-100 p-3 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5"
  >
    <div className="flex items-start gap-3">
      <UserAvatar user={user} size={44} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-xs text-base-content/50">{user.email}</p>
          </div>
          <span className={`badge badge-xs shrink-0 ${user.isBlocked ? "badge-error" : "badge-success"}`}>
            {user.isBlocked ? "Blocked" : "Active"}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="badge badge-xs badge-primary badge-soft">
            {getUserRoleLabel(user)}
          </span>
          {user.isSuperAdmin ? (
            <span className="badge badge-xs badge-primary">Super Admin</span>
          ) : user.isAdmin ? (
            <span className="badge badge-xs badge-info">Admin</span>
          ) : null}
          {user.isVerified && (
            <span className="badge badge-xs badge-success badge-soft">Verified</span>
          )}
        </div>
      </div>
    </div>
  </Link>
);

const AdminUsers = () => {
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (categoryFilter) params.append("category", categoryFilter);
      if (statusFilter) params.append("status", statusFilter);
      const { data } = await API.get(`/admin/users?${params.toString()}`);
      setUsers(data.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, statusFilter]);

  // Initial fetch — inlined to avoid setState-in-effect lint
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await API.get("/admin/users");
        setUsers(data.users || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Check admin access (after hooks)
  if (!isAuthenticated || !isAdminUser(currentUser)) {
    navigate("/feed");
    return null;
  }

  const filteredUsers = users.filter(
    (u) =>
      (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!categoryFilter || u.category === categoryFilter) &&
      (!statusFilter ||
        (statusFilter === "verified"
          ? u.isVerified
          : statusFilter === "unverified"
            ? !u.isVerified
            : statusFilter === "blocked"
              ? u.isBlocked
              : true)),
  );

  const stats = {
    total: users.length,
    blocked: users.filter((u) => u.isBlocked).length,
    verified: users.filter((u) => u.isVerified).length,
    pending: users.filter((u) => !u.isVerified).length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-2 py-3 sm:px-4 md:space-y-6 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-base-300/70 bg-base-100 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading sm:text-2xl">User Management</h1>
              <p className="text-xs text-base-content/50 sm:text-sm">
                Search, verify, audit, and manage platform accounts.
              </p>
            </div>
          </div>
          <Link to="/admin" className="btn btn-ghost btn-sm justify-start sm:justify-center">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={stats.total} />
        <StatCard icon={Ban} label="Blocked" value={stats.blocked} tone="warning" />
        <StatCard icon={CheckCircle} label="Verified" value={stats.verified} tone="success" />
        <StatCard icon={Download} label="Pending" value={stats.pending} tone="info" />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-base-300/70 bg-base-100 p-3 shadow-sm">
      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_170px_150px_44px]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="input input-bordered w-full pl-10 input-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="select select-bordered select-sm w-full"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="student">Members</option>
          <option value="school">Organizations</option>
          <option value="college">Networks</option>
        </select>
        <select
          className="select select-bordered select-sm w-full"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
          <option value="blocked">Blocked</option>
        </select>
        <button
          onClick={fetchUsers}
          className="btn btn-ghost btn-sm"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      </div>

      {/* Users Table */}
      <div className="card border border-base-300/70 bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div className="block space-y-2 p-3 sm:hidden">
            {loading ? (
              <div className="h-24 skeleton rounded-xl" />
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-sm text-base-content/40">
                No users found matching your search.
              </div>
            ) : (
              filteredUsers.map((u) => <UserMobileCard key={u._id} user={u} />)
            )}
          </div>
          <div className="hidden overflow-x-auto sm:block">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>User</th>
                  <th>User Type</th>
                  <th>Badges</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-12 text-base-content/40"
                    >
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <UserRow key={u._id} user={u} onUpdate={fetchUsers} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

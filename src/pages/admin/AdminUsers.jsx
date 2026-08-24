import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Search, Download, RefreshCw, Shield } from "lucide-react";
import useAuthStore from "../../store/authStore";
import API from "../../utils/axios";
import { isAdminUser } from "../../utils/badgeUtils";
import toast from "react-hot-toast";
import UserRow from "../../components/admin/UserRow";

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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading">User Management</h1>
        </div>
        <Link to="/admin" className="btn btn-ghost btn-sm">
          Back to Dashboard
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stats bg-base-100 shadow rounded-xl">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div className="stat-title">Total Users</div>
            <div className="stat-value text-primary text-lg">{stats.total}</div>
          </div>
        </div>
        <div className="stats bg-base-100 shadow rounded-xl">
          <div className="stat">
            <div className="stat-figure text-warning">
              <Shield className="w-5 h-5" />
            </div>
            <div className="stat-title">Blocked</div>
            <div className="stat-value text-warning text-lg">
              {stats.blocked}
            </div>
          </div>
        </div>
        <div className="stats bg-base-100 shadow rounded-xl">
          <div className="stat">
            <div className="stat-figure text-success">
              <Download className="w-5 h-5" />
            </div>
            <div className="stat-title">Verified</div>
            <div className="stat-value text-success text-lg">
              {stats.verified}
            </div>
          </div>
        </div>
        <div className="stats bg-base-100 shadow rounded-xl">
          <div className="stat">
            <div className="stat-figure text-info">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="stat-title">Pending Verification</div>
            <div className="stat-value text-info text-lg">{stats.pending}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
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
          className="select select-bordered select-sm w-40"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="student">Members</option>
          <option value="school">Organizations</option>
          <option value="college">Networks</option>
        </select>
        <select
          className="select select-bordered select-sm w-32"
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

      {/* Users Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
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

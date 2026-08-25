import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Ban,
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  Gauge,
  Layers,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import API from "../../utils/axios";
import { getUserRoleLabel, isAdminUser, isSuperAdminUser } from "../../utils/badgeUtils";
import QueueItem from "../../components/admin/QueueItem";
import UserRow from "../../components/admin/UserRow";
import UserAvatar from "../../components/common/UserAvatar";

const tabs = [
  { value: "overview", label: "Overview", icon: BarChart3 },
  { value: "users", label: "Users", icon: Users },
  { value: "moderation", label: "Moderation", icon: CheckCircle },
];

const statTones = {
  primary: {
    icon: "bg-primary/10 text-primary",
    value: "text-primary",
  },
  warning: {
    icon: "bg-warning/10 text-warning",
    value: "text-warning",
  },
  success: {
    icon: "bg-success/10 text-success",
    value: "text-success",
  },
  info: {
    icon: "bg-info/10 text-info",
    value: "text-info",
  },
};

const StatTile = ({ icon: Icon, label, value, tone = "primary", note }) => (
  <div className="rounded-xl bg-base-100 border border-base-300/70 shadow-sm p-3 sm:p-4 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] sm:text-[11px] font-bold text-base-content/45 uppercase tracking-wide truncate">
          {label}
        </p>
        <p className={`mt-1.5 text-2xl sm:text-3xl font-bold ${statTones[tone].value}`}>
          {value}
        </p>
        {note && <p className="mt-1 text-[11px] sm:text-xs text-base-content/45 truncate">{note}</p>}
      </div>
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${statTones[tone].icon}`}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

const TabButton = ({ tab, activeTab, onSelect }) => {
  const Icon = tab.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(tab.value)}
      className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${
        activeTab === tab.value
          ? "bg-primary/10 text-primary ring-1 ring-primary/25 shadow-sm"
          : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
      }`}
    >
      <Icon className="w-4 h-4" />
      {tab.label}
    </button>
  );
};

const Panel = ({ title, action, children, icon: Icon }) => (
  <section className="rounded-xl bg-base-100 border border-base-300/70 shadow-sm overflow-hidden">
    <div className="px-3 sm:px-4 py-3 border-b border-base-300/60 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-base-200/40">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <h2 className="font-semibold truncate">{title}</h2>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const ProgressRow = ({ label, value, total, tone = "primary" }) => {
  const percent = total ? Math.round((value / total) * 100) : 0;
  const barClass = {
    primary: "bg-primary",
    warning: "bg-warning",
    success: "bg-success",
    info: "bg-info",
  }[tone];

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-medium text-base-content/60">{label}</span>
        <span className="text-base-content/45">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-base-300/60 overflow-hidden">
        <div className={`h-full ${barClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

const AdminUserCard = ({ item }) => (
  <Link
    to={`/admin/users/${item._id}`}
    className="block rounded-xl border border-base-300/60 bg-base-100 p-3 shadow-sm transition-all hover:border-primary/25 hover:bg-primary/5"
  >
    <div className="flex items-start gap-3">
      <UserAvatar user={item} size={42} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold truncate">{item.name}</p>
            <p className="text-xs text-base-content/50 truncate">{item.email}</p>
          </div>
          <span
            className={`badge badge-xs shrink-0 ${
              item.isBlocked ? "badge-error" : "badge-success"
            }`}
          >
            {item.isBlocked ? "Blocked" : "Active"}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="badge badge-xs badge-soft badge-primary">
            {getUserRoleLabel(item)}
          </span>
          {item.isSuperAdmin ? (
            <span className="badge badge-xs badge-primary">Super Admin</span>
          ) : item.isAdmin ? (
            <span className="badge badge-xs badge-info">Admin</span>
          ) : null}
          {item.isVerified && (
            <span className="badge badge-xs badge-success badge-soft">Verified</span>
          )}
        </div>
      </div>
    </div>
  </Link>
);

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [queueItems, setQueueItems] = useState([]);
  const [queueType, setQueueType] = useState("post");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingQueue, setLoadingQueue] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data } = await API.get("/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchQueue = useCallback(async (type = queueType) => {
    setLoadingQueue(true);
    try {
      const { data } = await API.get(`/admin/queue?type=${type}`);
      setQueueItems(data.items || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch queue");
    } finally {
      setLoadingQueue(false);
    }
  }, [queueType]);

  useEffect(() => {
    fetchUsers();
    fetchQueue("post");
  }, [fetchUsers, fetchQueue]);

  useEffect(() => {
    fetchQueue(queueType);
  }, [queueType, fetchQueue]);

  const stats = useMemo(
    () => ({
      totalUsers: users.length,
      blockedUsers: users.filter((item) => item.isBlocked).length,
      verifiedUsers: users.filter((item) => item.isVerified).length,
      activeUsers: users.filter((item) => item.isActive !== false && !item.isBlocked).length,
      admins: users.filter((item) => item.isAdmin || item.isSuperAdmin).length,
      pendingQueue: queueItems.length,
    }),
    [users, queueItems],
  );

  const filteredUsers = users.filter((item) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      item.name?.toLowerCase().includes(query) ||
      item.email?.toLowerCase().includes(query) ||
      getUserRoleLabel(item).toLowerCase().includes(query)
    );
  });

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);
  const queuePreview = queueItems.slice(0, 3);
  const verifiedRate = stats.totalUsers
    ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100)
    : 0;
  const blockedRate = stats.totalUsers
    ? Math.round((stats.blockedUsers / stats.totalUsers) * 100)
    : 0;

  if (!isAuthenticated || !isAdminUser(user)) {
    navigate("/feed");
    return null;
  }
  const canManagePlatform = isSuperAdminUser(user);

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-2 py-3 sm:px-4 md:space-y-6 md:p-6">
      <div className="rounded-xl sm:rounded-2xl bg-base-100 border border-base-300/70 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-base-content/50">
                Platform health, user trust, moderation, and operational controls
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center md:justify-end">
            <button
              type="button"
              onClick={() => {
                fetchUsers();
                fetchQueue(queueType);
              }}
              className="btn btn-ghost btn-sm gap-2"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            {canManagePlatform && (
              <Link
                to="/admin/settings"
                className="btn btn-outline btn-primary btn-sm gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            )}
          </div>
        </div>

        <div className="mt-4 sm:mt-5 grid grid-cols-3 gap-1 rounded-xl bg-base-200/70 p-1 sm:inline-flex sm:max-w-full sm:overflow-x-auto">
          {tabs.map((tab) => (
            <TabButton
              key={tab.value}
              tab={tab}
              activeTab={activeTab}
              onSelect={setActiveTab}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
        <StatTile icon={Users} label="Total Users" value={stats.totalUsers} note={`${stats.activeUsers} active`} />
        <StatTile
          icon={Ban}
          label="Blocked Users"
          value={stats.blockedUsers}
          tone="warning"
          note={`${blockedRate}% of users`}
        />
        <StatTile
          icon={UserCheck}
          label="Verified Users"
          value={stats.verifiedUsers}
          tone="success"
          note={`${verifiedRate}% verified`}
        />
        <StatTile
          icon={ShieldCheck}
          label="Admins"
          value={stats.admins}
          tone="primary"
          note="Platform operators"
        />
        <StatTile
          icon={Clock}
          label={`Pending ${queueType}`}
          value={stats.pendingQueue}
          tone="info"
        />
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-4 md:gap-6">
          <div className="space-y-4 md:space-y-6">
            <Panel
              title="Platform Health"
              icon={Gauge}
              action={<span className="badge badge-sm badge-success badge-soft">Live</span>}
            >
              <div className="grid gap-3 p-3 sm:p-4 md:grid-cols-3 md:gap-4">
                <div className="rounded-xl bg-base-200/50 border border-base-300/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Trust Coverage
                  </div>
                  <ProgressRow label="Verified users" value={stats.verifiedUsers} total={stats.totalUsers} tone="success" />
                  <div className="mt-3">
                    <ProgressRow label="Blocked accounts" value={stats.blockedUsers} total={stats.totalUsers} tone="warning" />
                  </div>
                </div>
                <div className="rounded-xl bg-base-200/50 border border-base-300/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Layers className="w-4 h-4 text-info" />
                    Moderation Load
                  </div>
                  <p className="text-3xl font-bold text-info">{stats.pendingQueue}</p>
                  <p className="text-xs text-base-content/45 mt-1">Pending {queueType} reviews</p>
                </div>
                <div className="rounded-xl bg-base-200/50 border border-base-300/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Quick Actions
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link to="/admin/queue" className="btn btn-outline btn-primary btn-sm justify-start">Review content</Link>
                    <Link to="/admin/users" className="btn btn-outline btn-sm justify-start">Manage users</Link>
                    {canManagePlatform && (
                      <Link to="/admin/settings" className="btn btn-ghost btn-sm justify-start">Open settings</Link>
                    )}
                  </div>
                </div>
              </div>
            </Panel>

            <Panel
              title="Recent Users"
              icon={Users}
              action={<Link to="/admin/users" className="btn btn-ghost btn-xs">View All</Link>}
            >
              <div className="block space-y-2 p-3 sm:hidden">
                {loadingUsers ? (
                  <div className="h-24 skeleton rounded-lg"></div>
                ) : recentUsers.length === 0 ? (
                  <div className="py-8 text-center text-sm text-base-content/40">
                    No recent users.
                  </div>
                ) : (
                  recentUsers.map((item) => (
                    <AdminUserCard key={item._id} item={item} />
                  ))
                )}
              </div>
              <div className="hidden overflow-x-auto sm:block">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    <tr>
                      <td colSpan="4" className="text-center py-10">
                        <span className="loading loading-spinner loading-md text-primary"></span>
                      </td>
                    </tr>
                  ) : (
                    recentUsers.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-base-content/50">
                            {item.email}
                          </div>
                        </td>
                        <td className="text-sm">{getUserRoleLabel(item)}</td>
                        <td>
                          <span
                            className={`badge badge-sm ${
                              item.isBlocked ? "badge-error" : "badge-success"
                            }`}
                          >
                            {item.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td className="text-sm text-base-content/50">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </Panel>
          </div>

          <Panel
            title="Moderation Queue"
            icon={FileText}
            action={<Link to="/admin/queue" className="btn btn-ghost btn-xs">Open Queue</Link>}
          >
            <div className="p-3 sm:p-4 space-y-3">
              <div className="join w-full">
                {["post", "job", "story"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setQueueType(type)}
                    className={`btn btn-sm join-item flex-1 capitalize ${
                      queueType === type
                        ? "bg-primary/10 text-primary border-primary/25"
                        : "btn-ghost"
                    }`}
                  >
                    {type}s
                  </button>
                ))}
              </div>
              {loadingQueue ? (
                <div className="h-24 skeleton rounded-lg"></div>
              ) : queueItems.length === 0 ? (
                <div className="text-center py-10 text-sm text-base-content/40">
                  No pending {queueType} items.
                </div>
              ) : (
                queuePreview.map((item) => (
                  <QueueItem
                    key={item._id}
                    item={item}
                    type={queueType}
                    onUpdate={() => fetchQueue(queueType)}
                  />
                ))
              )}
            </div>
          </Panel>
        </div>
      )}

      {activeTab === "users" && (
        <section className="bg-base-100 border border-base-300/70 rounded-xl shadow-sm overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-base-300/60 bg-base-200/40 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative md:max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Search users..."
                className="input input-bordered input-sm w-full pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <Link to="/admin/users" className="btn btn-outline btn-sm">
              Full User Management
            </Link>
          </div>

          <div className="block space-y-2 p-3 sm:hidden">
            {loadingUsers ? (
              <div className="h-24 skeleton rounded-lg"></div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-10 text-center text-base-content/40">
                No users found.
              </div>
            ) : (
              filteredUsers.map((item) => (
                <AdminUserCard key={item._id} item={item} />
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <table className="table">
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
                {loadingUsers ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-10 text-base-content/40"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((item) => (
                    <UserRow key={item._id} user={item} onUpdate={fetchUsers} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "moderation" && (
        <section className="space-y-4">
          <div className="rounded-xl bg-base-100 border border-base-300/70 shadow-sm p-3 sm:p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="join w-full sm:w-auto">
              {["post", "job", "story"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setQueueType(type)}
                  className={`btn btn-sm join-item flex-1 sm:flex-none capitalize ${
                    queueType === type
                      ? "bg-primary/10 text-primary border-primary/25"
                      : "btn-ghost"
                  }`}
                >
                  {type}s
                </button>
              ))}
            </div>
            <Link to="/admin/queue" className="btn btn-outline btn-sm w-full sm:w-auto">
              Dedicated Queue
            </Link>
          </div>

          {loadingQueue ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-36 skeleton rounded-lg"></div>
              ))}
            </div>
          ) : queueItems.length === 0 ? (
            <div className="bg-base-100 border border-base-300/70 rounded-lg text-center py-16 text-base-content/40 shadow-sm">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
              No pending {queueType} items in the moderation queue.
            </div>
          ) : (
            <div className="space-y-3">
              {queueItems.map((item) => (
                <QueueItem
                  key={item._id}
                  item={item}
                  type={queueType}
                  onUpdate={() => fetchQueue(queueType)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Users,
  TrendingUp,
  Clock,
  UserPlus,
  MapPin,
  ChevronRight,
  Shield,
  BriefcaseBusiness,
  Flame,
  Sparkle,
} from "lucide-react";
import API from "../utils/axios";
import { getUserRoleLabel } from "../utils/badgeUtils";
import {
  getUserId,
  getUserSignal,
  getFollowerCount,
  isPlatformAdmin,
  isRecentlyActive,
  sortDiscoverableUsers,
} from "../utils/userSignals";
import useAuthStore from "../store/authStore";
import NoticeboardBanner from "../components/post/NoticeboardBanner";
import UserAvatar from "../components/common/UserAvatar";
import { getSpecialUserStyle } from "../utils/specialUserStyles";
import toast from "react-hot-toast";

const exploreFilters = [
  { value: "", label: "All", icon: Users },
  { value: "popular", label: "Popular", icon: Flame, clientOnly: true },
  { value: "active", label: "Active", icon: Sparkle, clientOnly: true },
  {
    value: "open_to_work",
    label: "Open to Work",
    icon: BriefcaseBusiness,
    clientOnly: true,
  },
  { value: "admin", label: "Admins", icon: Shield, role: "admin" },
];

const filterUsersByKey = (list, filterKey) => {
  switch (filterKey) {
    case "popular":
      return list.filter((u) => getFollowerCount(u) >= 5);
    case "active":
      return list.filter(isRecentlyActive);
    case "open_to_work":
      return list.filter((u) => u.openToOpportunities);
    case "admin":
      return list.filter(isPlatformAdmin);
    default:
      return list;
  }
};

const Explore = () => {
  const { user: currentUser, setUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [trendingUsers, setTrendingUsers] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [exploreFilter, setExploreFilter] = useState("");
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [following, setFollowing] = useState(
    new Set((currentUser?.following || []).map(getUserId).filter(Boolean))
  );

  useEffect(() => {
    setFollowing(
      new Set((currentUser?.following || []).map(getUserId).filter(Boolean))
    );
  }, [currentUser?.following]);

  const excludeCurrentAndFollowed = useCallback(
    (list) =>
      (list || []).filter(
        (u) => u._id !== currentUser?._id && !following.has(u._id)
      ),
    [currentUser?._id, following]
  );

  const excludeCurrentUser = useCallback(
    (list) => (list || []).filter((u) => u._id !== currentUser?._id),
    [currentUser?._id]
  );

  const searchUsers = useCallback(
    async (q, filterKey) => {
      if (!q.trim() && !filterKey) return;
      setLoading(true);
      try {
        const filter = exploreFilters.find((item) => item.value === filterKey);
        const params = new URLSearchParams();
        if (q.trim()) params.append("q", q.trim());
        if (filter?.role) params.append("role", filter.role);
        params.append("limit", filter?.clientOnly ? "80" : "40");
        const { data } = await API.get(`/users/search?${params.toString()}`);
        const filtered = sortDiscoverableUsers(
          filterUsersByKey(excludeCurrentUser(data.users), filterKey)
        );
        setUsers(filtered);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    [excludeCurrentUser]
  );

  // Fetch trending users (most followers)
  const fetchTrending = useCallback(async () => {
    try {
      const { data } = await API.get("/users/search?limit=8&excludeFollowed=true");
      const filtered = sortDiscoverableUsers(excludeCurrentAndFollowed(data.users));
      setTrendingUsers(filtered.slice(0, 6));
    } catch {
      /* ignore */
    } finally {
      setTrendingLoading(false);
    }
  }, [excludeCurrentAndFollowed]);

  // Fetch recently joined users
  const fetchRecent = useCallback(async () => {
    try {
      const { data } = await API.get("/users/search?limit=10&excludeFollowed=true");
      const filtered = sortDiscoverableUsers(excludeCurrentAndFollowed(data.users))
        .sort((a, b) => {
          const activeSort =
            Number(Boolean(getUserSignal(b))) - Number(Boolean(getUserSignal(a)));
          if (activeSort) return activeSort;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      setRecentUsers(filtered.slice(0, 6));
    } catch {
      /* ignore */
    } finally {
      setRecentLoading(false);
    }
  }, [excludeCurrentAndFollowed]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setQuery(q);
      searchUsers(q, exploreFilter);
    }
    fetchTrending();
    fetchRecent();
  }, []);

  useEffect(() => {
    if (query.trim() || exploreFilter) {
      searchUsers(query, exploreFilter);
    }
  }, [exploreFilter]);

  useEffect(() => {
    const nextQuery = query.trim();
    if (!nextQuery) {
      if (exploreFilter) {
        searchUsers("", exploreFilter);
        return;
      }
      setUsers([]);
      const url = new URL(window.location);
      url.searchParams.delete("q");
      window.history.replaceState({}, "", url);
      return;
    }

    const timer = setTimeout(() => {
      const url = new URL(window.location);
      url.searchParams.set("q", nextQuery);
      window.history.replaceState({}, "", url);
      searchUsers(nextQuery, exploreFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, exploreFilter, searchUsers]);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!query.trim() && !exploreFilter) return;
    // Update URL
    const url = new URL(window.location);
    if (query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");
    window.history.pushState({}, "", url);
    searchUsers(query, exploreFilter);
  };

  const handleFollow = async (userId) => {
    try {
      const { data } = await API.post(`/users/${userId}/follow`);
      setFollowing((prev) => {
        const next = new Set(prev);
        if (data.isFollowing) next.add(userId);
        else next.delete(userId);
        return next;
      });
      if (data.isFollowing) {
        setTrendingUsers((prev) => prev.filter((u) => u._id !== userId));
        setRecentUsers((prev) => prev.filter((u) => u._id !== userId));
        setUser?.({
          ...currentUser,
          following: [...(currentUser?.following || []), userId],
        });
      }
      if (!data.isFollowing) {
        setUser?.({
          ...currentUser,
          following: (currentUser?.following || []).filter(
            (item) => getUserId(item) !== userId
          ),
        });
      }
      toast.success(data.isFollowing ? "Following!" : "Unfollowed");
    } catch {
      toast.error("Failed to update follow");
    }
  };

  const isSearching = query.trim() || exploreFilter;

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
      <NoticeboardBanner />

      {/* Header */}
      <div className="mb-4 rounded-xl border border-base-300/70 bg-base-100 p-4 shadow-sm sm:mb-5 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold font-heading sm:text-2xl">
              Explore
            </h1>
            <p className="text-xs text-base-content/50 sm:text-sm">
              Discover people, skills, institutions, and active profiles.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar + Filters */}
      <div className="mb-5 space-y-3 rounded-xl border border-base-300/70 bg-base-100 p-3 shadow-sm sm:mb-6 sm:p-4">
        <form onSubmit={handleSearch}>
          <label className="input input-bordered flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm transition-all focus-within:border-primary/50 focus-within:shadow-md">
            <Search className="w-4 h-4 text-base-content/30 flex-shrink-0" />
            <input
              type="text"
              className="grow text-sm bg-transparent outline-none"
              placeholder="Search by name, skill, or institution..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="submit"
                className="btn btn-primary btn-xs rounded-full px-4"
              >
                Search
              </button>
            )}
          </label>
        </form>

        {/* Discovery Filters */}
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-hide">
          {exploreFilters.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.value}
                onClick={() => setExploreFilter(f.value)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  exploreFilter === f.value
                    ? "bg-primary text-primary-content shadow-sm"
                    : "bg-base-200 text-base-content/60 hover:bg-base-300 hover:text-base-content/80"
                }`}
              >
                <Icon className="w-3 h-3" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {isSearching ? (
        /* Search Results */
        <>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-base-100 border border-base-300/50 rounded-xl p-4"
                >
                  <div className="w-14 h-14 rounded-full skeleton flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 skeleton rounded"></div>
                    <div className="h-3 w-24 skeleton rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-2">
              <p className="mb-3 flex items-center gap-2 rounded-full bg-base-200/70 px-3 py-1.5 text-xs font-medium text-base-content/45 w-fit">
                <Users className="w-3.5 h-3.5" />
                {users.length} result{users.length !== 1 ? "s" : ""} found
              </p>
              {users.map((u) => {
                const signal = getUserSignal(u);
                const isSpecialUser = Boolean(signal);
                const specialStyle = getSpecialUserStyle(u);
                return (
                  <div
                    key={u._id}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-md sm:gap-4 sm:p-4 group ${
                      isSpecialUser
                        ? `${specialStyle.shell} ${specialStyle.shellHover}`
                        : "bg-base-100 border-base-300/50 hover:border-primary/30"
                    }`}
                  >
                    <Link
                      to={`/profile/${u._id}`}
                      className="flex items-center gap-3 flex-1 min-w-0 sm:gap-4"
                    >
                      <UserAvatar user={u} size={52} showBadges />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-semibold text-sm truncate transition-colors ${
                            isSpecialUser
                              ? specialStyle.muted
                              : "group-hover:text-primary"
                          }`}
                        >
                          {u.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="badge badge-sm badge-soft badge-primary text-[10px] font-medium capitalize">
                            {getUserRoleLabel(u)}
                          </span>
                          {getUserSignal(u) && (
                            <span
                              className={`badge badge-sm text-[10px] font-semibold ${getUserSignal(u).className}`}
                            >
                              {getUserSignal(u).label}
                            </span>
                          )}
                          {u.institutionName && (
                            <span
                              className={`text-[11px] truncate ${
                                isSpecialUser
                                  ? "text-base-content/60"
                                  : "text-base-content/40"
                              }`}
                            >
                              {u.institutionName}
                            </span>
                          )}
                          {u.city && (
                            <span
                              className={`flex items-center gap-0.5 text-[10px] ${
                                isSpecialUser
                                  ? "text-base-content/50"
                                  : "text-base-content/30"
                              }`}
                            >
                              <MapPin className="w-2.5 h-2.5" />
                              {u.city}
                            </span>
                          )}
                        </div>
                        {u.skills?.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {u.skills.slice(0, 3).map((skill, i) => (
                              <span
                                key={i}
                                className={`badge badge-xs text-[10px] ${
                                  isSpecialUser
                                    ? specialStyle.soft
                                    : "badge-ghost"
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                            {u.skills.length > 3 && (
                              <span
                                className={`text-[10px] ${
                                  isSpecialUser
                                    ? "text-base-content/50"
                                    : "text-base-content/30"
                                }`}
                              >
                                +{u.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFollow(u._id);
                      }}
                      className={`btn btn-active btn-sm gap-1.5 flex-shrink-0 ${
                        following.has(u._id)
                          ? "btn-outline"
                          : "btn-primary shadow-md shadow-primary/20"
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {following.has(u._id) ? "Following" : "Follow"}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-base-200 rounded-xl flex items-center justify-center mx-auto mb-5">
                <Search className="w-10 h-10 text-base-content/15" />
              </div>
              <h3 className="text-lg font-semibold text-base-content/40 mb-1">
                No users found
              </h3>
              <p className="text-sm text-base-content/30">
                Try a different search term or filter
              </p>
            </div>
          )}
        </>
      ) : (
        /* Default View - Trending + Recent */
        <div className="space-y-6 sm:space-y-8">
          {/* Trending Users */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-warning" />
                </div>
                <h2 className="font-bold text-base">Trending</h2>
              </div>
              <span className="text-xs text-base-content/40">
                Most Followed
              </span>
            </div>
            {trendingLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-base-200 rounded-2xl p-4 space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full skeleton mx-auto"></div>
                    <div className="h-3 w-20 skeleton rounded mx-auto"></div>
                    <div className="h-2 w-14 skeleton rounded mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : trendingUsers.length === 0 ? (
              <div className="rounded-2xl border border-base-300/50 bg-base-100 p-6 text-center">
                <TrendingUp className="w-8 h-8 text-base-content/20 mx-auto mb-2" />
                <p className="text-sm font-medium text-base-content/45">
                  No new people to suggest
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
                {trendingUsers.map((u) =>
                  (() => {
                    const signal = getUserSignal(u);
                    const isSpecialUser = Boolean(signal);
                    const specialStyle = getSpecialUserStyle(u);
                    return (
                      <Link
                        key={u._id}
                        to={`/profile/${u._id}`}
                        className={`card rounded-xl p-3 text-center transition-all hover:-translate-y-1 hover:shadow-md sm:p-4 group min-h-[176px] ${
                          isSpecialUser
                            ? `${specialStyle.shell} ${specialStyle.shellHover}`
                            : "bg-base-100 border border-base-300/50 hover:border-primary/20"
                        }`}
                      >
                        <UserAvatar
                          user={u}
                          size={56}
                          className="mx-auto"
                          showBadges
                        />
                        <p
                          className={`font-semibold text-sm mt-2.5 line-clamp-2 min-h-[40px] transition-colors ${isSpecialUser ? specialStyle.muted : "group-hover:text-primary"}`}
                        >
                          {u.name}
                        </p>
                        <div className="mt-1 flex flex-wrap justify-center gap-1">
                          <span className="badge badge-xs badge-soft badge-primary text-[10px] capitalize max-w-full truncate">
                            {getUserRoleLabel(u)}
                          </span>
                          {signal && (
                            <span
                              className={`badge badge-xs text-[10px] ${signal.className}`}
                            >
                              {signal.label}
                            </span>
                          )}
                        </div>
                        {u.institutionName && (
                          <p
                            className={`text-[10px] mt-1 truncate ${isSpecialUser ? "text-base-content/60" : "text-base-content/40"}`}
                          >
                            {u.institutionName}
                          </p>
                        )}
                        {u.followers?.length > 0 && (
                          <p
                            className={`text-[10px] mt-1.5 ${isSpecialUser ? "text-base-content/60" : "text-base-content/40"}`}
                          >
                            {u.followers.length} follower
                            {u.followers.length !== 1 ? "s" : ""}
                          </p>
                        )}
                      </Link>
                    );
                  })(),
                )}
              </div>
            )}
          </div>

          {/* Recently Joined */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-success" />
                </div>
                <h2 className="font-bold text-base">New to ShortJob</h2>
              </div>
              <span className="text-xs text-base-content/40">
                Recently Joined
              </span>
            </div>
            {recentLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-base-100 border border-base-300/50 rounded-xl p-4"
                  >
                    <div className="w-12 h-12 rounded-full skeleton flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 skeleton rounded"></div>
                      <div className="h-3 w-20 skeleton rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="rounded-2xl border border-base-300/50 bg-base-100 p-6 text-center">
                <Clock className="w-8 h-8 text-base-content/20 mx-auto mb-2" />
                <p className="text-sm font-medium text-base-content/45">
                  No new people to suggest
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentUsers.map((u) => {
                  const signal = getUserSignal(u);
                  const isSpecialUser = Boolean(signal);
                  const specialStyle = getSpecialUserStyle(u);
                  return (
                    <div
                      key={u._id}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-all hover:shadow-sm sm:gap-4 sm:p-4 group ${
                        isSpecialUser
                          ? `${specialStyle.shell} ${specialStyle.shellHover}`
                          : "bg-base-100 border-base-300/30 hover:border-primary/20"
                      }`}
                    >
                      <Link
                        to={`/profile/${u._id}`}
                        className="flex items-center gap-4 flex-1 min-w-0"
                      >
                        <UserAvatar user={u} size={48} showBadges />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-semibold text-sm truncate transition-colors ${isSpecialUser ? specialStyle.muted : "group-hover:text-primary"}`}
                          >
                            {u.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="badge badge-xs badge-soft badge-primary text-[10px] font-medium capitalize">
                              {getUserRoleLabel(u)}
                            </span>
                            {u.institutionName && (
                              <span className="text-[10px] text-base-content/40 truncate">
                                {u.institutionName}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleFollow(u._id);
                        }}
                        className={`btn btn-xs gap-1 flex-shrink-0 ${
                          following.has(u._id)
                            ? "btn-outline"
                            : "btn-primary shadow-sm"
                        }`}
                      >
                        <UserPlus className="w-3 h-3" />
                        {following.has(u._id) ? "Following" : "Follow"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom CTA */}
          <div className="text-center pb-8">
            <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-primary/10">
              <Users className="w-8 h-8 text-primary/30" />
            </div>
            <p className="text-sm text-base-content/40 font-medium">
              Can't find who you're looking for?
            </p>
            <p className="text-xs text-base-content/30 mt-1 mb-3">
              Try searching by name, skill, or institution above
            </p>
            <button
              onClick={() =>
                document.querySelector('input[type="text"]')?.focus()
              }
              className="btn btn-sm btn-ghost text-primary gap-1.5"
            >
              Start Searching <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;

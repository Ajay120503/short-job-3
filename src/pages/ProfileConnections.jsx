import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, UserPlus, Users, X } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import API from "../utils/axios";
import toast from "../utils/toast";
import useAuthStore from "../store/authStore";
import UserAvatar from "../components/common/UserAvatar";
import VerifiedBadge from "../components/common/VerifiedBadge";
import UserSignalBadge from "../components/common/UserSignalBadge";
import { getUserRoleLabel } from "../utils/badgeUtils";
import { getUserId } from "../utils/userSignals";

const CONNECTION_TYPES = new Set(["followers", "following"]);

const ProfileConnections = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [connections, setConnections] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingIds, setPendingIds] = useState(new Set());
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const followingIds = useMemo(
    () => new Set((currentUser?.following || []).map(getUserId).filter(Boolean)),
    [currentUser?.following],
  );

  const loadConnections = useCallback(async () => {
    if (!CONNECTION_TYPES.has(type)) return;
    setLoading(true);
    setError("");
    try {
      const [profileResult, listResult] = await Promise.all([
        API.get(`/users/${id}`),
        API.get(`/users/${id}/${type}`),
      ]);
      setProfile(profileResult.data.user);
      setConnections(listResult.data[type] || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load this list. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id, type]);

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      loadConnections();
    };
    load();
  }, [loadConnections]);

  const filteredConnections = useMemo(() => {
    if (!deferredQuery) return connections;
    return connections.filter((person) =>
      [person.name, person.institutionName, getUserRoleLabel(person)]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(deferredQuery)),
    );
  }, [connections, deferredQuery]);

  const handleFollow = async (personId) => {
    if (pendingIds.has(personId)) return;
    setPendingIds((current) => new Set(current).add(personId));
    try {
      const { data } = await API.post(`/users/${personId}/follow`);
      const currentFollowing = currentUser?.following || [];
      const nextFollowing = data.isFollowing
        ? [...currentFollowing.filter((item) => getUserId(item) !== personId), personId]
        : currentFollowing.filter((item) => getUserId(item) !== personId);

      setUser({ ...currentUser, following: nextFollowing });
      if (type === "following" && id === currentUser?._id && !data.isFollowing) {
        setConnections((current) => current.filter((person) => person._id !== personId));
      }
      toast.success(data.isFollowing ? "Following" : "Unfollowed");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Could not update follow status.");
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(personId);
        return next;
      });
    }
  };

  if (!CONNECTION_TYPES.has(type)) {
    return <Navigate to={`/profile/${id}/followers`} replace />;
  }

  const count = type === "followers"
    ? profile?.followers?.length || 0
    : profile?.following?.length || 0;

  return (
    <div className="mx-auto min-h-full w-full max-w-2xl bg-base-100 pb-20 md:my-6 md:min-h-0 md:rounded-2xl md:border md:border-base-300/60 md:pb-0 md:shadow-sm">
      <header className="sticky top-0 z-app-sticky border-b border-base-300/70 bg-base-100/95 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-3 sm:px-5">
          <button
            type="button"
            onClick={() => navigate(`/profile/${id}`)}
            className="btn btn-ghost btn-circle btn-sm"
            aria-label="Back to profile"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold font-heading">
              {profile?.name || "Connections"}
            </h1>
            <p className="text-xs text-base-content/45">{count} {type}</p>
          </div>
        </div>

        <nav className="grid grid-cols-2" aria-label="Profile connections">
          {["followers", "following"].map((tab) => (
            <Link
              key={tab}
              to={`/profile/${id}/${tab}`}
              className={`relative py-3 text-center text-sm font-semibold capitalize transition-colors ${
                type === tab ? "text-base-content" : "text-base-content/45 hover:text-base-content/70"
              }`}
            >
              {tab}
              {type === tab && <span className="absolute inset-x-5 bottom-0 h-0.5 rounded-full bg-primary" />}
            </Link>
          ))}
        </nav>
      </header>

      <div className="p-3 sm:p-5">
        <label className="input input-bordered flex h-11 w-full items-center gap-2 rounded-xl bg-base-200/55">
          <Search className="h-4 w-4 text-base-content/40" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="grow"
            placeholder={`Search ${type}`}
            aria-label={`Search ${type}`}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="btn btn-ghost btn-circle btn-xs" aria-label="Clear search">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>

        <div className="mt-3">
          {loading ? (
            <ConnectionSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Users className="h-10 w-10 text-base-content/20" />
              <p className="mt-3 text-sm text-base-content/60">{error}</p>
              <button type="button" onClick={loadConnections} className="btn btn-primary btn-sm mt-4">Try again</button>
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Users className="h-11 w-11 text-base-content/20" />
              <p className="mt-3 text-sm font-medium text-base-content/55">
                {query ? `No ${type} match “${query.trim()}”.` : type === "followers" ? "No followers yet." : "Not following anyone yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-base-200">
              {filteredConnections.map((person) => {
                const isSelf = person._id === currentUser?._id;
                const isFollowing = followingIds.has(person._id);
                const pending = pendingIds.has(person._id);
                return (
                  <div key={person._id} className="flex items-center gap-3 py-3">
                    <Link to={`/profile/${person._id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <UserAvatar user={person} size={48} showBadges showPresence={false} />
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <p className="truncate text-sm font-semibold">{person.name}</p>
                          <VerifiedBadge verifiedStatus={person.verifiedStatus} />
                          <UserSignalBadge user={person} />
                        </div>
                        <p className="truncate text-xs text-base-content/45">
                          {getUserRoleLabel(person)}{person.institutionName ? ` · ${person.institutionName}` : ""}
                        </p>
                      </div>
                    </Link>
                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => handleFollow(person._id)}
                        disabled={pending}
                        className={`btn btn-sm min-w-[92px] rounded-lg ${isFollowing ? "btn-outline" : "btn-primary"}`}
                      >
                        {pending ? <span className="loading loading-spinner loading-xs" /> : !isFollowing && <UserPlus className="h-3.5 w-3.5" />}
                        {pending ? "" : isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConnectionSkeleton = () => (
  <div className="space-y-1" aria-label="Loading connections">
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <div key={item} className="flex items-center gap-3 py-3">
        <div className="skeleton h-12 w-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2"><div className="skeleton h-3.5 w-36" /><div className="skeleton h-3 w-24" /></div>
        <div className="skeleton h-8 w-20 rounded-lg" />
      </div>
    ))}
  </div>
);

export default ProfileConnections;

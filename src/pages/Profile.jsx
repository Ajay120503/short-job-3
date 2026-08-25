import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  UserPlus,
  MessageCircle,
  MapPin,
  Mail,
  Edit3,
  Grid3X3,
  Briefcase,
  Heart,
  MessageCircle as CommentIcon,
  Bookmark,
  Trash2,
  MoreHorizontal,
  Users,
  X,
  Building2,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import API from "../utils/axios";
import { getUserRoleLabel, getActiveBadges } from "../utils/badgeUtils";
import BadgeChip from "../components/common/BadgeChip";
import toast from "react-hot-toast";
import ConfirmModal from "../components/common/ConfirmModal";
import StrengthMeter from "../components/profile/StrengthMeter";
import VerifiedBadge from "../components/common/VerifiedBadge";
import CareerTimeline from "../components/profile/CareerTimeline";
import EndorsementTag from "../components/profile/EndorsementTag";
import UserAvatar from "../components/common/UserAvatar";
import UserSignalBadge from "../components/common/UserSignalBadge";
import { getUserSignal } from "../utils/userSignals";
import { getSpecialUserStyle } from "../utils/specialUserStyles";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [userJobs, setUserJobs] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  const isOwnProfile = currentUser?._id === id;

  const fetchFollowers = useCallback(async () => {
    setLoadingFollowers(true);
    try {
      const { data } = await API.get(`/users/${id}/followers`);
      setFollowersList(data.followers || []);
    } catch {
      /* silently fail */
    } finally {
      setLoadingFollowers(false);
    }
  }, [id]);

  const fetchFollowing = useCallback(async () => {
    setLoadingFollowing(true);
    try {
      const { data } = await API.get(`/users/${id}/following`);
      setFollowingList(data.following || []);
    } catch {
      /* silently fail */
    } finally {
      setLoadingFollowing(false);
    }
  }, [id]);

  const handleOpenFollowers = () => {
    setShowFollowersModal(true);
    fetchFollowers();
  };

  const handleOpenFollowing = () => {
    setShowFollowingModal(true);
    fetchFollowing();
  };

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await API.get(`/users/${id}`);
      setProfile(data.user);
    } catch {
      toast.error("User not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUserPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const { data } = await API.get(`/users/${id}/posts`);
      setUserPosts(data.posts || []);
    } catch {
      /* silently fail */
    } finally {
      setPostsLoading(false);
    }
  }, [id]);

  const fetchUserJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const { data } = await API.get(`/users/${id}/jobs`);
      setUserJobs(data.jobs || []);
    } catch {
      /* silently fail */
    } finally {
      setJobsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
    fetchUserJobs();
  }, [id, fetchProfile, fetchUserPosts, fetchUserJobs]);

  const handleFollow = async () => {
    try {
      const { data } = await API.post(`/users/${id}/follow`);
      setProfile((prev) => ({
        ...prev,
        followers: data.isFollowing
          ? [...(prev.followers || []), currentUser._id]
          : (prev.followers || []).filter((f) => f !== currentUser._id),
        followersCount: data.followersCount,
      }));
      toast.success(data.isFollowing ? "Following!" : "Unfollowed");
    } catch {
      toast.error("Failed to update follow status");
    }
  };

  const handleLikePost = async (postId, idx) => {
    try {
      const { data } = await API.post(`/posts/${postId}/like`);
      setUserPosts((prev) =>
        prev.map((p, i) =>
          i === idx
            ? {
                ...p,
                likes: data.likesCount !== undefined ? [] : p.likes,
                isLiked: data.isLiked,
                likesCount: data.likesCount,
                _likesCount: data.likesCount,
              }
            : p
        )
      );
    } catch {
      toast.error("Failed to like post");
    }
  };

  const handleSavePost = async (postId, idx) => {
    try {
      const { data } = await API.post(`/posts/${postId}/save`);
      setUserPosts((prev) =>
        prev.map((p, i) =>
          i === idx ? { ...p, saves: data.saves, isSaved: data.saved } : p
        )
      );
      toast.success(data.saved ? "Post saved!" : "Post unsaved");
    } catch {
      toast.error("Failed to save post");
    }
  };

  const [postToDelete, setPostToDelete] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);

  const handleDeletePost = async (postId) => {
    try {
      await API.delete(`/posts/${postId}`);
      setUserPosts((prev) => prev.filter((p) => p._id !== postId));
      setPostToDelete(null);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await API.delete(`/jobs/${jobId}`);
      setUserJobs((prev) => prev.filter((j) => j._id !== jobId));
      setJobToDelete(null);
      toast.success("Job deleted");
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const timeAgo = useCallback((dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          <div className="w-24 h-24 md:w-36 md:h-36 rounded-full skeleton shrink-0"></div>
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="h-6 w-40 skeleton rounded mx-auto md:mx-0"></div>
            <div className="h-4 w-60 skeleton rounded mx-auto md:mx-0"></div>
            <div className="h-4 w-32 skeleton rounded mx-auto md:mx-0"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-20">
        <h2 className="text-xl font-semibold text-base-content/40">
          User not found
        </h2>
      </div>
    );
  }

  const isFollowing = profile.followers?.includes(currentUser?._id);
  const followerCount = profile.followers?.length || 0;
  const followingCount = profile.following?.length || 0;
  const profileSignal = getUserSignal(profile);
  const isSpecialProfile = Boolean(profileSignal);
  const specialStyle = getSpecialUserStyle(profile);
  const mutedTextClass = isSpecialProfile ? specialStyle.muted : "text-base-content/50";

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
      {/* ============ PROFILE HEADER ============ */}
      <div
        className={`overflow-hidden rounded-xl border shadow-sm mb-5 md:mb-6 ${
          isSpecialProfile
            ? specialStyle.shell
            : "bg-base-100 border-base-300/50"
        }`}
      >
        <div
          className={`h-20 md:h-24 ${
            isSpecialProfile ? specialStyle.soft : "bg-primary/10"
          }`}
        />
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 px-4 pb-4 md:px-6 md:pb-6 -mt-12 md:-mt-14">
        {/* Avatar */}
        <div className="shrink-0">
          <UserAvatar
            user={profile}
            size={104}
            className="md:hidden"
            showBadges
            ringClass={isSpecialProfile ? specialStyle.ring : "ring-4 ring-base-100"}
          />
          <UserAvatar
            user={profile}
            size={144}
            className="hidden md:block"
            showBadges
            ringClass={isSpecialProfile ? specialStyle.ring : "ring-2 ring-base-300/50"}
          />
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left min-w-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4 mb-4">
            <h1 className="text-xl md:text-2xl font-bold font-heading flex items-center justify-center md:justify-start gap-2 flex-wrap min-w-0">
              {profile.name}
              <VerifiedBadge verifiedStatus={profile.verifiedStatus} />
              <UserSignalBadge user={profile} size="sm" />
            </h1>

            {/* Action buttons */}
            {!isOwnProfile ? (
              <div className="grid grid-cols-2 gap-2 md:flex md:justify-start">
                <button
                  onClick={handleFollow}
                  className={`btn btn-active btn-sm gap-1.5 font-medium ${
                    isFollowing
                      ? "btn-outline"
                      : "btn-primary shadow-md shadow-primary/20"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <Link
                  to={`/chat/${profile._id}`}
                  className="btn btn-active btn-outline btn-sm gap-1.5 font-medium"
                >
                  <MessageCircle className="w-4 h-4" /> Message
                </Link>
              </div>
            ) : (
              <Link
                to="/edit-profile"
                className="btn btn-active btn-outline btn-sm gap-1.5 font-medium md:shrink-0"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4 max-w-md mx-auto md:mx-0">
            <div className={`rounded-xl border px-3 py-2 text-center ${isSpecialProfile ? specialStyle.soft : "bg-base-200/55 border-base-300/50"}`}>
              <span className="block font-bold">{userPosts.length}</span>
              <span className={`text-xs ${mutedTextClass}`}>posts</span>
            </div>
            <button
              onClick={handleOpenFollowers}
              className={`rounded-xl border px-3 py-2 text-center hover:opacity-80 transition-opacity ${isSpecialProfile ? specialStyle.soft : "bg-base-200/55 border-base-300/50"}`}
              title="View followers"
            >
              <span className="block font-bold">{followerCount}</span>
              <span className={`text-xs ${mutedTextClass}`}>followers</span>
            </button>
            <button
              onClick={handleOpenFollowing}
              className={`rounded-xl border px-3 py-2 text-center hover:opacity-80 transition-opacity ${isSpecialProfile ? specialStyle.soft : "bg-base-200/55 border-base-300/50"}`}
              title="View following"
            >
              <span className="block font-bold">{followingCount}</span>
              <span className={`text-xs ${mutedTextClass}`}>following</span>
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mb-2">
            {getActiveBadges(profile)
              .slice(0, 4)
              .map((badge) => (
                <BadgeChip
                  key={badge._id || badge.type}
                  badgeType={badge.type}
                  size="sm"
                />
              ))}
            {getActiveBadges(profile).length === 0 && (
              <span className="badge badge-sm badge-soft badge-primary font-medium">
                {getUserRoleLabel(profile)}
              </span>
            )}
            {profile.institutionName && (
              <span
                className={`badge badge-sm font-medium ${isSpecialProfile ? specialStyle.soft : "badge-ghost"}`}
              >
                {profile.institutionName}
              </span>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p
              className={`mx-auto max-w-2xl text-sm leading-relaxed md:mx-0 ${isSpecialProfile ? "text-base-content/75" : "text-base-content/70"}`}
            >
              {profile.bio}
            </p>
          )}

          {(profile.isCurrentlyWorking ||
            profile.currentPosition ||
            profile.currentCompany ||
            profile.previousWork) && (
            <div
              className={`mt-3 mx-auto max-w-2xl rounded-xl border p-3 text-left md:mx-0 ${isSpecialProfile ? specialStyle.soft : "bg-base-200/60 border-base-300/50"}`}
            >
              {(profile.currentPosition || profile.currentCompany) && (
                <div className="flex items-start gap-2 text-sm">
                  <Briefcase
                    className={`w-4 h-4 mt-0.5 shrink-0 ${isSpecialProfile ? specialStyle.icon : "text-primary"}`}
                  />
                  <div>
                    <p className="font-semibold">
                      {profile.currentPosition || "Currently working"}
                    </p>
                    {profile.currentCompany && (
                      <p
                        className={`text-xs flex items-center gap-1 mt-0.5 ${mutedTextClass}`}
                      >
                        <Building2 className="w-3 h-3" />
                        {profile.currentCompany}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {profile.previousWork && (
                <div
                  className={`mt-2 text-xs leading-relaxed ${isSpecialProfile ? "text-base-content/65" : "text-base-content/60"}`}
                >
                  <span
                    className={`font-semibold ${isSpecialProfile ? "text-base-content/80" : "text-base-content/70"}`}
                  >
                    Previous work:
                  </span>{" "}
                  {profile.previousWork}
                </div>
              )}
            </div>
          )}

          {/* Skills with Endorsements */}
          {profile.skills?.length > 0 && (
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mt-2">
              {profile.skills.map((skill, idx) => (
                <EndorsementTag key={idx} skill={skill} profileId={id} />
              ))}
            </div>
          )}

          {/* Location / Contact */}
          {(profile.city || profile.email) && (
            <div className={`flex flex-wrap justify-center md:justify-start gap-3 mt-2 text-xs ${isSpecialProfile ? "text-base-content/55" : "text-base-content/40"}`}>
              {profile.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {profile.city}
                  {profile.state ? `, ${profile.state}` : ""}
                </span>
              )}
              {profile.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {profile.email}
                </span>
              )}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Strength Meter (own profile only) */}
      {isOwnProfile && <StrengthMeter user={profile} />}

      {/* Career Timeline */}
      <CareerTimeline
        timeline={profile.timeline}
        isOwner={isOwnProfile}
        userId={profile._id}
        onUpdated={(timeline, updatedUser) => {
          setProfile((prev) => ({ ...prev, ...(updatedUser || {}), timeline }));
          if (isOwnProfile && updatedUser) {
            setUser({ ...currentUser, ...updatedUser });
          }
        }}
      />

      {/* ============ TAB BAR ============ */}
      <div className="sticky top-[57px] z-10 flex rounded-xl border border-base-300/70 bg-base-100/95 backdrop-blur-md shadow-sm mb-3 overflow-hidden md:static">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
            activeTab === "posts"
              ? "bg-primary/10 text-primary"
              : "text-base-content/45 hover:bg-base-200/70 hover:text-base-content/70"
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
          <span className="hidden sm:inline">POSTS</span>
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
            activeTab === "jobs"
              ? "bg-primary/10 text-primary"
              : "text-base-content/45 hover:bg-base-200/70 hover:text-base-content/70"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span className="hidden sm:inline">JOBS</span>
        </button>
      </div>

      {/* ============ POSTS TAB (Instagram-style grid) ============ */}
      {activeTab === "posts" && (
        <div>
          {postsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-base-200 skeleton rounded-sm"
                ></div>
              ))}
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
                <Grid3X3 className="w-8 h-8 text-base-content/20" />
              </div>
              <h3 className="text-lg font-semibold text-base-content/40 mb-1">
                No Posts Yet
              </h3>
              <p className="text-sm text-base-content/30">
                {isOwnProfile
                  ? "Share your first post with the community!"
                  : "This user hasn't posted anything yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
              {userPosts.map((post, idx) => {
                const hasImages = post.images && post.images.length > 0;
                const firstImage = hasImages
                  ? post.images[0]?.url || post.images[0]
                  : null;
                const isPostLiked =
                  post.isLiked ??
                  post.likes?.some(
                    (l) =>
                      l === currentUser?._id || l?._id === currentUser?._id,
                  );
                const isPostSaved =
                  post.isSaved ??
                  post.saves?.some(
                    (s) =>
                      s === currentUser?._id || s?._id === currentUser?._id,
                  );
                const likesCount =
                  post._likesCount ??
                  post.likesCount ??
                  post.likes?.length ??
                  0;
                const commentsCount =
                  post.commentsCount ?? post.comments?.length ?? 0;

                return (
                  <div key={post._id} className="group relative cursor-pointer">
                    {isOwnProfile &&
                      post.status &&
                      post.status !== "approved" && (
                        <span
                          className={`absolute left-1.5 top-1.5 z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ${
                            post.status === "pending_review"
                              ? "bg-warning text-warning-content"
                              : "bg-error text-error-content"
                          }`}
                        >
                          {post.status === "pending_review"
                            ? "Under Review"
                            : "Not Approved"}
                        </span>
                      )}
                    {/* Clickable overlay to navigate to post detail */}
                    <div
                      onClick={() => navigate(`/post/${post._id}`)}
                      className="aspect-square bg-base-200 overflow-hidden rounded-sm"
                    >
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/5 flex items-center justify-center p-4">
                          <p className="text-xs text-base-content/50 text-center line-clamp-3">
                            {post.text || "No caption"}
                          </p>
                        </div>
                      )}

                      {/* Hover overlay (desktop only) */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-6 text-white">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Heart
                            className={`w-5 h-5 ${
                              isPostLiked ? "fill-white" : ""
                            }`}
                          />
                          {likesCount}
                        </span>
                        <span className="flex items-center gap-1.5 font-semibold">
                          <CommentIcon className="w-5 h-5" />
                          {commentsCount}
                        </span>
                      </div>
                    </div>

                    {/* Post actions bar (visible on mobile, shown below grid item) */}
                    <div className="md:hidden flex items-center gap-3 px-1 py-1.5 text-xs text-base-content/50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikePost(post._id, idx);
                        }}
                        className={`flex items-center gap-1 ${
                          isPostLiked ? "text-error" : ""
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isPostLiked ? "fill-error" : ""
                          }`}
                        />
                        {likesCount}
                      </button>
                      <span className="flex items-center gap-1">
                        <CommentIcon className="w-3.5 h-3.5" />
                        {commentsCount}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSavePost(post._id, idx);
                        }}
                        className={`ml-auto ${
                          isPostSaved ? "text-primary" : ""
                        }`}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            isPostSaved ? "fill-primary" : ""
                          }`}
                        />
                      </button>
                      {isOwnProfile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPostToDelete(post);
                          }}
                          className="text-error"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Desktop-only: quick action dropdown on hover */}
                    {isOwnProfile && (
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                        <div className="dropdown dropdown-end">
                          <button
                            tabIndex={0}
                            className="btn btn-xs btn-circle btn-ghost bg-black/30 text-white border-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </button>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu p-1 shadow bg-base-100 rounded-box w-36 z-10 text-xs"
                          >
                            <li>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPostToDelete(post);
                                }}
                                className="text-error"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============ JOBS TAB ============ */}
      {activeTab === "jobs" && (
        <div>
          {jobsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-base-200 skeleton rounded-lg"
                ></div>
              ))}
            </div>
          ) : userJobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-base-content/20" />
              </div>
              <h3 className="text-lg font-semibold text-base-content/40 mb-1">
                No Job Postings
              </h3>
              <p className="text-sm text-base-content/30">
                {isOwnProfile
                  ? "Post your first job opening!"
                  : "This user hasn't posted any jobs yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userJobs.map((job) => (
                <div
                  key={job._id}
                  className={`rounded-xl border p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-4 cursor-pointer ${
                    isSpecialProfile
                      ? specialStyle.shell
                      : "bg-base-100 border-base-300/60 hover:border-primary/25"
                  }`}
                  onClick={() => navigate(`/jobs/${job._id}`)}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Institution Logo */}
                        <div className="w-12 h-12 rounded-xl bg-placeholder overflow-hidden flex-shrink-0 flex items-center justify-center ring-1 ring-base-300/60">
                          {job.institutionLogo?.url ? (
                            <img
                              src={job.institutionLogo.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Briefcase className="w-5 h-5 text-base-content/40" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base line-clamp-1">
                            {job.title}
                          </h4>
                          <p
                            className={`text-xs line-clamp-1 ${mutedTextClass}`}
                          >
                            {job.institutionName}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {job.isPaid ? (
                              <span className="badge badge-xs badge-success badge-soft">
                                Paid
                                {job.stipend > 0 &&
                                  ` · ${job.currency === "USD" ? "$" : "₹"}${
                                    job.stipend
                                  }`}
                              </span>
                            ) : (
                              <span className="badge badge-xs badge-ghost">
                                Volunteer
                              </span>
                            )}
                            <span className="badge badge-xs badge-outline capitalize">
                              {job.location}
                            </span>
                            <span className="badge badge-xs badge-outline capitalize">
                              {job.roleType}
                            </span>
                            {isOwnProfile &&
                              job.status &&
                              job.status !== "approved" && (
                                <span
                                  className={`badge badge-xs font-medium ${
                                    job.status === "pending_review"
                                      ? "badge-warning badge-soft"
                                      : "badge-error badge-soft"
                                  }`}
                                >
                                  {job.status === "pending_review"
                                    ? "Under Review"
                                    : "Not Approved"}
                                </span>
                              )}
                            <span className="badge badge-xs badge-ghost">
                              {job.applicants?.length || 0} applicant
                              {(job.applicants?.length || 0) !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions for own profile */}
                      {isOwnProfile && (
                        <div
                          className="dropdown dropdown-end flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            tabIndex={0}
                            className="btn btn-ghost btn-xs btn-circle"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu p-1 shadow bg-base-100 rounded-box w-36 z-10 text-xs"
                          >
                            <li>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/jobs/${job._id}/applicants`);
                                }}
                              >
                                View Applicants
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setJobToDelete(job);
                                }}
                                className="text-error"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Time + Deadline */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-base-300/50 pt-3 text-xs text-base-content/45">
                      <span className="rounded-full bg-base-200/60 px-2 py-1">{timeAgo(job.createdAt)}</span>
                      <span className="rounded-full bg-base-200/60 px-2 py-1">
                        Deadline:{" "}
                        {new Date(job.deadline).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ FOLLOWERS MODAL ============ */}
      {showFollowersModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowFollowersModal(false)}
        >
          <div
            className="bg-base-100 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-base-200 shrink-0">
              <h3 className="font-bold font-heading text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Followers
                <span className="text-sm font-normal text-base-content/40">
                  ({followerCount})
                </span>
              </h3>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="btn btn-ghost btn-circle btn-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {loadingFollowers ? (
                <div className="space-y-3 p-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full skeleton"></div>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-28 skeleton rounded"></div>
                        <div className="h-2.5 w-16 skeleton rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : followersList.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-base-content/20 mx-auto mb-3" />
                  <p className="text-sm text-base-content/40 font-medium">
                    No followers yet
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {followersList.map((follower) => (
                    <Link
                      key={follower._id}
                      to={`/profile/${follower._id}`}
                      onClick={() => setShowFollowersModal(false)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200 transition-colors"
                    >
                      <UserAvatar user={follower} size={40} showBadges />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {follower.name}
                        </p>
                        <p className="text-xs text-base-content/50 capitalize">
                          {getUserRoleLabel(follower)}
                          {follower.institutionName
                            ? ` · ${follower.institutionName}`
                            : ""}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE POST CONFIRM MODAL ============ */}
      <ConfirmModal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={() => handleDeletePost(postToDelete?._id)}
        title="Delete this post?"
        message="This action cannot be undone. The post and all its comments will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* ============ DELETE JOB CONFIRM MODAL ============ */}
      <ConfirmModal
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={() => handleDeleteJob(jobToDelete?._id)}
        title="Delete this job posting?"
        message="This action cannot be undone. All applications for this job will also be removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* ============ FOLLOWING MODAL ============ */}
      {showFollowingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowFollowingModal(false)}
        >
          <div
            className="bg-base-100 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-base-200 shrink-0">
              <h3 className="font-bold font-heading text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Following
                <span className="text-sm font-normal text-base-content/40">
                  ({followingCount})
                </span>
              </h3>
              <button
                onClick={() => setShowFollowingModal(false)}
                className="btn btn-ghost btn-circle btn-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {loadingFollowing ? (
                <div className="space-y-3 p-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full skeleton"></div>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-28 skeleton rounded"></div>
                        <div className="h-2.5 w-16 skeleton rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : followingList.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-base-content/20 mx-auto mb-3" />
                  <p className="text-sm text-base-content/40 font-medium">
                    Not following anyone yet
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {followingList.map((followed) => (
                    <Link
                      key={followed._id}
                      to={`/profile/${followed._id}`}
                      onClick={() => setShowFollowingModal(false)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200 transition-colors"
                    >
                      <UserAvatar user={followed} size={40} showBadges />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {followed.name}
                        </p>
                        <p className="text-xs text-base-content/50 capitalize">
                          {getUserRoleLabel(followed)}
                          {followed.institutionName
                            ? ` · ${followed.institutionName}`
                            : ""}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

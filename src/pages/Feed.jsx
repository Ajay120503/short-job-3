import { useState, useEffect, useCallback } from "react";
import { Link as RouterLink, useNavigate, Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  PlusCircle,
  Image as ImageIcon,
  Send,
  X,
  MoreHorizontal,
  Edit3,
  Trash2,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import API from "../utils/axios";
import { getUserRoleLabel } from "../utils/badgeUtils";
import StoryBar from "../components/post/StoryBar";
import LinkedJobCard from "../components/job/LinkedJobCard";
import ConfirmModal from "../components/common/ConfirmModal";
import UserAvatar from "../components/common/UserAvatar";
import UserSignalBadge from "../components/common/UserSignalBadge";
import {
  canUseSpecialStyle,
  getSpecialUserStyle,
} from "../utils/specialUserStyles";
import toast from "../utils/toast";

const CommentItem = ({
  comment,
  user,
  onLike,
  onReply,
  onDelete,
  depth = 0,
}) => {
  const liked = comment.likes?.includes(user?._id);
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-2.5">
      <div className="group flex items-start gap-2.5 sm:gap-3">
        <div className="shrink-0 pt-0.5">
          <UserAvatar user={comment.author} size={depth > 0 ? 30 : 36} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="max-w-full rounded-2xl rounded-tl-md border border-base-300/60 bg-base-200/45 px-3.5 py-2.5 sm:px-4">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-xs font-bold text-base-content/85">
                {comment.author?.name || "Unknown"}
              </p>
              <span className="flex-shrink-0 text-[9px] text-base-content/35 sm:text-[10px]">
                {timeAgo(comment.createdAt)}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-base-content/80">
              {comment.text}
            </p>
          </div>
          <div className="mt-1 flex min-h-6 items-center gap-1 px-1">
            <button
              type="button"
              onClick={() => onLike(comment._id)}
              className={`inline-flex h-6 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold transition-colors ${
                liked ? "bg-error/10 text-error" : "text-base-content/40 hover:bg-error/10 hover:text-error"
              }`}
            >
              <Heart className={`w-3 h-3 ${liked ? "fill-current" : ""}`} />
              {comment.likes?.length > 0 ? comment.likes.length : "Like"}
            </button>
            {depth < 2 && (
              <button
                type="button"
                onClick={() => onReply(comment.author?.name)}
                className="h-6 rounded-lg px-2 text-[11px] font-semibold text-base-content/40 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                Reply
              </button>
            )}
            {comment.author?._id === user?._id && (
              <button
                type="button"
                onClick={() => onDelete(comment._id)}
                className="ml-auto h-6 rounded-lg px-2 text-[11px] font-semibold text-base-content/35 transition-colors hover:bg-error/10 hover:text-error sm:opacity-0 sm:group-hover:opacity-100"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies?.length > 0 && (
        <div className="ml-4 space-y-2.5 border-l border-primary/20 pl-3 sm:ml-7 sm:pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              user={user}
              onLike={onLike}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const countCommentThread = (items = []) =>
  items.reduce(
    (total, comment) => total + 1 + countCommentThread(comment.replies || []),
    0,
  );

const Feed = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comment modal state
  const [commentPost, setCommentPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);

  // Delete post confirmation
  const [postToDelete, setPostToDelete] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await API.get("/posts");
      setPosts(data.posts || []);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Like / Unlike
  const handleLike = async (postId) => {
    try {
      await API.post(`/posts/${postId}/like`);
      const { data } = await API.get(`/posts/${postId}`);
      setPosts((prev) => prev.map((p) => (p._id === postId ? data.post : p)));
    } catch {
      /* ignore */
    }
  };

  // Save / Unsave
  const handleSave = async (postId) => {
    try {
      await API.post(`/posts/${postId}/save`);
      const { data } = await API.get(`/posts/${postId}`);
      setPosts((prev) => prev.map((p) => (p._id === postId ? data.post : p)));
      toast.success("Post saved!");
    } catch {
      /* ignore */
    }
  };

  // Share - copy link
  const handleShare = (postId) => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copied to clipboard!"),
      () => toast.error("Failed to copy link")
    );
  };

  const handleVote = async (postId, optionIndex) => {
    try {
      await API.post(`/posts/${postId}/vote`, { optionIndex });
      const { data } = await API.get(`/posts/${postId}`);
      setPosts((items) => items.map((item) => item._id === postId ? data.post : item));
    } catch (error) { toast.error(error.response?.data?.message || "Could not vote"); }
  };

  const handleRsvp = async (postId) => {
    try {
      await API.post(`/posts/${postId}/rsvp`);
      const { data } = await API.get(`/posts/${postId}`);
      setPosts((items) => items.map((item) => item._id === postId ? data.post : item));
    } catch (error) { toast.error(error.response?.data?.message || "Could not update RSVP"); }
  };

  // Open comment modal
  const openComments = async (post) => {
    setCommentPost(post);
    setReplyTo(null);
    setCommentText("");
    setLoadingComments(true);
    try {
      const { data } = await API.get(`/posts/${post._id}/comments`);
      setComments(data.comments || []);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!commentText.trim() || !commentPost) return;
    try {
      const endpoint = replyTo
        ? `/comments/${replyTo}/reply`
        : `/posts/${commentPost._id}/comments`;
      await API.post(endpoint, { text: commentText });
      setCommentText("");
      setReplyTo(null);
      // Refresh comments
      const { data } = await API.get(`/posts/${commentPost._id}/comments`);
      setComments(data.comments || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    }
  };

  // Like comment
  const handleLikeComment = async (commentId) => {
    try {
      await API.post(`/comments/${commentId}/like`);
      if (commentPost) {
        const { data } = await API.get(`/posts/${commentPost._id}/comments`);
        setComments(data.comments || []);
      }
    } catch {
      /* ignore */
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await API.delete(`/comments/${commentId}`);
      if (commentPost) {
        const { data } = await API.get(`/posts/${commentPost._id}/comments`);
        setComments(data.comments || []);
      }
      toast.success("Comment deleted");
    } catch {
      toast.error("Cannot delete this comment");
    }
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    try {
      await API.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setPostToDelete(null);
      toast.success("Post deleted");
    } catch {
      toast.error("Cannot delete this post");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
        <div className="h-10 w-32 skeleton mb-6"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card border border-base-300/50 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full skeleton"></div>
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-28 skeleton rounded"></div>
                <div className="h-2.5 w-16 skeleton rounded"></div>
              </div>
            </div>
            <div className="h-24 skeleton rounded-xl"></div>
            <div className="flex gap-4">
              <div className="h-8 w-16 skeleton rounded-lg"></div>
              <div className="h-8 w-16 skeleton rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
      {/* Story Bar */}
      <StoryBar onAddStory={() => navigate("/stories/create")} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Feed</h1>
          <p className="text-sm text-base-content/40 mt-0.5">
            Latest public updates
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm gap-2 md:hidden shadow-lg shadow-primary/20"
          onClick={() => navigate("/posts/create")}
        >
          <PlusCircle className="w-4 h-4" /> New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 px-6">
          <div className="w-20 h-20 bg-base-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <ImageIcon className="w-10 h-10 text-base-content/20" />
          </div>
          <h3 className="text-xl font-semibold text-base-content/40 mb-2">
            No posts yet
          </h3>
          <p className="text-sm text-base-content/30 max-w-sm mx-auto">
            Public posts will appear here after review.
          </p>
          <button
            className="btn btn-primary btn-sm mt-6 shadow-lg shadow-primary/20"
            onClick={() => navigate("/posts/create")}
          >
            <PlusCircle className="w-4 h-4" /> Create Your First Post
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => {
            const isLiked =
              post.likes?.includes(user?._id) ||
              post.likes?.some((l) => l === user?._id || l?._id === user?._id);
            const isSaved =
              post.saves?.includes(user?._id) ||
              post.saves?.some((s) => s === user?._id || s?._id === user?._id);
            const isSpecialPost = canUseSpecialStyle(post.author);
            const specialStyle = getSpecialUserStyle(post.author);

            return (
              <div
                key={post._id}
                className={`card border shadow-sm hover:shadow-md transition-shadow ${
                  isSpecialPost
                    ? `${specialStyle.shell} ${specialStyle.shellHover}`
                    : "bg-base-100 border-base-300/50"
                }`}
              >
                <div className="card-body p-5">
                  {/* Author Row */}
                  <div className="flex items-center justify-between mb-4">
                    <RouterLink
                      to={`/profile/${post.author?._id}`}
                      className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                    >
                      <UserAvatar user={post.author} size={44} />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold text-sm truncate ${
                            isSpecialPost ? specialStyle.muted : ""
                          }`}
                        >
                          {post.author?.name}
                        </p>
                        <div
                          className={`flex items-center gap-2 text-xs ${
                            isSpecialPost
                              ? "text-base-content/55"
                              : "text-base-content/40"
                          }`}
                        >
                          <span className="capitalize line-clamp-1 max-w-23">
                            {getUserRoleLabel(post.author)}
                          </span>
                          <UserSignalBadge user={post.author} />
                          <span>·</span>
                          <span className="line-clamp-1">
                            {new Date(post.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                          </span>
                        </div>
                      </div>
                    </RouterLink>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {post.author?._id === user?._id &&
                        post.status &&
                        post.status !== "approved" && (
                          <span
                            className={`badge badge-sm font-medium text-xs px-2.5 py-1 ${
                              post.status === "pending_review"
                                ? "badge-warning badge-soft"
                                : "badge-error badge-soft"
                            }`}
                          >
                            {post.status === "pending_review"
                              ? "Under Review"
                              : "Not Approved"}
                          </span>
                        )}
                      {post.type && post.type !== "general" && (
                        <span
                          className={`badge badge-sm font-medium text-xs px-2.5 py-1 ${
                            post.type === "noticeboard"
                              ? "badge-warning badge-soft"
                              : post.type === "achievement"
                                ? "badge-success badge-soft"
                                : post.type === "announcement"
                                  ? "badge-info badge-soft"
                                  : "badge-primary badge-soft"
                          }`}
                        >
                          {post.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Text */}
                  {post.text && (
                    <p className="text-sm leading-relaxed mb-4 whitespace-pre-line">
                      {post.text}
                    </p>
                  )}

                  {/* Linked Job Card */}
                  {post.jobPost && <LinkedJobCard job={post.jobPost} />}

                  {post.type === "poll" && (
                    <div className="mb-4 space-y-2">
                      {post.pollOptions?.map((option, index) => {
                        const total = post.pollOptions.reduce(
                          (sum, item) => sum + (item.votes?.length || 0),
                          0,
                        );
                        const percent = total
                          ? Math.round(
                              ((option.votes?.length || 0) * 100) / total,
                            )
                          : 0;
                        const voted = option.votes?.includes(user?._id);
                        return (
                          <button
                            key={option._id || index}
                            onClick={() => handleVote(post._id, index)}
                            className={`relative w-full overflow-hidden rounded-lg border p-2 text-left text-sm ${voted ? "border-primary" : "border-base-300"}`}
                          >
                            <span
                              className="absolute inset-y-0 left-0 bg-primary/10"
                              style={{ width: `${percent}%` }}
                            />
                            <span className="relative flex justify-between">
                              <span>{option.text}</span>
                              <span>{percent}%</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {post.type === "event" && (
                    <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
                      <p className="font-semibold">
                        {new Date(post.eventDetails?.date).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                      <p className="text-base-content/60">
                        {post.eventDetails?.location}
                      </p>
                      <button
                        className="btn btn-primary btn-xs mt-2"
                        onClick={() => handleRsvp(post._id)}
                      >
                        {post.eventDetails?.rsvps?.includes(user?._id)
                          ? "Going"
                          : "RSVP"}{" "}
                        · {post.eventDetails?.rsvps?.length || 0}
                      </button>
                    </div>
                  )}
                  {post.type === "resource_share" && (
                    <a
                      href={post.resourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm mb-4"
                    >
                      Open resource
                    </a>
                  )}

                  {/* Images */}
                  {post.images?.length > 0 && (
                    <div
                      className={`grid gap-2 mb-4 ${
                        post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                      }`}
                    >
                      {post.images.map((img, i) => {
                        const imageUrl = img?.url || img;
                        return (
                          <a
                            key={i}
                            href={imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`group flex w-full items-center justify-center overflow-hidden rounded-2xl border border-base-300/60 bg-base-200/60 ${
                              post.images.length === 1
                                ? "min-h-56 max-h-[520px] sm:min-h-72"
                                : "aspect-square"
                            }`}
                          >
                            <img
                              src={imageUrl}
                              alt={`Post attachment ${i + 1}`}
                              className="h-full max-h-[520px] w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                              loading="lazy"
                            />
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex gap-1.5 mb-4 flex-wrap">
                      {post.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="badge badge-sm badge-ghost text-xs font-medium hover:badge-primary transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-3 border-t border-base-200/60">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`btn btn-ghost btn-sm gap-2 font-medium text-xs hover:bg-error/10 ${
                        isLiked ? "text-error" : ""
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform ${
                          isLiked ? "fill-current scale-110" : ""
                        }`}
                      />
                      {post.likes?.length || 0}
                    </button>
                    <button
                      onClick={() => openComments(post)}
                      className="btn btn-ghost btn-sm gap-2 font-medium text-xs hover:bg-primary/10"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {post.comments?.length || 0}
                    </button>
                    <div className="dropdown dropdown-end ml-auto">
                      <button
                        tabIndex={0}
                        type="button"
                        className="btn btn-ghost btn-sm btn-circle"
                        aria-label="Post actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu z-20 mt-1 w-44 rounded-box border border-base-300 bg-base-100 p-1.5 text-xs shadow-xl"
                      >
                        <li>
                          <button onClick={() => handleShare(post._id)}>
                            <Share2 className="w-3.5 h-3.5" />
                            Copy Link
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleSave(post._id)}
                            className={isSaved ? "text-primary" : ""}
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${
                                isSaved ? "fill-current" : ""
                              }`}
                            />
                            {isSaved ? "Unsave" : "Save"}
                          </button>
                        </li>
                        {post.author?._id === user?._id && (
                          <>
                            <li>
                              <Link to={`/post/${post._id}/edit`}>
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </Link>
                            </li>
                            <li>
                              <button
                                onClick={() => setPostToDelete(post)}
                                className="text-error"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Post Confirm Modal */}
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

      {/* Comment Modal */}
      {commentPost && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 backdrop-blur-[2px] md:items-center md:p-5"
          onClick={() => setCommentPost(null)}
          role="presentation"
        >
          <div
            className="flex h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-base-300/70 bg-base-100 shadow-2xl md:h-[min(76dvh,680px)] md:max-w-2xl md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="comments-title"
          >
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-base-content/15 md:hidden" />
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-base-200/80 px-4 py-3.5 sm:px-5 md:py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 id="comments-title" className="font-heading text-lg font-bold leading-tight">
                    Comments
                  </h3>
                  {countCommentThread(comments) > 0 && (
                    <span className="badge badge-sm border-base-300 bg-base-200/60 font-semibold">
                      {countCommentThread(comments)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-base-content/45 mt-0.5">
                  Join the conversation on this post
                </p>
              </div>
              <button
                onClick={() => setCommentPost(null)}
                className="btn btn-ghost btn-circle btn-sm hover:bg-base-200"
                aria-label="Close comments"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain bg-base-100 px-3 py-4 sm:px-5 md:py-5">
              {loadingComments ? (
                <div className="text-center py-12">
                  <span className="loading loading-spinner loading-md text-primary"></span>
                  <p className="text-xs text-base-content/40 mt-2">
                    Loading comments...
                  </p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-base-content/20" />
                  </div>
                  <p className="text-sm text-base-content/40 font-medium">
                    No comments yet
                  </p>
                  <p className="text-xs text-base-content/30 mt-1">
                    Be the first to share your thoughts!
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    user={user}
                    onLike={handleLikeComment}
                    onReply={(authorName) => {
                      setReplyTo(comment._id);
                      setCommentText(`@${authorName} `);
                    }}
                    onDelete={handleDeleteComment}
                  />
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="shrink-0 border-t border-base-200/80 bg-base-100 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-4 md:pb-4">
              {replyTo && (
                <div className="flex items-center justify-between mb-2.5 text-xs bg-primary/5 rounded-lg px-3 py-1.5">
                  <span className="text-primary flex items-center gap-1.5">
                    <MessageCircle className="w-3 h-3" />
                    Replying to a comment
                  </span>
                  <button
                    onClick={() => {
                      setReplyTo(null);
                      setCommentText("");
                    }}
                    className="btn btn-ghost btn-xs text-base-content/40 hover:text-error"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddComment();
                }}
                className="flex items-end gap-2 rounded-2xl border border-base-300/70 bg-base-200/35 p-1.5 shadow-sm transition-all focus-within:border-primary/45 focus-within:bg-base-100 focus-within:ring-2 focus-within:ring-primary/10 sm:p-2"
              >
                <div className="hidden shrink-0 pb-1 sm:block"><UserAvatar user={user} size={32} /></div>
                <textarea
                  rows={1}
                  className="max-h-28 min-h-10 min-w-0 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-base-content/35"
                  placeholder={
                    replyTo ? "Write a reply..." : "Write a comment..."
                  }
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-circle btn-sm mb-0.5 flex-shrink-0 shadow-sm"
                  disabled={!commentText.trim()}
                  aria-label={replyTo ? "Send reply" : "Post comment"}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;

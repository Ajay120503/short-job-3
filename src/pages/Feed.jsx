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
} from "lucide-react";
import useAuthStore from "../store/authStore";
import API from "../utils/axios";
import { getUserRoleLabel } from "../utils/badgeUtils";
import StoryBar from "../components/post/StoryBar";
import LinkedJobCard from "../components/job/LinkedJobCard";
import ConfirmModal from "../components/common/ConfirmModal";
import UserAvatar from "../components/common/UserAvatar";
import UserSignalBadge from "../components/common/UserSignalBadge";
import toast from "react-hot-toast";

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
    <div className="space-y-3">
      <div className="flex gap-3 group">
        <UserAvatar user={comment.author} size={32} />
        <div className="flex-1 min-w-0">
          <div className="bg-base-200/80 rounded-2xl px-4 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-base-content/80">
                {comment.author?.name || "Unknown"}
              </p>
              <span className="text-[10px] text-base-content/30 flex-shrink-0">
                {timeAgo(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm mt-0.5 leading-relaxed">{comment.text}</p>
          </div>
          <div className="flex items-center gap-4 mt-1.5 px-1">
            <button
              onClick={() => onLike(comment._id)}
              className={`text-[11px] font-medium transition-colors ${
                liked ? "text-error" : "text-base-content/30 hover:text-error"
              }`}
            >
              <span className="flex items-center gap-1">
                <Heart className={`w-3 h-3 ${liked ? "fill-current" : ""}`} />
                {comment.likes?.length > 0 && comment.likes.length}
              </span>
            </button>
            {depth < 2 && (
              <button
                onClick={() => onReply(comment.author?.name)}
                className="text-[11px] font-medium text-base-content/30 hover:text-primary transition-colors"
              >
                Reply
              </button>
            )}
            {comment.author?._id === user?._id && (
              <button
                onClick={() => onDelete(comment._id)}
                className="text-[11px] font-medium text-base-content/30 hover:text-error transition-colors ml-auto opacity-0 group-hover:opacity-100"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies?.length > 0 && (
        <div className="ml-6 pl-4 border-l-2 border-primary/10 space-y-3">
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
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
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
    <div className="max-w-2xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
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

            return (
              <div
                key={post._id}
                className="card bg-base-100 border border-base-300/50 shadow-sm hover:shadow-md transition-shadow"
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
                        <p className="font-semibold text-sm truncate">
                          {post.author?.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-base-content/40">
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

                  {/* Images */}
                  {post.images?.length > 0 && (
                    <div
                      className={`grid gap-1.5 mb-4 rounded-2xl overflow-hidden ${
                        post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                      }`}
                    >
                      {post.images.map((img, i) => (
                        <img
                          key={i}
                          src={img.url}
                          alt=""
                          className={`w-full object-cover ${
                            post.images.length === 1
                              ? "max-h-96 rounded-2xl"
                              : "max-h-64 first:rounded-l-2xl last:rounded-r-2xl"
                          }`}
                          loading="lazy"
                        />
                      ))}
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
                    <button
                      onClick={() => handleShare(post._id)}
                      className="btn btn-ghost btn-sm btn-circle"
                      title="Copy link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSave(post._id)}
                      className={`btn btn-ghost btn-sm ml-auto gap-2 font-medium text-xs hover:bg-primary/10 ${
                        isSaved ? "text-primary" : ""
                      }`}
                    >
                      <Bookmark
                        className={`w-4 h-4 transition-transform ${
                          isSaved ? "fill-current scale-110" : ""
                        }`}
                      />
                    </button>
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4"
          onClick={() => setCommentPost(null)}
        >
          <div
            className="bg-base-100 md:rounded-2xl w-full h-full md:h-auto md:max-h-[85vh] max-w-lg flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-base-200 shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold font-heading text-lg">Comments</h3>
                {comments.length > 0 && (
                  <span className="badge badge-sm badge-ghost">
                    {comments.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setCommentPost(null)}
                className="btn btn-ghost btn-circle btn-sm hover:bg-base-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
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
            <div className="p-4 border-t border-base-200 bg-base-100 shrink-0">
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
                className="flex items-center gap-2"
              >
                <UserAvatar user={user} size={32} />
                <input
                  type="text"
                  className="input input-bordered flex-1 input-sm text-sm rounded-full"
                  placeholder={
                    replyTo ? "Write a reply..." : "Write a comment..."
                  }
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-circle btn-sm flex-shrink-0"
                  disabled={!commentText.trim()}
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

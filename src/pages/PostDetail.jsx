import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Send,
  ArrowLeft,
  Trash2,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import API from "../utils/axios";
import { getUserRoleLabel } from "../utils/badgeUtils";
import useAuthStore from "../store/authStore";
import ConfirmModal from "../components/common/ConfirmModal";
import LinkedJobCard from "../components/job/LinkedJobCard";
import UserAvatar from "../components/common/UserAvatar";
import UserSignalBadge from "../components/common/UserSignalBadge";
import {
  canUseSpecialStyle,
  getSpecialUserStyle,
} from "../utils/specialUserStyles";
import toast from "react-hot-toast";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [addingComment, setAddingComment] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      const { data } = await API.get(`/posts/${id}`);
      setPost(data.post);
    } catch {
      toast.error("Post not found.");
      navigate("/feed", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchComments = useCallback(async () => {
    try {
      const { data } = await API.get(`/posts/${id}/comments`);
      setComments(data.comments || []);
    } catch {
      // Silently fail - comments section will show empty state
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  const handleLike = async () => {
    if (!user) return;
    try {
      const { data } = await API.post(`/posts/${id}/like`);
      setPost((prev) => ({
        ...prev,
        likes: data.likes,
        isLiked: data.liked,
      }));
    } catch {
      toast.error("Failed to like");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const { data } = await API.post(`/posts/${id}/save`);
      setPost((prev) => ({
        ...prev,
        saves: data.saves,
        isSaved: data.saved,
      }));
      toast.success(data.saved ? "Post saved!" : "Post unsaved");
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${id}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copied to clipboard!"),
      () => toast.error("Failed to copy link")
    );
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    try {
      await API.delete(`/posts/${id}`);
      toast.success("Post deleted");
      navigate("/feed", { replace: true });
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setAddingComment(true);
    try {
      const endpoint = replyTo
        ? `/comments/${replyTo}/reply`
        : `/posts/${id}/comments`;
      await API.post(endpoint, { text: commentText });
      setCommentText("");
      setReplyTo(null);
      fetchComments();
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
        <div className="h-8 w-32 skeleton rounded mb-6"></div>
        <div className="card border p-5 space-y-4">
          <div className="h-5 w-3/4 skeleton rounded"></div>
          <div className="h-4 w-full skeleton rounded"></div>
          <div className="h-4 w-1/2 skeleton rounded"></div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const postAuthor = post.author || post.user || post.postedBy || {};
  const isOwner = user && postAuthor._id === user._id;
  const isLiked = post.likes?.includes(user?._id) || post.isLiked;
  const isSaved = post.saves?.includes(user?._id) || post.isSaved;
  const isSpecialPost = canUseSpecialStyle(postAuthor);
  const specialStyle = getSpecialUserStyle(postAuthor);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost btn-sm mb-4 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Post Card */}
      <div
        className={`card border shadow-sm p-5 mb-6 ${
          isSpecialPost
            ? specialStyle.shell
            : "bg-base-100 border-base-300/50"
        }`}
      >
        {/* Author */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate(`/profile/${postAuthor._id}`)}
          >
            <UserAvatar user={postAuthor} size={40} />
            <div>
              <p className={`font-semibold text-sm ${isSpecialPost ? specialStyle.muted : ""}`}>
                {postAuthor.name}
              </p>
              <div
                className={`flex flex-wrap items-center gap-1.5 text-xs ${
                  isSpecialPost ? "text-base-content/60" : "text-base-content/50"
                }`}
              >
                <span>{getUserRoleLabel(postAuthor)}</span>
                <UserSignalBadge user={postAuthor} />
                {postAuthor.institutionName && (
                  <>
                    <span>·</span>
                    <span>{postAuthor.institutionName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="dropdown dropdown-end">
              <button className="btn btn-ghost btn-sm btn-circle">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 z-10">
                <li>
                  <Link to={`/post/${id}/edit`} className="text-base-content">
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <p
            className={`text-sm whitespace-pre-wrap leading-relaxed ${
              isSpecialPost ? "text-base-content/80" : ""
            }`}
          >
            {post.text}
          </p>
        </div>

        {/* Linked Job Card */}
        {post.jobPost && <LinkedJobCard job={post.jobPost} />}

        {/* Images */}
        {post.images?.length > 0 && (
          <div
            className={`grid gap-2 mb-4 ${
              post.images.length === 1
                ? "grid-cols-1"
                : post.images.length === 2
                ? "grid-cols-2"
                : "grid-cols-2"
            }`}
          >
            {post.images.map((img, idx) => (
              <img
                key={idx}
                src={img.url || img}
                alt={`Post ${idx + 1}`}
                className="rounded-lg object-cover w-full max-h-72"
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-base-content/40 mb-4">
          {new Date(post.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-1 border-t border-base-200 pt-3">
          <button
            onClick={handleLike}
            className={`btn btn-ghost btn-sm gap-1.5 ${
              isLiked ? "text-error" : ""
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-error" : ""}`} />
            <span className="text-xs">{post.likes?.length || 0}</span>
          </button>
          <button className="btn btn-ghost btn-sm gap-1.5">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">
              {post.commentsCount || comments.length}
            </span>
          </button>
          <button
            onClick={handleShare}
            className="btn btn-ghost btn-sm gap-1.5"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            className={`btn btn-ghost btn-sm ml-auto ${
              isSaved ? "text-primary" : ""
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-bold text-base">
            Comments
            <span className="ml-2 text-sm font-normal text-base-content/40">
              ({comments.length})
            </span>
          </h3>
        </div>

        {/* Add comment */}
        <div className="flex gap-3 mb-6 bg-base-200/50 rounded-2xl p-3">
          <UserAvatar user={user} size={36} />
          <div className="flex-1">
            {replyTo && (
              <div className="text-xs text-base-content/50 mb-2 flex items-center gap-1 bg-base-200 rounded-lg px-2 py-1">
                Replying to a comment
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-error hover:underline ml-auto"
                >
                  Cancel
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                className="input input-bordered input-sm flex-1 text-sm rounded-full focus:outline-none focus:border-primary/50"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                className="btn btn-primary btn-sm btn-circle"
                disabled={!commentText.trim() || addingComment}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-10 bg-base-200/30 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-base-300/50 flex items-center justify-center mx-auto mb-3">
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
          <div className="space-y-3">
            {comments.map((comment) => {
              const commentAuthor = comment.author || comment.user || {};
              return (
                <div key={comment._id} className="group">
                  <div className="flex gap-3">
                    <UserAvatar user={commentAuthor} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="bg-base-200/60 rounded-2xl rounded-tl-sm px-4 py-2.5">
                        <p className="text-xs font-semibold mb-0.5">
                          {commentAuthor.name || "Unknown"}
                        </p>
                        <p className="text-sm leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 px-1">
                        <span className="text-[10px] text-base-content/40">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                        <button
                          onClick={() => {
                            setReplyTo(comment._id);
                            setCommentText(`@${commentAuthor.name} `);
                          }}
                          className="text-[11px] text-base-content/40 hover:text-primary font-medium transition-colors"
                        >
                          Reply
                        </button>
                      </div>

                      {/* Replies */}
                      {comment.replies?.length > 0 && (
                        <div className="ml-6 mt-2 pl-4 border-l-2 border-primary/10 space-y-2">
                          {comment.replies.map((reply) => {
                            const replyAuthor =
                              reply.author || reply.user || {};
                            return (
                              <div key={reply._id} className="flex gap-2">
                                <UserAvatar user={replyAuthor} size={24} />
                                <div className="bg-base-200/40 rounded-xl px-3 py-1.5 flex-1 min-w-0">
                                  <p className="text-[11px] font-semibold mb-0.5">
                                    {replyAuthor.name || "Unknown"}
                                  </p>
                                  <p className="text-xs">{reply.text}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Post Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete this post?"
        message="This action cannot be undone. The post and all its comments will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default PostDetail;

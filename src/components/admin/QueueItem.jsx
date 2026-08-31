import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Briefcase,
  FileText,
  Image,
  Users,
  Eye,
} from "lucide-react";
import BadgeChip from "../common/BadgeChip";
import API from "../../utils/axios";
import toast from "react-hot-toast";

const formatFlag = (flag) => {
  if (!flag) return "Unknown signal";
  if (typeof flag === "string") return flag.replace(/_/g, " ");
  return (flag.flag || flag.rule || flag.message || "moderation signal").replace(/_/g, " ");
};

/**
 * Reusable admin content moderation queue item.
 *
 * @param {object} item - The content item (post, job, or story)
 * @param {string} type - The content type ('post', 'job', 'story')
 * @param {function} onUpdate - Callback to refresh parent data after actions
 */
const QueueItem = ({ item, type, onUpdate, mode = "queue" }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const isArchive = mode === "archive" || item.status === "rejected";

  const handleModerate = async (action) => {
    setActionLoading(true);
    try {
      const endpoint = `/admin/content/${type}/${item._id}/${action}`;
      const body =
        action === "reject"
          ? { notes: "Content does not meet community guidelines" }
          : {};

      const { data } = await API.put(endpoint, body);
      if (data.success !== false) {
        toast.success(
          action === "approve" ? "Content approved!" : "Content rejected",
        );
        onUpdate?.();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Moderation action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const author = item.author || item.postedBy || {};
  const authorName = author.name || "Unknown";
  const authorEmail = author.email || "";
  const authorBadge = author.badges?.[0]?.type || "student";
  const previewText =
    item.preview ||
    item.text ||
    item.content ||
    item.description ||
    item.title ||
    "No text content";
  const title =
    item.title ||
    (type === "story"
      ? "Story review"
      : item.type
      ? `${item.type} post`
      : "Post review");
  const mediaUrl =
    item.image?.url ||
    item.images?.[0]?.url ||
    (typeof item.images?.[0] === "string" ? item.images[0] : "");
  const autoFlags = item.moderationMeta?.autoFlags || [];
  const autoScore = item.moderationMeta?.autoScore;
  const autoDecision = item.moderationMeta?.autoDecision;
  const autoSeverity = item.moderationMeta?.autoSeverity;
  const scoreTone =
    autoSeverity === "critical" || autoDecision === "reject" || autoScore >= 62
      ? "badge-error badge-soft"
      : autoSeverity === "medium" || autoDecision === "review" || autoScore >= 34
        ? "badge-warning badge-soft"
        : "badge-success badge-soft";
  const TypeIcon =
    type === "job" ? Briefcase : type === "story" ? Image : FileText;

  return (
    <div className="card bg-base-200/30 border border-base-300 rounded-xl p-3 sm:p-5 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Author info */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
            {author.profilePic?.url ? (
              <img
                src={author.profilePic.url}
                alt={authorName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <Users className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{authorName}</div>
            <div className="text-xs text-base-content/50 truncate">{authorEmail}</div>
            <div className="mt-1">
              <BadgeChip badgeType={authorBadge} size="sm" />
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="text-xs text-base-content/50 flex items-center gap-1 sm:justify-end">
          <Calendar className="w-3 h-3" />
          {formatDate(item.createdAt)}
        </div>
      </div>

      {/* Content preview */}
      <div className="grid gap-3 sm:grid-cols-[96px_minmax(0,1fr)]">
        <div className="w-full h-24 rounded-lg bg-base-200 border border-base-300/60 overflow-hidden flex items-center justify-center">
          {mediaUrl ? (
            <img
              src={mediaUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <TypeIcon className="w-8 h-8 text-base-content/25" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-sm badge-primary badge-soft capitalize">
              {type}
            </span>
            <span className="badge badge-sm badge-warning badge-soft">
              {item.status || "pending_review"}
            </span>
          </div>
          <h3 className="font-semibold text-sm line-clamp-1">{title}</h3>
          <p className="text-sm text-base-content/70 mt-1 line-clamp-3">
            {previewText.substring(0, 180)}
            {previewText.length > 180 && "..."}
          </p>
          {item.moderationMeta?.adminWindowExpiredAt && (
            <p className="text-[11px] text-base-content/40 mt-2">
              Review window ends {formatDate(item.moderationMeta.adminWindowExpiredAt)}
            </p>
          )}
          {autoScore !== undefined && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className={`badge badge-xs ${scoreTone}`}>
                Rule score {autoScore}
              </span>
              {autoDecision && (
                <span className={`badge badge-xs capitalize ${scoreTone}`}>
                  {autoDecision}
                </span>
              )}
              {autoFlags.slice(0, 3).map((flag, i) => (
                <span
                  key={i}
                  className={`badge badge-xs ${
                    flag?.severity === "critical"
                      ? "badge-error badge-soft"
                      : flag?.severity === "high"
                        ? "badge-warning badge-soft"
                        : "badge-neutral badge-soft"
                  }`}
                >
                  {formatFlag(flag)}
                </span>
              ))}
              {autoFlags.length > 3 && (
                <span className="text-[11px] text-base-content/40">
                  +{autoFlags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Detection rules (if any) */}
        {item.detectionRules?.length > 0 && (
          <div className="sm:col-span-2 mt-1 flex flex-wrap gap-1.5">
            {item.detectionRules.map((rule, i) => (
              <span
                key={i}
                className="badge badge-xs badge-warning badge-soft gap-1"
              >
                <AlertTriangle className="w-3 h-3" />
                {rule.rule}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-3 border-t border-base-300/50 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={`/admin/content/${type}/${item._id}`}
          className="btn btn-ghost btn-xs gap-1.5 justify-start sm:justify-center"
        >
          <Eye className="w-3 h-3" />
          Review Detail
        </Link>

        <div className={`grid gap-2 sm:flex ${isArchive ? "grid-cols-1" : "grid-cols-2"}`}>
          {!isArchive && (
            <button
              onClick={() => handleModerate("reject")}
              className="btn btn-outline btn-error btn-sm"
              disabled={actionLoading}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </button>
          )}
          <button
            onClick={() => handleModerate("approve")}
            className="btn btn-primary btn-sm"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueItem;

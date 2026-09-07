import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Shield,
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  AlertTriangle,
  FileText,
  ScanText,
  Clock3,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { isAdminUser } from "../../utils/badgeUtils";
import BadgeChip from "../../components/common/BadgeChip";
import API from "../../utils/axios";
import { getJobMapLink, getJobWorkModeLabel, getJobWorkplaceLabel } from "../../utils/jobLocation";
import toast from "../../utils/toast";
import {
  getJobDateTimeLabel,
  getJobDurationLabel,
  getShortJobTypeLabel,
} from "../../utils/jobSchedule";

const splitQualifications = (value = "") =>
  value
    .split(/\n|•|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);

const formatFlag = (flag) => {
  if (!flag) return "Unknown signal";
  if (typeof flag === "string") return flag.replace(/_/g, " ");
  return (flag.flag || flag.rule || flag.message || "moderation signal").replace(/_/g, " ");
};

const AdminContentDetail = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState("");

  // Initial fetch — inlined in effect to avoid setState-in-effect lint
  useEffect(() => {
    const load = async () => {
      if (!type || !id) return;
      setLoading(true);
      try {
        const { data } = await API.get(`/admin/content/${type}/${id}`);
        setContent(data.content || data.post || data.job || data.story);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch content");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type, id]);

  // Check admin access (after hooks)
  if (!isAuthenticated || !isAdminUser(currentUser)) {
    navigate("/feed");
    return null;
  }

  const handleModerate = async (action) => {
    setActionLoading(true);
    try {
      const endpoint = `/admin/content/${type}/${id}/${action}`;
      const body = action === "reject" ? { notes } : {};
      const { data } = await API.put(endpoint, body);
      toast.success(
        action === "approve"
          ? data.alreadyApproved
            ? "Content is already approved"
            : "Content approved and published"
          : data.alreadyRejected
            ? "Content is already rejected"
            : "Content rejected",
        { dedupeKey: `admin-moderation:${type}:${id}:${action}` },
      );
      navigate("/admin/queue");
    } catch (err) {
      toast.error(err.response?.data?.message || "Moderation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunRuleCheck = async () => {
    setActionLoading(true);
    try {
      const { data } = await API.put(`/admin/content/${type}/${id}/run-check`);
      setContent(data.content || content);
      toast.success(
        data.moderationResult?.approved
          ? "OCR and safety check completed"
          : "OCR and safety check found high-risk content",
        { dedupeKey: `rule-check:${type}:${id}:${data.moderationResult?.approved}` },
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Rule check failed");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-2 py-3 sm:px-4 md:p-6">
        <div className="space-y-4">
          <div className="h-8 w-48 skeleton rounded mb-4"></div>
          <div className="card bg-base-100 border border-base-300 rounded-xl p-6 space-y-4">
            <div className="h-6 w-3/4 skeleton rounded"></div>
            <div className="h-4 w-1/2 skeleton rounded"></div>
            <div className="h-4 w-1/3 skeleton rounded"></div>
            <div className="h-24 skeleton rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="mx-auto max-w-4xl px-2 py-20 text-center sm:px-4 md:p-6">
        <FileText className="w-12 h-12 text-base-content/20 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-base-content/40">
          Content not found
        </h2>
      </div>
    );
  }

  const author = content.author || content.postedBy;
  const authorBadge = author?.badges?.[0]?.type;
  const creatorName = author?.name || content.creatorDisplayName || "Account unavailable";
  const autoScore = content.moderationMeta?.autoScore;
  const autoFlags = content.moderationMeta?.autoFlags || [];
  const autoDecision = content.moderationMeta?.autoDecision;
  const autoSeverity = content.moderationMeta?.autoSeverity;
  const scoreTone =
    autoSeverity === "critical" || autoDecision === "reject" || autoScore >= 62
      ? "badge-error badge-soft"
      : autoSeverity === "medium" || autoDecision === "review" || autoScore >= 34
        ? "badge-warning badge-soft"
        : "badge-success badge-soft";

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-2 py-3 sm:px-4 md:space-y-6 md:p-6">
      {/* Header */}
      <div data-page-header className="rounded-xl border border-base-300/70 bg-base-100 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div data-page-heading-icon className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading sm:text-2xl">
                Content Review
              </h1>
              <p className="text-xs uppercase tracking-wide text-base-content/45">
                {type}
              </p>
            </div>
          </div>
          <Link to="/admin/queue" className="btn btn-ghost btn-sm gap-2 justify-start sm:justify-center">
            <ArrowLeft className="w-4 h-4" />
            Back to Queue
          </Link>
        </div>
      </div>

      {/* Content Card */}
      <div className="card bg-base-100 shadow-sm border border-base-300/60">
        <div className="card-body p-4 sm:p-6">
          {/* Author info */}
          <div className="flex items-center gap-3 mb-4 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
              {author?.profilePic?.url ? (
                <img
                  src={author.profilePic.url}
                  alt={author.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate">{creatorName}</div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/50">
                {authorBadge && <BadgeChip badgeType={authorBadge} size="sm" />}
                {content.creatorUnavailable && <span className="badge badge-ghost badge-sm">Creator account unavailable</span>}
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  Submitted {formatDate(content.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          {content.title && (
            <h2 className="text-xl font-bold mb-3">{content.title}</h2>
          )}

          {/* OCR evidence */}
          <div className="mb-4 rounded-xl border border-base-300 bg-base-200/35 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <ScanText className="h-4 w-4 text-primary" />
                  Image text (OCR)
                </h3>
                <p className="mt-1 text-xs text-base-content/50">
                  Text found inside uploaded images is included in the safety score.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`badge badge-sm capitalize ${
                  content.moderationMeta?.ocrStatus === "failed"
                    ? "badge-error badge-soft"
                    : content.moderationMeta?.ocrStatus === "partial"
                      ? "badge-warning badge-soft"
                      : "badge-primary badge-soft"
                }`}>
                  {(content.moderationMeta?.ocrStatus || "not scanned").replace(/_/g, " ")}
                </span>
                {Number.isFinite(content.moderationMeta?.ocrConfidence) && (
                  <span className="badge badge-sm badge-ghost">
                    {content.moderationMeta.ocrConfidence}% confidence
                  </span>
                )}
              </div>
            </div>
            {content.moderationMeta?.ocrText ? (
              <pre className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-base-300 bg-base-100 p-3 font-sans text-sm leading-relaxed text-base-content/75">
                {content.moderationMeta.ocrText}
              </pre>
            ) : (
              <p className="mt-3 text-sm text-base-content/50">
                {content.moderationMeta?.ocrStatus === "failed"
                  ? "The image could not be scanned. Run the check again to retry."
                  : content.moderationMeta?.ocrStatus === "completed"
                    ? "No readable text was found in the image."
                    : "Run OCR & Safety Check to scan this content."}
              </p>
            )}
            {content.moderationMeta?.ocrProcessedAt && (
              <p className="mt-2 text-xs text-base-content/45">
                Scanned {content.moderationMeta.ocrImageCount || 0} image(s) on {formatDate(content.moderationMeta.ocrProcessedAt)}
                {content.moderationMeta.ocrProcessingMs
                  ? ` in ${(content.moderationMeta.ocrProcessingMs / 1000).toFixed(1)}s`
                  : ""}
              </p>
            )}
          </div>

          {/* Detection rules */}
          {autoScore !== undefined && (
            <div className="mb-4 rounded-xl border border-base-300 bg-base-200/50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Rule-Based Moderation Result
                  </h3>
                  <p className="text-xs text-base-content/50 mt-1">
                    {content.moderationMeta?.reviewNotes ||
                      "Automatic safety checks were applied to this content."}
                  </p>
                  {content.moderationMeta?.autoReviewedAt && (
                    <p className="mt-1 text-xs text-base-content/40">
                      Safety check completed {formatDate(content.moderationMeta.autoReviewedAt)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <span className={`badge badge-lg ${scoreTone}`}>
                    Score {autoScore}/100
                  </span>
                  {autoDecision && (
                    <span className={`badge badge-lg capitalize ${scoreTone}`}>
                      {autoDecision}
                    </span>
                  )}
                </div>
              </div>
              {autoFlags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {autoFlags.map((flag, i) => (
                    <span
                      key={i}
                      className={`badge badge-sm ${
                        flag?.severity === "critical"
                          ? "badge-error badge-soft"
                          : flag?.severity === "high"
                            ? "badge-warning badge-soft"
                            : "badge-neutral badge-soft"
                      }`}
                      title={
                        typeof flag === "object"
                          ? JSON.stringify(flag)
                          : String(flag)
                      }
                    >
                      {formatFlag(flag)}
                      {typeof flag === "object" && flag.weight
                        ? ` +${flag.weight}`
                        : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {content.detectionRules?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                Auto-Detection Rules Triggered
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {content.detectionRules.map((rule, i) => (
                  <span
                    key={i}
                    className="badge badge-xs badge-warning badge-soft"
                  >
                    {rule.rule || rule.message || String(rule)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content text */}
          {(content.text || content.content || content.description) && (
            <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-line mb-4">
              {content.text || content.content || content.description}
            </p>
          )}

          {/* Images */}
          {content.image?.url && (
            <div className="mb-4 rounded-xl border border-base-300 bg-base-200/60 p-2">
              {content.mediaType === "video" ? (
                <video src={content.image.url} controls className="w-full max-h-[420px] rounded-lg" />
              ) : (
                <img src={content.image.url} alt={content.title || "Content image"} className="w-full max-h-[420px] object-contain rounded-lg" />
              )}
            </div>
          )}

          {content.images?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {content.images.map((img, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-base-300 bg-base-200/60 p-2"
                >
                  <img
                    src={img?.url || img}
                    alt=""
                    className="w-full max-h-72 object-contain rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}

          {content.requiredQualifications && (
            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2">
                Qualifications
              </h3>
              <ul className="space-y-1.5 text-sm text-base-content/70">
                {splitQualifications(content.requiredQualifications).map(
                  (item, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {/* Tags */}
          {content.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {content.tags.map((tag, i) => (
                <span key={i} className="badge badge-sm badge-ghost text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Content metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-base-300/50">
            {content.roleType && (
              <div>
                <span className="text-xs text-base-content/50">
                  Opportunity Type
                </span>
                <p className="font-medium capitalize">{content.roleType}</p>
              </div>
            )}
            {content.shortJobType && (
              <div>
                <span className="text-xs text-base-content/50">Short Job Type</span>
                <p className="font-medium">{getShortJobTypeLabel(content)}</p>
              </div>
            )}
            {content.duration?.value && (
              <div>
                <span className="text-xs text-base-content/50">Duration</span>
                <p className="font-medium">{getJobDurationLabel(content)}</p>
              </div>
            )}
            {content.jobDate && (
              <div>
                <span className="text-xs text-base-content/50">Daily working time</span>
                <p className="font-medium">{getJobDateTimeLabel(content)}</p>
              </div>
            )}
            {content.location && (
              <div>
                <span className="text-xs text-base-content/50">Work Mode</span>
                <p className="font-medium">{getJobWorkModeLabel(content.location)}</p>
              </div>
            )}
            {(content.workplaceName ||
              content.workplaceAddress ||
              content.workplaceCity ||
              content.workplaceState ||
              content.workplaceCountry) && (
              <div>
                <span className="text-xs text-base-content/50">Workplace</span>
                <p className="font-medium">{getJobWorkplaceLabel(content)}</p>
              </div>
            )}
            {content.coordinates?.lat && content.coordinates?.lng && (
              <div>
                <span className="text-xs text-base-content/50">Map</span>
                <a
                  href={getJobMapLink(content)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  Open location
                </a>
              </div>
            )}
            {content.isPaid !== undefined && (
              <div>
                <span className="text-xs text-base-content/50">
                  Compensation
                </span>
                <p className="font-medium">
                  {content.currency || "INR"} {Number(content.stipend || 0).toLocaleString("en-IN")}
                </p>
              </div>
            )}
            {content.applicants?.length !== undefined && (
              <div>
                <span className="text-xs text-base-content/50">Applicants</span>
                <p className="font-medium">{content.applicants.length}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-base-content/50">Status</span>
              <p className="font-medium">
                {content.status || "pending_review"}
              </p>
            </div>
            <div>
              <span className="text-xs text-base-content/50">Submitted</span>
              <p className="font-medium">{formatDate(content.createdAt)}</p>
            </div>
            {content.updatedAt && content.updatedAt !== content.createdAt && (
              <div>
                <span className="text-xs text-base-content/50">Last updated</span>
                <p className="font-medium">{formatDate(content.updatedAt)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Moderation Actions */}
      <div className="card bg-base-100 shadow-sm border border-base-300/60">
        <div className="card-body p-4 sm:p-6">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Moderation Actions
          </h3>

          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={handleRunRuleCheck}
              disabled={actionLoading}
              className="btn btn-outline btn-warning w-full gap-2"
            >
              <ScanText className="w-5 h-5" />
              Run OCR &amp; Safety Check
            </button>

            <button
              onClick={() => handleModerate("approve")}
              disabled={actionLoading || content.status === "approved"}
              className="btn btn-success w-full gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {content.status === "approved" ? "Content Approved" : "Approve Content"}
            </button>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-medium">
                  Rejection Notes (optional)
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered textarea-sm w-full"
                rows={2}
                placeholder="Reason for rejection..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button
              onClick={() => handleModerate("reject")}
              disabled={actionLoading || content.status === "rejected"}
              className="btn btn-error w-full gap-2"
            >
              <XCircle className="w-5 h-5" />
              {content.status === "rejected" ? "Content Rejected" : "Reject Content"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContentDetail;

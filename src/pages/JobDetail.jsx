import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Mail,
  Users,
  Briefcase,
  Building2,
  ArrowLeft,
  Eye,
  Pencil,
  ExternalLink,
  Clock,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import API from "../utils/axios";
import toast from "../utils/toast";
import SkillGapBar from "../components/job/SkillGapBar";
// import QuickApplyBtn from "../components/job/QuickApplyBtn";
import ReachStats from "../components/job/ReachStats";
import JobQnA from "../components/job/JobQnA";
import { canApplyToJobs } from "../utils/badgeUtils";
import UserSignalBadge from "../components/common/UserSignalBadge";
import {
  canUseSpecialStyle,
  getSpecialUserStyle,
} from "../utils/specialUserStyles";
import {
  getJobMapEmbedUrl,
  getJobMapLink,
  getJobWorkModeLabel,
  getJobWorkplaceLabel,
} from "../utils/jobLocation";
import { normalizeJobSkills } from "../utils/jobSkills";
import {
  getJobScheduleLabel,
  getShortJobTypeLabel,
} from "../utils/jobSchedule";

const formatStipend = (stipend, currency, isPaid) => {
  if (!isPaid) return "Unpaid";
  const formatted = Number(stipend).toLocaleString();
  if (currency === "USD") return `$${formatted}`;
  return `₹${formatted}`;
};

const splitQualifications = (value = "") =>
  value
    .split(/\n|•|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);

const hasAppliedToJob = (job, userId) =>
  Boolean(
    userId &&
      job?.applicants?.some((applicant) => {
        const applicantId =
          typeof applicant === "string" ? applicant : applicant?._id;
        return applicantId === userId;
      })
  );

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await API.get(`/jobs/${id}`);
        setJob(data.job);
        setApplied(hasAppliedToJob(data.job, user?._id));
        // Increment view count silently
        API.patch(`/jobs/${id}/view`).catch(() => {});
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, user?._id]);

  const handleApply = async () => {
    try {
      await API.post(`/jobs/${id}/apply`, { coverLetter: "" });
      setApplied(true);
      setJob((prev) =>
        prev
          ? {
              ...prev,
              applicants: [...(prev.applicants || []), user?._id],
            }
          : prev
      );
      toast.success("Applied successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply");
    }
  };

  const isJobPoster = job?.postedBy?._id === user?._id;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
        <div className="h-6 w-24 skeleton rounded mb-4"></div>
        <div className="card border border-base-300/50 p-6 space-y-4">
          <div className="h-8 w-3/4 skeleton rounded"></div>
          <div className="h-4 w-1/2 skeleton rounded"></div>
          <div className="h-4 w-1/3 skeleton rounded"></div>
          <div className="h-24 skeleton rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center py-20">
        <Briefcase className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-base-content/40 mb-2">
          Job not found
        </h2>
        <Link to="/jobs" className="btn btn-primary btn-sm mt-4">
          Back to Jobs
        </Link>
      </div>
    );
  }

  const isSpecialJob = canUseSpecialStyle(job.postedBy);
  const specialStyle = getSpecialUserStyle(job.postedBy);
  const mapEmbedUrl = getJobMapEmbedUrl(job);
  const skillsRequired = normalizeJobSkills(job.skillsRequired);

  return (
    <div className="mx-auto max-w-3xl p-3 sm:p-4 md:p-6">
      {/* Back button */}
      <Link
        to="/jobs"
        className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      <article className="relative overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 shadow-sm">
        <div
          className={`h-1 w-full ${isSpecialJob ? specialStyle.marker : "bg-primary"}`}
        />
        <div className="p-4 sm:p-6 lg:p-7">
          {/* Job Image */}
          {(job.image?.url || job.institutionLogo?.url) && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-base-300/60 bg-base-200/40">
              <img
                src={job.image?.url || job.institutionLogo?.url}
                alt={job.title}
                className="aspect-[16/7] w-full object-cover"
              />
            </div>
          )}

          {/* Title & Institution */}
          <div className="mb-6 flex items-start gap-3 sm:gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 ${
                isSpecialJob ? specialStyle.soft : "bg-primary/10"
              }`}
            >
              <Briefcase
                className={`w-7 h-7 ${isSpecialJob ? specialStyle.icon : "text-primary"}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="mb-1 font-heading text-xl font-bold leading-tight text-base-content sm:text-2xl">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/55">
                <Building2 className="w-4 h-4" />
                <span>{job.institutionName || "Unknown Institution"}</span>
                <UserSignalBadge user={job.postedBy} />
              </div>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <div className="bg-base-200/50 rounded-xl p-3 text-center">
              <MapPin className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs font-medium capitalize">
                {getJobWorkModeLabel(job.location)}
              </p>
              <p className="text-[10px] text-base-content/40">Work mode</p>
            </div>
            <div className="bg-base-200/50 rounded-xl p-3 text-center">
              <p
                className={`text-xs font-medium ${
                  job.isPaid ? "text-success" : ""
                }`}
              >
                {formatStipend(job.stipend, job.currency, job.isPaid)}
              </p>
              <p className="text-[10px] text-base-content/40">
                {job.isPaid ? "Payout" : "Type"}
              </p>
            </div>
            <div className="bg-base-200/50 rounded-xl p-3 text-center">
              <Calendar className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-xs font-medium">
                {new Date(job.deadline).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="text-[10px] text-base-content/40">Deadline</p>
            </div>
            <div className="bg-base-200/50 rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs font-medium">
                {getJobScheduleLabel(job) || "Not specified"}
              </p>
              <p className="text-[10px] text-base-content/40">Working time</p>
            </div>
            <div className="bg-base-200/50 rounded-xl p-3 text-center">
              <Briefcase className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs font-medium">
                {job.duration?.value
                  ? `${job.duration.value} ${job.duration.unit}`
                  : "Not specified"}
              </p>
              <p className="text-[10px] text-base-content/40">Duration</p>
            </div>
            <div className="bg-base-200/50 rounded-xl p-3 text-center">
              <Eye className="w-4 h-4 text-secondary mx-auto mb-1" />
              <p className="text-xs font-medium">{job.viewCount || 0}</p>
              <p className="text-[10px] text-base-content/40">Views</p>
            </div>
          </div>

          {/* Workplace Location */}
          <section className="mb-6 rounded-2xl border border-base-300/60 bg-base-200/25 p-4 sm:p-5">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  Workplace
                </h3>
                <p className="mt-1 text-sm text-base-content/70 leading-relaxed">
                  {getJobWorkplaceLabel(job)}
                </p>
              </div>
              <a
                href={getJobMapLink(job)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-xs gap-1.5 self-start"
              >
                Open map
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            {mapEmbedUrl ? (
              <iframe
                title="Workplace map"
                src={mapEmbedUrl}
                className="h-56 w-full rounded-xl border border-base-300 bg-base-100"
                loading="lazy"
              />
            ) : (
              <div className="rounded-xl border border-dashed border-base-300 bg-base-100 p-4 text-xs text-base-content/45">
                Exact map coordinates were not added. Use the map link to search
                this workplace address.
              </div>
            )}
          </section>

          {/* Opportunity Type Badge */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="badge badge-sm badge-primary badge-soft capitalize">
              {getShortJobTypeLabel(job)}
            </span>
            {job.isPaid && (
              <span className="badge badge-sm badge-success badge-soft">
                Paid
              </span>
            )}
            {!job.isPaid && (
              <span className="badge badge-sm badge-ghost">Unpaid</span>
            )}
          </div>

          {/* Description */}
          <section className="mb-5 rounded-2xl border border-base-300/60 p-4 sm:p-5">
            <h2 className="mb-2 font-heading text-base font-bold">
              About this opportunity
            </h2>
            <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </section>

          {/* Skills */}
          {skillsRequired.length > 0 && (
            <section className="mb-5 rounded-2xl border border-base-300/60 p-4 sm:p-5">
              <h2 className="font-semibold text-sm mb-3">Skills</h2>
              <div className="flex gap-1.5 flex-wrap">
                {skillsRequired.map((s, i) => (
                  <span
                    key={i}
                    className="badge badge-sm line-clamp-1 badge-ghost text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Qualifications */}
          {job.requiredQualifications && (
            <section className="mb-5 rounded-2xl border border-base-300/60 p-4 sm:p-5">
              <h2 className="font-semibold text-sm mb-3">Qualifications</h2>
              <ul className="space-y-1.5 text-sm text-base-content/70">
                {splitQualifications(job.requiredQualifications).map(
                  (item, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </section>
          )}

          {/* Contact */}
          <div className="mb-5 flex min-w-0 items-center gap-2 rounded-xl border border-base-300/50 bg-base-200/35 p-3 text-sm text-base-content/60">
            <Mail className="w-4 h-4" />
            <span className="truncate">{job.contactEmail}</span>
          </div>

          {/* Owner actions */}
          {isJobPoster && (
            <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
              <Link
                to={`/jobs/${job._id}/edit`}
                className="btn btn-outline btn-primary gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit Job
              </Link>
              <Link
                to={`/jobs/${job._id}/applicants`}
                className="btn btn-primary gap-2"
              >
                <Users className="w-4 h-4" />
                View Applicants ({job.applicants?.length || 0})
              </Link>
            </div>
          )}

          {/* Skill Gap for applicants */}
          {canApplyToJobs(user) && <SkillGapBar job={job} />}

          {/* Reach stats for job poster */}
          <ReachStats job={job} isOwner={isJobPoster} />

          {/* Applicant actions */}
          {canApplyToJobs(user) && (
            <div className="flex gap-2 mt-6">
              {/* <QuickApplyBtn
              jobId={job._id}
              alreadyApplied={applied}
              onApplied={() => {
                setApplied(true);
                setJob((prev) =>
                  prev
                    ? {
                        ...prev,
                        applicants: [...(prev.applicants || []), user?._id],
                      }
                    : prev,
                );
              }}
            /> */}
              <button
                onClick={handleApply}
                className="btn btn-primary flex-1"
                disabled={applied}
              >
                {applied ? "Applied" : "Apply Now"}
              </button>
            </div>
          )}

          {/* Q&A Section */}
          <JobQnA jobId={job._id} isJobPoster={isJobPoster} />
        </div>
      </article>
    </div>
  );
};

export default JobDetail;

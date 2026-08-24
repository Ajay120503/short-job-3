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
} from "lucide-react";
import useAuthStore from "../store/authStore";
import API from "../utils/axios";
import toast from "react-hot-toast";
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

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      {/* Back button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      <div
        className={`card shadow-sm border p-6 ${
          isSpecialJob
            ? specialStyle.shell
            : "bg-base-100 border-base-300/50"
        }`}
      >
        {/* Job Image */}
        {(job.image?.url || job.institutionLogo?.url) && (
          <div className="mb-5 rounded-xl overflow-hidden bg-base-200 border border-base-300/50">
            <img
              src={job.image?.url || job.institutionLogo?.url}
              alt={job.title}
              className="w-full max-h-[420px] object-contain"
            />
          </div>
        )}

        {/* Title & Institution */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
              isSpecialJob ? specialStyle.soft : "bg-primary/10"
            }`}
          >
            <Briefcase className={`w-7 h-7 ${isSpecialJob ? specialStyle.icon : "text-primary"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className={`text-2xl font-bold font-heading mb-1 ${isSpecialJob ? specialStyle.muted : ""}`}>
              {job.title}
            </h1>
            <div
              className={`flex flex-wrap items-center gap-2 text-sm ${
                isSpecialJob ? "text-base-content/60" : "text-base-content/50"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{job.institutionName || "Unknown Institution"}</span>
              <UserSignalBadge user={job.postedBy} />
            </div>
          </div>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-base-200/50 rounded-xl p-3 text-center">
            <MapPin className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-xs font-medium capitalize">
              {job.location === "remote"
                ? "Remote"
                : job.location === "hybrid"
                  ? "Hybrid"
                  : "On-site"}
            </p>
            <p className="text-[10px] text-base-content/40">Location</p>
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
              {job.isPaid ? "Stipend" : "Type"}
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
            <Eye className="w-4 h-4 text-secondary mx-auto mb-1" />
            <p className="text-xs font-medium">{job.viewCount || 0}</p>
            <p className="text-[10px] text-base-content/40">Views</p>
          </div>
        </div>

        {/* Opportunity Type Badge */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="badge badge-sm badge-primary badge-soft capitalize">
            {job.roleType}
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
        <div className="mb-5">
          <h3 className="font-semibold text-sm mb-2">Description</h3>
          <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>

        {/* Skills */}
        {job.skillsRequired?.length > 0 && (
          <div className="mb-5">
            <h3 className="font-semibold text-sm mb-2">Skills Required</h3>
            <div className="flex gap-1.5 flex-wrap">
              {job.skillsRequired.map((s, i) => (
                <span
                  key={i}
                  className="badge badge-sm line-clamp-1 badge-ghost text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Qualifications */}
        {job.requiredQualifications && (
          <div className="mb-5">
            <h3 className="font-semibold text-sm mb-2">Qualifications</h3>
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
          </div>
        )}

        {/* Contact */}
        <div className="flex items-center gap-2 text-sm text-base-content/50 mb-5 p-3 bg-base-200/50 rounded-xl">
          <Mail className="w-4 h-4" />
          <span>{job.contactEmail}</span>
        </div>

        {/* Owner actions */}
        {isJobPoster && (
          <div className="mt-4 space-y-3">
            <Link
              to={`/jobs/${job._id}/edit`}
              className="btn btn-ghost w-full gap-2 border border-base-300"
            >
              <Pencil className="w-4 h-4" />
              Edit Job
            </Link>
            <Link
              to={`/jobs/${job._id}/applicants`}
              className="btn btn-primary w-full gap-2"
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
    </div>
  );
};

export default JobDetail;

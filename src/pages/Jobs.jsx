import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Clock, Plus } from "lucide-react";
import API from "../utils/axios";
import useAuthStore from "../store/authStore";
import { canCreateJobs } from "../utils/badgeUtils";
import MatchedJobsRow from "../components/job/MatchedJobsRow";
import QuickApplyBtn from "../components/job/QuickApplyBtn";
import UserSignalBadge from "../components/common/UserSignalBadge";
import { getUserSignal } from "../utils/userSignals";
import { getSpecialUserStyle } from "../utils/specialUserStyles";

const formatStipend = (stipend, currency, isPaid) => {
  if (!isPaid) return "Unpaid";
  const formatted = Number(stipend).toLocaleString();
  if (currency === "USD") return `$${formatted}`;
  return `₹${formatted}`;
};

const ROLE_TYPE_LABELS = {
  teacher: "Creator",
  professor: "Expert",
  assistant: "Assistant",
  research: "Research / Analysis",
  intern: "Internship",
  volunteer: "Volunteer",
  hod: "Team Leadership",
  principal: "Organization Leadership",
  other: "Other",
};

const hasAppliedToJob = (job, userId) =>
  Boolean(
    userId &&
      job?.applicants?.some((applicant) => {
        const applicantId =
          typeof applicant === "string" ? applicant : applicant?._id;
        return applicantId === userId;
      })
  );

const Jobs = () => {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const canPost = canCreateJobs(user);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await API.get("/jobs");
        setJobs(data.jobs || []);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
        <div className="h-10 w-32 skeleton mb-6"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card border border-base-300/50 p-5 space-y-3">
            <div className="h-5 w-3/4 skeleton rounded"></div>
            <div className="h-4 w-1/2 skeleton rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const filtered =
    filter === "all"
      ? jobs
      : jobs.filter((j) => j.isPaid === (filter === "paid"));

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <MatchedJobsRow />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Job Board</h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Find relevant opportunities
          </p>
        </div>
        <div className="flex gap-2">
          <div className="join">
            <button
              className={`btn btn-sm join-item ${
                filter === "all" ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`btn btn-sm join-item ${
                filter === "paid" ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setFilter("paid")}
            >
              Paid
            </button>
            <button
              className={`btn btn-sm join-item ${
                filter === "unpaid" ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setFilter("unpaid")}
            >
              Unpaid
            </button>
          </div>

          {canPost && (
            <Link to="/jobs/create" className="btn btn-primary btn-sm gap-1.5">
              <Plus className="w-4 h-4" />
              Post a Job
            </Link>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-base-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-10 h-10 text-base-content/20" />
          </div>
          <p className="text-base-content/40 font-medium mb-1">No jobs found</p>
          <p className="text-sm text-base-content/30">
            Try adjusting your filters or check back later
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const posterSignal = getUserSignal(job.postedBy);
            const isSpecialJob = Boolean(posterSignal);
            const specialStyle = getSpecialUserStyle(job.postedBy);

            return (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className={`card border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4 block ${
                  isSpecialJob
                    ? `${specialStyle.shell} ${specialStyle.shellHover}`
                    : "bg-base-100 border-base-300/50 hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Job image or institution logo */}
                  <div className="w-14 h-14 rounded-xl bg-placeholder overflow-hidden shrink-0">
                    {job.image?.url ? (
                      <img
                        src={job.image.url}
                        alt={job.title}
                        className="w-full h-full object-cover"
                      />
                    ) : job.institutionLogo?.url ? (
                      <img
                        src={job.institutionLogo.url}
                        alt={job.institutionName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <Briefcase className="w-6 h-6 text-primary/40" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold text-base mb-0.5 ${isSpecialJob ? specialStyle.muted : ""}`}
                        >
                          {job.title}
                        </h3>
                        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                          <p
                            className={`text-sm ${isSpecialJob ? "text-base-content/60" : "text-base-content/50"}`}
                          >
                            {job.institutionName || "Unknown Institution"}
                          </p>
                          <UserSignalBadge user={job.postedBy} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span
                            className={`flex items-center gap-1 ${isSpecialJob ? "text-base-content/60" : "text-base-content/50"}`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location === "remote"
                              ? "Remote"
                              : job.location === "hybrid"
                                ? "Hybrid"
                                : "On-site"}
                          </span>
                          <span
                            className={`flex items-center gap-1 font-medium ${
                              job.isPaid
                                ? "text-success"
                                : isSpecialJob
                                  ? "text-base-content/55"
                                  : "text-base-content/40"
                            }`}
                          >
                            {formatStipend(
                              job.stipend,
                              job.currency,
                              job.isPaid,
                            )}
                          </span>
                          <span
                            className={`flex items-center gap-1 ${isSpecialJob ? "text-base-content/55" : "text-base-content/40"}`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(job.deadline).toLocaleDateString(
                              "en-IN",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                          <span className="badge badge-xs badge-soft badge-primary font-medium">
                            {ROLE_TYPE_LABELS[job.roleType] || job.roleType || "Opportunity"}
                          </span>
                          {job.postedBy?._id === user?._id &&
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
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <QuickApplyBtn
                          jobId={job._id}
                          alreadyApplied={hasAppliedToJob(job, user?._id)}
                          onApplied={() =>
                            setJobs((prev) =>
                              prev.map((item) =>
                                item._id === job._id
                                  ? {
                                      ...item,
                                      applicants: [
                                        ...(item.applicants || []),
                                        user?._id,
                                      ],
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                        {job.applicants?.length > 0 && (
                          <span
                            className={`text-xs ${isSpecialJob ? "text-base-content/50" : "text-base-content/30"}`}
                          >
                            {job.applicants.length} applicant
                            {job.applicants.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Jobs;

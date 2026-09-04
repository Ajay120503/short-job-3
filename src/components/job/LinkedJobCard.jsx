import { Link } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  DollarSign,
  Users,
  ArrowRight,
} from "lucide-react";
import UserSignalBadge from "../common/UserSignalBadge";
import {
  canUseSpecialStyle,
  getSpecialUserStyle,
} from "../../utils/specialUserStyles";
import { getJobWorkModeLabel, getJobWorkplaceLabel } from "../../utils/jobLocation";
import { normalizeJobSkills } from "../../utils/jobSkills";
import { getJobDateTimeLabel } from "../../utils/jobSchedule";

const LinkedJobCard = ({ job }) => {
  if (!job) return null;

  const deadlinePassed = job.deadline && new Date(job.deadline) < new Date();
  const StipendIcon = job.currency === "USD" ? DollarSign : IndianRupee;
  const isSpecialJob = canUseSpecialStyle(job.postedBy);
  const specialStyle = getSpecialUserStyle(job.postedBy);
  const skillsRequired = normalizeJobSkills(job.skillsRequired);

  const formatStipend = () => {
    if (!job.isPaid || !job.stipend) return "Unpaid";
    const value = Number(job.stipend).toLocaleString("en-IN");
    return `${job.currency === "USD" ? "$" : "₹"}${value}`;
  };

  const formatDeadline = () => {
    if (!job.deadline) return "";
    return new Date(job.deadline).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link to={`/jobs/${job._id}`} className="block mb-4 group">
      <div
        className={`card border transition-colors overflow-hidden ${
          isSpecialJob
            ? `${specialStyle.shell} ${specialStyle.shellHover}`
            : "bg-base-200/70 border-base-300 hover:border-primary/50"
        }`}
      >
        <div className="card-body p-4">
          {/* Header Row */}
          <div className="flex items-start gap-3">
            {/* Logo / Icon */}
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
                isSpecialJob ? specialStyle.soft : "bg-primary/10"
              }`}
            >
              {job.institutionLogo?.url ? (
                <img
                  src={job.institutionLogo.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Briefcase className={`w-5 h-5 ${isSpecialJob ? specialStyle.icon : "text-primary"}`} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={`badge badge-xs line-clamp-1 font-semibold uppercase tracking-wide ${
                    isSpecialJob ? specialStyle.soft : "badge-primary badge-soft"
                  }`}
                >
                  Job Opening
                </span>
                {deadlinePassed && (
                  <span className="badge line-clamp-1 badge-xs badge-error badge-soft">
                    Deadline Passed
                  </span>
                )}
              </div>
              <h3
                className={`font-semibold text-sm leading-snug transition-colors line-clamp-1 ${isSpecialJob ? specialStyle.muted : "group-hover:text-primary"}`}
              >
                {job.title}
              </h3>
              <div className="flex items-center gap-1.5 min-w-0">
                <p
                  className={`text-xs line-clamp-1 ${isSpecialJob ? "text-base-content/60" : "text-base-content/50"}`}
                >
                  {job.institutionName || job.postedBy?.institutionName}
                </p>
                <UserSignalBadge user={job.postedBy} />
              </div>
            </div>
          </div>

          {/* Meta Row */}
          <div
            className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs ${isSpecialJob ? "text-base-content/65" : "text-base-content/60"}`}
          >
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span className="capitalize">{job.roleType}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="line-clamp-1">
                {getJobWorkplaceLabel(job)}
              </span>
              <span className="text-base-content/35">
                ({getJobWorkModeLabel(job.location)})
              </span>
            </span>
            <span className="flex items-center gap-1">
              <StipendIcon className="w-3.5 h-3.5" />
              {formatStipend()}
            </span>
            {job.deadline && (
              <span
                className={`flex items-center gap-1 ${
                  deadlinePassed ? "text-error" : ""
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {formatDeadline()}
              </span>
            )}
            {getJobDateTimeLabel(job) && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {getJobDateTimeLabel(job)}
              </span>
            )}
          </div>

          {/* Skills */}
          {skillsRequired.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-3">
              {skillsRequired.slice(0, 4).map((skill, i) => (
                <span
                  key={i}
                  className={`badge badge-sm text-[11px] line-clamp-1 font-medium ${isSpecialJob ? specialStyle.soft : "badge-ghost"}`}
                >
                  {skill}
                </span>
              ))}
              {skillsRequired.length > 4 && (
                <span
                  className={`badge badge-sm text-[11px] line-clamp-1 font-medium ${isSpecialJob ? specialStyle.soft : "badge-ghost"}`}
                >
                  +{skillsRequired.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* CTA */}
          <div
            className={`flex items-center justify-between mt-3 pt-3 border-t ${isSpecialJob ? "border-base-content/10" : "border-base-300/60"}`}
          >
            <span
              className={`text-[11px] flex items-center gap-1 ${isSpecialJob ? "text-base-content/55" : "text-base-content/40"}`}
            >
              <Users className="w-3 h-3" />
              {job.applicants?.length || 0} applicants
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold ${
                isSpecialJob ? specialStyle.muted : "text-primary"
              }`}
            >
              View Job
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LinkedJobCard;

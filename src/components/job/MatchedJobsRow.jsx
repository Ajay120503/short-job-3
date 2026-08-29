import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/axios";
import useAuthStore from "../../store/authStore";
import { canApplyToJobs } from "../../utils/badgeUtils";
import {
  canUseSpecialStyle,
  getSpecialUserStyle,
} from "../../utils/specialUserStyles";

const getUserId = (value) => (typeof value === "string" ? value : value?._id);
const isOwnJob = (job, userId) => Boolean(userId && getUserId(job?.postedBy) === userId);

const MatchedJobsRow = () => {
  const { user } = useAuthStore();
  const [matched, setMatched] = useState([]);
  const [loading, setLoading] = useState(true);

  const canUseMatchedJobs = canApplyToJobs(user);

  useEffect(() => {
    if (!canUseMatchedJobs) {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      try {
        const { data } = await API.get("/jobs/matched");
        setMatched(
          (data.matched || []).filter(({ job }) => !isOwnJob(job, user?._id))
        );
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [canUseMatchedJobs]);

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-32 skeleton rounded"></div>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-48 h-24 skeleton rounded-lg flex-shrink-0"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const visibleMatched = matched.filter(({ job }) => !isOwnJob(job, user?._id));

  if (!visibleMatched.length) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
        Matched for You
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
        {visibleMatched.map(({ job, score, matchedSkills = [], scoreBreakdown }) => {
          const isSpecialJob = canUseSpecialStyle(job.postedBy);
          const specialStyle = getSpecialUserStyle(job.postedBy);

          return (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              className={`card border shadow-sm transition-all hover:shadow-md p-3 min-w-[210px] max-w-[230px] flex-shrink-0 snap-start ${
                isSpecialJob
                  ? `${specialStyle.shell} ${specialStyle.shellHover}`
                  : "bg-base-100 border-base-300/50 hover:border-primary/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`badge badge-xs font-bold ${
                    score >= 70
                      ? "badge-success"
                      : score >= 40
                        ? "badge-warning"
                        : isSpecialJob
                          ? specialStyle.soft
                          : "badge-ghost"
                  }`}
                >
                  {score}%
                </span>
                <span className="text-xs text-base-content/40">match</span>
              </div>
              <p
                className={`text-sm font-medium truncate ${
                  isSpecialJob ? specialStyle.muted : ""
                }`}
              >
                {job.title}
              </p>
              <p className="text-xs text-base-content/50 truncate">
                {job.institutionName}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {matchedSkills.length > 0 ? (
                  matchedSkills.slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className={`badge badge-xs max-w-full truncate ${
                        isSpecialJob
                          ? specialStyle.soft
                          : "badge-primary badge-soft"
                      }`}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span
                    className={`badge badge-xs ${
                      isSpecialJob ? specialStyle.soft : "badge-ghost"
                    }`}
                  >
                    profile fit
                  </span>
                )}
              </div>
              {scoreBreakdown && (
                <p className="mt-2 text-[11px] text-base-content/40">
                  Skills {scoreBreakdown.skills || 0} · Profile{" "}
                  {(scoreBreakdown.qualifications || 0) +
                    (scoreBreakdown.content || 0)}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MatchedJobsRow;

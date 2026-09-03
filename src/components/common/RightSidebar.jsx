import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  UserPlus,
  Briefcase,
  MapPin,
  TrendingUp,
  ArrowRight,
  Search,
  PlusCircle,
  Clock,
} from "lucide-react";
import API from "../../utils/axios";
import useAuthStore from "../../store/authStore";
import Brand from "./Brand";
import UserAvatar from "./UserAvatar";
import { getUserRoleLabel } from "../../utils/badgeUtils";
import {
  getUserId,
  getUserSignal,
  sortDiscoverableUsers,
} from "../../utils/userSignals";
import { getSpecialUserStyle } from "../../utils/specialUserStyles";
import { getJobWorkplaceLabel } from "../../utils/jobLocation";
import { normalizeJobSkills } from "../../utils/jobSkills";
import { getJobScheduleLabel } from "../../utils/jobSchedule";

const visibleSkillsLimit = 2;

const isJobDeadlineActive = (job) => {
  if (!job?.deadline) return false;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return new Date(job.deadline) >= todayStart;
};

const RightSidebar = () => {
  const { user } = useAuthStore();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const following = useMemo(
    () => new Set((user?.following || []).map(getUserId).filter(Boolean)),
    [user?.following],
  );

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const { data } = await API.get(
          "/users/search?limit=30&excludeFollowed=true",
        );
        const users = sortDiscoverableUsers(
          (data.users || []).filter(
            (u) => u._id !== user?._id && !following.has(u._id),
          ),
        );
        setSuggestedUsers(users.slice(0, 5));
      } catch {
        // Silently fail
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchRecentJobs = async () => {
      try {
        const { data } = await API.get("/jobs?limit=20");
        const jobs = (data.jobs || []).filter(
          (j) => j.postedBy?._id !== user?._id && isJobDeadlineActive(j),
        );
        setRecentJobs(jobs.slice(0, 5));
      } catch {
        // Silently fail
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchSuggestedUsers();
    fetchRecentJobs();
  }, [following, user?._id]);

  return (
    <aside className="hidden 2xl:flex flex-col w-[340px] bg-base-100 border-l border-base-300/70 sticky top-0 h-screen overflow-hidden">
      <div className="border-b border-base-200/80 p-4">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Link
            to="/explore"
            className="flex h-10 items-center gap-2 rounded-xl border border-base-300/60 bg-base-200/45 px-3 text-sm text-base-content/45 transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
          >
            <Search className="h-4 w-4" />
            Search ShortJob
          </Link>
          <Link
            to="/posts/create"
            className="btn btn-primary btn-sm h-10 w-10 rounded-xl p-0"
            title="Create post"
            aria-label="Create post"
          >
            <PlusCircle className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 xl:p-5 space-y-4">
        {/* Who to Follow */}
        <div className="rounded-xl border border-base-300/60 bg-base-100 shadow-sm overflow-hidden">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <UserPlus className="w-4 h-4 text-primary" />
                </div>
                <span className="truncate">Who to Follow</span>
              </h3>
              <Link
                to="/explore"
                className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"
              >
                See all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loadingUsers ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full skeleton flex-shrink-0"></div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-24 skeleton rounded"></div>
                      <div className="h-2.5 w-16 skeleton rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestedUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-base-300/50 flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-6 h-6 text-base-content/20" />
                </div>
                <p className="text-xs text-base-content/40 font-medium">
                  No suggestions yet
                </p>
                <p className="text-[11px] text-base-content/30 mt-0.5">
                  Explore the community to find people
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {suggestedUsers.map((u) => {
                  const signal = getUserSignal(u);
                  const isSpecialUser = Boolean(signal);
                  const specialStyle = getSpecialUserStyle(u);

                  return (
                    <Link
                      key={u._id}
                      to={`/profile/${u._id}`}
                      className={`flex items-center gap-3 overflow-hidden rounded-xl border p-2.5 transition-all group ${
                        isSpecialUser
                          ? `${specialStyle.shell} ${specialStyle.shellHover}`
                          : "border-transparent hover:border-base-300/60 hover:bg-base-200/70"
                      }`}
                    >
                      <UserAvatar user={u} size={42} />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold line-clamp-1 transition-colors ${
                            isSpecialUser
                              ? specialStyle.muted
                              : "group-hover:text-primary"
                          }`}
                        >
                          {u.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 min-w-0">
                          <span className="badge badge-xs badge-soft badge-primary text-[10px] max-w-24 truncate capitalize font-medium shrink-0">
                            {getUserRoleLabel(u)}
                          </span>
                          {signal && (
                            <span
                              className={`badge badge-xs text-[10px] truncate font-semibold shrink-0 ${signal.className}`}
                            >
                              {signal.label}
                            </span>
                          )}
                          {u.institutionName && (
                            <span
                              className={`text-[10px] truncate line-clamp-1 ${
                                isSpecialUser
                                  ? "text-base-content/60"
                                  : "text-base-content/40"
                              }`}
                            >
                              {u.institutionName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${
                          isSpecialUser ? specialStyle.icon : ""
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Trending Jobs */}
        <div className="rounded-xl border border-base-300/60 bg-base-100 shadow-sm overflow-hidden">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-warning" />
                </div>
                <span className="truncate">Trending Jobs</span>
              </h3>
              <Link
                to="/jobs"
                className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loadingJobs ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2 p-2.5">
                    <div className="h-3.5 w-full skeleton rounded"></div>
                    <div className="h-2.5 w-3/4 skeleton rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-5 w-12 skeleton rounded-full"></div>
                      <div className="h-5 w-14 skeleton rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-base-300/50 flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-6 h-6 text-base-content/20" />
                </div>
                <p className="text-xs text-base-content/40 font-medium">
                  No jobs posted yet
                </p>
                <p className="text-[11px] text-base-content/30 mt-0.5">
                  Be the first to post an opportunity
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentJobs.map((job) => {
                  const signal = getUserSignal(job.postedBy);
                  const isSpecialJob = Boolean(signal);
                  const specialStyle = getSpecialUserStyle(job.postedBy);
                  return (
                    <Link
                      key={job._id}
                      to={`/jobs/${job._id}`}
                      className={`block p-2.5 rounded-xl border transition-all group ${
                        isSpecialJob
                          ? `${specialStyle.shell} ${specialStyle.shellHover}`
                          : "border-transparent hover:border-base-300/60 hover:bg-base-200/70"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSpecialJob ? specialStyle.soft : "bg-primary/10"
                          }`}
                        >
                          <Briefcase
                            className={`w-4 h-4 ${
                              isSpecialJob ? specialStyle.icon : "text-primary"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold truncate transition-colors ${
                              isSpecialJob
                                ? specialStyle.muted
                                : "group-hover:text-primary"
                            }`}
                          >
                            {job.title}
                          </p>
                          <p
                            className={`text-xs truncate mt-0.5 ${
                              isSpecialJob
                                ? "text-base-content/60"
                                : "text-base-content/50"
                            }`}
                          >
                            {job.institutionName || "Institution"}
                          </p>
                          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                            <span className="flex min-w-0 items-center gap-1 text-[10px] text-base-content/40">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                {getJobWorkplaceLabel(job)}
                              </span>
                            </span>
                            <span
                              className={`flex min-w-0 items-center gap-1 text-[10px] font-semibold ${
                                job.isPaid
                                  ? "text-success"
                                  : "text-base-content/40"
                              }`}
                            >
                              <span className="max-w-24 truncate rounded-full bg-success/10 px-1.5 py-0.5">
                                {job.isPaid
                                  ? job.currency === "USD"
                                    ? `$${Number(job.stipend).toLocaleString()}`
                                    : `₹${Number(job.stipend).toLocaleString()}`
                                  : "Volunteer"}
                              </span>
                            </span>
                          </div>
                          {getJobScheduleLabel(job) && (
                            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-primary">
                              <Clock className="h-3 w-3" /> {getJobScheduleLabel(job)}
                            </div>
                          )}
                          {normalizeJobSkills(job.skillsRequired).length > 0 && (
                            <div className="mt-2 flex max-w-full items-center gap-1 overflow-hidden">
                              {normalizeJobSkills(job.skillsRequired)
                                .slice(0, visibleSkillsLimit)
                                .map((skill, i) => (
                                  <span
                                    key={i}
                                    title={skill}
                                    className="badge badge-xs badge-outline max-w-[86px] shrink truncate px-1.5"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              {normalizeJobSkills(job.skillsRequired).length >
                                visibleSkillsLimit && (
                                <span className="shrink-0 rounded-full bg-base-300/70 px-1.5 py-0.5 text-[9px] font-medium text-base-content/40">
                                  +
                                  {normalizeJobSkills(job.skillsRequired).length -
                                    visibleSkillsLimit}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Tip Card */}
        <div className="card bg-primary/5 border border-primary/15 shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-start gap-3">
              <div>
                <p className="text-sm font-semibold">Complete Your Profile</p>
                <p className="text-xs text-base-content/50 mt-1 leading-relaxed">
                  A complete profile gets 3x more visibility from institutions
                  and recruiters.
                </p>
                <Link
                  to="/edit-profile"
                  className="btn btn-xs btn-ghost text-primary mt-2 px-0 hover:underline"
                >
                  Update now <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="flex shrink-0 items-center justify-between border-t border-base-200/80 bg-base-100 px-5 py-3">
        <Link
          to="/"
          aria-label="Go to ShortJob home"
          className="rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Brand size="sm" showTagline />
        </Link>
        <span className="text-[10px] text-base-content/35">
          © {new Date().getFullYear()}
        </span>
      </footer>
    </aside>
  );
};

export default RightSidebar;

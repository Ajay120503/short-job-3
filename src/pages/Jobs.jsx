import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Archive, Briefcase, MapPin, Clock, Plus, Search, SlidersHorizontal, Users } from "lucide-react";
import API from "../utils/axios";
import useAuthStore from "../store/authStore";
import { canCreateJobs } from "../utils/badgeUtils";
import MatchedJobsRow from "../components/job/MatchedJobsRow";
import QuickApplyBtn from "../components/job/QuickApplyBtn";
import UserSignalBadge from "../components/common/UserSignalBadge";
import { getUserSignal } from "../utils/userSignals";
import { getSpecialUserStyle } from "../utils/specialUserStyles";
import { getJobWorkModeLabel, getJobWorkplaceLabel } from "../utils/jobLocation";
import { getJobDateTimeLabel, getJobDurationLabel } from "../utils/jobSchedule";

const formatStipend = (stipend, currency) => {
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
const SHORT_JOB_LABELS = {
  few_hours: "Few Hours",
  one_day_gig: "One Day",
  weekend_only: "Weekend",
  short_term: "Short-Term",
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

const getUserId = (value) => (typeof value === "string" ? value : value?._id);
const isOwnJob = (job, userId) => Boolean(userId && getUserId(job?.postedBy) === userId);
const getDistanceKm = (from, to) => {
  if (!from || !to) return Infinity;
  const radians = (value) => value * Math.PI / 180;
  const latitudeDelta = radians(to.lat - from.lat);
  const longitudeDelta = radians(to.lng - from.lng);
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat))
    * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

const Jobs = () => {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [archivedJobs, setArchivedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [area, setArea] = useState("");
  const [nearbyAreas, setNearbyAreas] = useState([]);
  const [radiusKm, setRadiusKm] = useState("5");
  const [customRadiusKm, setCustomRadiusKm] = useState("5");
  const [useLocation, setUseLocation] = useState(Boolean(
    user?.locationAccessEnabled && user?.currentLocation?.lat,
  ));
  const [liveLocation, setLiveLocation] = useState(() => (
    user?.currentLocation?.lat != null && user?.currentLocation?.lng != null
      ? { lat: user.currentLocation.lat, lng: user.currentLocation.lng }
      : null
  ));
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationTrackingError, setLocationTrackingError] = useState("");
  const lastTrackedLocationRef = useRef(liveLocation);
  const lastSavedLocationRef = useRef({ location: liveLocation, savedAt: 0 });
  const [shortTypes, setShortTypes] = useState([]);

  const canPost = canCreateJobs(user);
  const selectedRadiusKm = radiusKm === "custom" ? customRadiusKm : radiusKm;
  const areaFilterEnabled = useLocation
    && selectedRadiusKm !== "any"
    && Number(selectedRadiusKm) > 0;

  useEffect(() => {
    if (!useLocation || !user?.locationAccessEnabled || !navigator.geolocation) {
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const nextLocation = { lat: coords.latitude, lng: coords.longitude };
        setIsTrackingLocation(true);
        setLocationTrackingError("");
        const movedKm = getDistanceKm(lastTrackedLocationRef.current, nextLocation);
        if (movedKm < 0.05) return;

        lastTrackedLocationRef.current = nextLocation;
        setLiveLocation(nextLocation);

        const saved = lastSavedLocationRef.current;
        const movedSinceSaveKm = getDistanceKm(saved.location, nextLocation);
        if (movedSinceSaveKm >= 0.25 || Date.now() - saved.savedAt >= 60000) {
          lastSavedLocationRef.current = { location: nextLocation, savedAt: Date.now() };
          API.patch("/users/me/location", nextLocation)
            .then(({ data }) => {
              if (data.currentLocation) {
                useAuthStore.setState((state) => ({
                  user: { ...state.user, currentLocation: data.currentLocation },
                }));
              }
            })
            .catch((error) => console.error("Failed to save live location:", error));
        }
      },
      (error) => {
        setIsTrackingLocation(false);
        setLocationTrackingError(
          error.code === error.PERMISSION_DENIED
            ? "Live location permission is blocked"
            : "Waiting for an accurate live location",
        );
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [useLocation, user?.locationAccessEnabled]);

  useEffect(() => {
    const lat = liveLocation?.lat;
    const lng = liveLocation?.lng;
    if (!user?.locationAccessEnabled || lat == null || lng == null) return;

    if (!useLocation || selectedRadiusKm === "any" || Number(selectedRadiusKm) <= 0) {
      return;
    }

    const fetchNearbyAreas = async () => {
      try {
        const { data } = await API.get('/jobs/nearby-areas', {
          params: { lat, lng, radiusKm: selectedRadiusKm },
        });
        const areas = data.areas || [];
        setNearbyAreas(areas);
        setArea((current) => areas.some((item) => item.name === current) ? current : "");
      } catch (err) {
        console.error('Failed to fetch nearby areas:', err);
        setNearbyAreas([]);
        setArea("");
      }
    };

    fetchNearbyAreas();
  }, [selectedRadiusKm, useLocation, user?.locationAccessEnabled, liveLocation?.lat, liveLocation?.lng]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const params = {};
        if (area) params.area = area;
        if (shortTypes.length) params.shortJobType = shortTypes.join(",");
        if (
          useLocation
          && selectedRadiusKm !== "any"
          && Number(selectedRadiusKm) > 0
          && liveLocation?.lat != null
        ) {
          Object.assign(params, {
            lat: liveLocation.lat,
            lng: liveLocation.lng,
            radiusKm: Math.min(Number(selectedRadiusKm), 1000),
          });
        }
        const { data } = await API.get("/jobs", { params });
        const fetchedJobs = data.jobs || [];
        setJobs(fetchedJobs);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }

      if (canPost) {
        try {
          const { data } = await API.get("/jobs/my/archive");
          setArchivedJobs(data.jobs || []);
        } catch (err) {
          console.error("Failed to fetch archived jobs:", err);
        }
      } else {
        setArchivedJobs([]);
      }
    };
    fetchJobs();
  }, [canPost, area, selectedRadiusKm, useLocation, shortTypes, liveLocation?.lat, liveLocation?.lng]);

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

  const visibleJobs = jobs.filter((job) => !isOwnJob(job, user?._id));

  const filtered = visibleJobs
    .filter((j) => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;
      return [
        j.title,
        j.institutionName,
        j.location,
        j.workplaceName,
        j.workplaceAddress,
        j.workplaceCity,
        j.workplaceState,
        j.roleType,
        j.description,
        ...(j.skillsRequired || []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });

  return (
    <div className="jobs-page max-w-3xl mx-auto p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
      <MatchedJobsRow />

      <div data-page-header className="mb-4 rounded-xl border border-base-300/70 bg-base-100 p-4 shadow-sm sm:mb-5 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div data-page-heading-icon className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading sm:text-2xl">
                Job Board
              </h1>
              <p className="text-xs text-base-content/50 sm:text-sm">
                Find relevant opportunities and quick-apply matches.
              </p>
            </div>
          </div>
          {canPost && (
            <Link to="/jobs/create" className="btn btn-primary btn-sm gap-1.5">
              <Plus className="w-4 h-4" />
              Post a Job
            </Link>
          )}
        </div>
      </div>

      <div data-filter-panel className="mb-5 rounded-xl border border-base-300/70 bg-base-100 p-3 shadow-sm">
        <div className="grid gap-3 sm:items-center">
          <label className="input input-bordered h-10 rounded-xl flex items-center gap-2">
            <Search className="h-4 w-4 text-base-content/35" />
            <input
              className="grow text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jobs, skills, organization..."
            />
          </label>
        </div>
        <div className={`mt-3 grid gap-2 ${radiusKm === "custom" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          <select className="select select-bordered select-sm" value={area} disabled={!areaFilterEnabled || nearbyAreas.length === 0} onChange={(e) => setArea(e.target.value)}>
            <option value="">{nearbyAreas.length ? `All areas within ${selectedRadiusKm} km` : `No areas within ${selectedRadiusKm} km`}</option>
            {nearbyAreas.map((item) => <option key={item.name} value={item.name}>{item.name} ({item.distanceKm} km)</option>)}
          </select>
          <select className="select select-bordered select-sm" value={radiusKm} disabled={!useLocation} onChange={(e) => { setRadiusKm(e.target.value); if (e.target.value === "any") setArea(""); }}><option value="5">5 km</option><option value="10">10 km</option><option value="25">25 km</option><option value="50">50 km</option><option value="100">100 km</option><option value="custom">Custom distance…</option><option value="any">Any distance</option></select>
          {radiusKm === "custom" && (
            <label className="input input-bordered input-sm flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="1000"
                step="1"
                className="min-w-0 grow"
                value={customRadiusKm}
                onChange={(e) => setCustomRadiusKm(e.target.value)}
                placeholder="Distance"
                aria-label="Custom distance in kilometres"
              />
              <span className="text-xs text-base-content/50">km</span>
            </label>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="label cursor-pointer gap-2 p-0 text-xs"><input type="checkbox" className="toggle toggle-primary toggle-sm" checked={useLocation} disabled={!user?.locationAccessEnabled || !user?.currentLocation?.lat} onChange={(e) => { setUseLocation(e.target.checked); if (!e.target.checked) setArea(""); }} />Use my current location</label>
          {useLocation && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium ${locationTrackingError ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isTrackingLocation ? "animate-pulse bg-success" : "bg-warning"}`} />
              {locationTrackingError || (isTrackingLocation ? "Live location updating" : "Starting live location…")}
            </span>
          )}
          <select className="select select-bordered select-sm" value="" onChange={(e) => { if (e.target.value && !shortTypes.includes(e.target.value)) setShortTypes((items) => [...items, e.target.value]); }}><option value="">Add job type…</option>{Object.entries(SHORT_JOB_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          {shortTypes.map((item) => <button key={item} className="badge badge-primary badge-outline" onClick={() => setShortTypes((items) => items.filter((value) => value !== item))}>{SHORT_JOB_LABELS[item]} ×</button>)}
          <button className="btn btn-ghost btn-xs ml-auto" onClick={() => { setArea(""); setRadiusKm("5"); setCustomRadiusKm("5"); setUseLocation(Boolean(user?.locationAccessEnabled && user?.currentLocation?.lat)); setShortTypes([]); setSearchTerm(""); }}>Reset filters</button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-base-content/45">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>{filtered.length} showing</span>
          <span className="h-1 w-1 rounded-full bg-base-content/25" />
          <span>All opportunities are paid</span>
          <span className="h-1 w-1 rounded-full bg-base-content/25" />
          <span>{visibleJobs.reduce((sum, job) => sum + (job.applicants?.length || 0), 0)} total applicants</span>
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
                data-remote={job.location === "remote"}
                className={`job-list-card block rounded-xl border p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-4 ${
                  isSpecialJob
                    ? `${specialStyle.shell} ${specialStyle.shellHover}`
                    : "bg-base-100 border-base-300/50 hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Job image or institution logo */}
                  <div className="w-14 h-14 rounded-xl bg-placeholder overflow-hidden shrink-0 ring-1 ring-base-300/60">
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
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
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
                        <div className="job-list-details flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className={`job-list-location flex items-center gap-1 ${isSpecialJob ? "text-base-content/60" : "text-base-content/50"}`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="line-clamp-1">
                              {getJobWorkplaceLabel(job)}
                            </span>
                            <span className="text-base-content/35">
                              ({getJobWorkModeLabel(job.location)})
                            </span>
                          </span>
                          <span
                            className="flex items-center gap-1 font-medium text-success"
                          >
                            {formatStipend(
                              job.stipend,
                              job.currency,
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
                            {SHORT_JOB_LABELS[job.shortJobType] || ROLE_TYPE_LABELS[job.roleType] || "Opportunity"}
                          </span>
                          {job.duration?.value && <span className="badge badge-xs badge-outline">{getJobDurationLabel(job)}</span>}
                          {getJobDateTimeLabel(job) && <span className="job-schedule-label badge badge-xs badge-outline"><Clock className="h-3 w-3" /> {getJobDateTimeLabel(job)}</span>}
                          {job.distanceKm != null && <span className="badge badge-xs badge-info badge-soft">{Number(job.distanceKm).toFixed(1)} km away</span>}
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
                      <div className="job-list-actions flex items-center justify-between gap-2 sm:flex-col sm:items-end flex-shrink-0">
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
                            <Users className="mr-1 inline h-3 w-3" />
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

      {canPost && archivedJobs.length > 0 && (
        <section className="mt-6 rounded-xl border border-base-300/70 bg-base-100 p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200 text-base-content/55">
                <Archive className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold">
                  Archived Jobs
                </h2>
                <p className="text-xs text-base-content/50">
                  Your jobs with passed deadlines are kept here.
                </p>
              </div>
            </div>
            <span className="badge badge-sm badge-neutral badge-soft">
              {archivedJobs.length}
            </span>
          </div>

          <div className="space-y-2">
            {archivedJobs.map((job) => {
              const posterSignal = getUserSignal(job.postedBy);
              const isSpecialArchivedJob = Boolean(posterSignal);
              const archivedStyle = getSpecialUserStyle(job.postedBy);

              return (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className={`block rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    isSpecialArchivedJob
                      ? `${archivedStyle.shell} ${archivedStyle.shellHover}`
                      : "border-base-300/60 bg-base-200/35 hover:border-primary/30 hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-base-100 ring-1 ring-base-300/60">
                      {job.image?.url ? (
                        <img
                          src={job.image.url}
                          alt={job.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Briefcase
                          className={`h-5 w-5 ${
                            isSpecialArchivedJob
                              ? archivedStyle.icon
                              : "text-base-content/35"
                          }`}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`line-clamp-1 text-sm font-semibold ${
                            isSpecialArchivedJob ? archivedStyle.muted : ""
                          }`}
                        >
                          {job.title}
                        </h3>
                        <span
                          className={`badge badge-xs ${
                            isSpecialArchivedJob
                              ? archivedStyle.label
                              : "badge-neutral badge-soft"
                          }`}
                        >
                          Deadline passed
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-base-content/50">
                        <span className="line-clamp-1">
                          {job.institutionName || "Your organization"}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-base-content/25" />
                        <span>
                          Closed{" "}
                          {new Date(job.deadline).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-base-content/25" />
                        <span>
                          {job.applicationCount || 0} applicant
                          {(job.applicationCount || 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default Jobs;

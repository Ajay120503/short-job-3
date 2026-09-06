import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  MapPin,
  Mail,
  Calendar,
  FileText,
  Tag,
  Upload,
  X,
  ArrowLeft,
  LocateFixed,
  ExternalLink,
  Clock,
} from "lucide-react";
import API from "../utils/axios";
import toast from "../utils/toast";
import useAuthStore from "../store/authStore";
import JobTimeField from "../components/job/JobTimeField";
import ConfirmModal from "../components/common/ConfirmModal";
import { calculateDurationHours, calculateEndTime } from "../utils/jobSchedule";
import {
  getJobMapEmbedUrl,
  getJobMapLink,
  getJobWorkplaceLabel,
} from "../utils/jobLocation";
import { getCreationError } from "../utils/creationErrors";
import {
  MAX_SHORT_CREATION_TEXT_LENGTH,
  MIN_STANDALONE_CONTENT_LENGTH,
} from "../utils/creationLimits";

const SHORT_JOB_TYPES = [
  ["one_day_gig", "One-day gig"], ["few_hours", "A few hours"],
  ["weekend_only", "Weekend only"], ["short_term", "Short term"],
  ["ongoing_part_time", "Ongoing part-time"], ["full_time", "Full-time"],
  ["internship", "Internship"], ["volunteer", "Volunteer"],
];

const LOCATIONS = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const toLocalDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const todayInputValue = toLocalDateInput(new Date());
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const CreateJob = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    institutionName: user?.institutionName || user?.currentCompany || "",
    roleType: "other",
    shortJobType: "one_day_gig",
    durationValue: "",
    durationUnit: "hours",
    jobDate: "",
    startTime: "",
    endTime: "",
    isPaid: false,
    currency: "INR",
    stipend: "",
    location: "onsite",
    workplaceName: user?.currentCompany || user?.institutionName || "",
    workplaceAddress: user?.address || "",
    workplaceCity: user?.city || user?.currentLocation?.city || "",
    workplaceState: user?.state || user?.currentLocation?.state || "",
    workplaceCountry: "India",
    coordinateLat: "",
    coordinateLng: "",
    requiredQualifications: "",
    skillsRequired: "",
    deadline: "",
    contactEmail: user?.email || "",
    maxApplicants: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      if ((name === "startTime" || name === "endTime") && next.startTime && next.endTime) {
        next.durationUnit = "hours";
        next.durationValue = calculateDurationHours(next.startTime, next.endTime);
      } else if (name === "startTime" && next.durationUnit === "hours" && next.durationValue) {
        next.endTime = calculateEndTime(next.startTime, next.durationValue);
      } else if ((name === "durationValue" || name === "durationUnit") && next.durationUnit === "hours" && next.startTime) {
        next.endTime = calculateEndTime(next.startTime, next.durationValue);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [name]: "", server: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        setErrors((prev) => ({ ...prev, image: "Upload a JPG, PNG, GIF, or WebP image." }));
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Image must be under 5MB." }));
        e.target.value = "";
        return;
      }
      setErrors((prev) => ({ ...prev, image: "" }));
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Job title is required.";
    else if (form.title.trim().length < MIN_STANDALONE_CONTENT_LENGTH) nextErrors.title = `Job title must contain at least ${MIN_STANDALONE_CONTENT_LENGTH} characters.`;
    else if (form.title.trim().length > MAX_SHORT_CREATION_TEXT_LENGTH) nextErrors.title = `Job title cannot exceed ${MAX_SHORT_CREATION_TEXT_LENGTH} characters.`;
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    else if (form.description.trim().length < MIN_STANDALONE_CONTENT_LENGTH) {
      nextErrors.description = `Add at least ${MIN_STANDALONE_CONTENT_LENGTH} characters so applicants understand the role.`;
    } else if (form.description.trim().length > 5000) {
      nextErrors.description = "Description cannot exceed 5000 characters.";
    }
    const organizationName = form.institutionName.trim() || user?.institutionName?.trim();
    if (!organizationName) nextErrors.institutionName = "Organization name is required.";
    else if (organizationName.length > 150) nextErrors.institutionName = "Organization name cannot exceed 150 characters.";
    if (!form.shortJobType) nextErrors.shortJobType = "Short job type is required.";
    if (!Number.isFinite(Number(form.durationValue)) || Number(form.durationValue) <= 0) nextErrors.durationValue = "Enter a positive duration.";
    if (form.durationUnit === "hours" && Number(form.durationValue) > 24) nextErrors.durationValue = "Duration cannot exceed 24 hours.";
    if (form.durationUnit === "days" && Number(form.durationValue) > 365) nextErrors.durationValue = "Duration cannot exceed 365 days.";
    if (!form.jobDate) nextErrors.jobDate = "Job date is required.";
    if (form.jobDate && form.jobDate < todayInputValue) nextErrors.jobDate = "Job date cannot be in the past.";
    if (!form.startTime) nextErrors.startTime = "Start time is required.";
    if (!form.endTime) nextErrors.endTime = "End time is required.";
    if (form.startTime && form.endTime && form.startTime === form.endTime) {
      nextErrors.endTime = "End time must be different from the start time.";
    }
    if (!form.deadline) nextErrors.deadline = "Application deadline is required.";
    if (form.deadline && form.deadline < todayInputValue) {
      nextErrors.deadline = "Deadline cannot be in the past.";
    }
    if (form.jobDate && form.deadline && form.deadline > form.jobDate) nextErrors.deadline = "Deadline cannot be after the job date.";
    if (!form.contactEmail.trim()) nextErrors.contactEmail = "Contact email is required.";
    if (form.contactEmail && !isValidEmail(form.contactEmail)) {
      nextErrors.contactEmail = "Enter a valid email address.";
    }
    if (form.isPaid && (!form.stipend || Number(form.stipend) <= 0)) {
      nextErrors.stipend = "Enter a valid paid amount.";
    }
    if (form.maxApplicants && Number(form.maxApplicants) < 1) {
      nextErrors.maxApplicants = "Applicant limit must be at least 1.";
    }
    if (form.maxApplicants && (!Number.isInteger(Number(form.maxApplicants)) || Number(form.maxApplicants) > 100000)) {
      nextErrors.maxApplicants = "Applicant limit must be a whole number up to 100,000.";
    }
    if (form.location !== "remote" && !form.workplaceCity.trim()) {
      nextErrors.workplaceCity = "City is required for on-site and hybrid jobs.";
    }
    const limits = {
      workplaceName: 150, workplaceAddress: 300, workplaceCity: 100,
      workplaceState: 100, workplaceCountry: 100, requiredQualifications: 2000,
    };
    Object.entries(limits).forEach(([field, limit]) => {
      if (form[field].trim().length > limit) nextErrors[field] = `Maximum ${limit} characters allowed.`;
    });
    const skills = [...new Set(form.skillsRequired.split(",").map((skill) => skill.trim()).filter(Boolean))];
    if (skills.length > 20) nextErrors.skillsRequired = "Add no more than 20 skills.";
    else if (skills.some((skill) => skill.length > 50)) nextErrors.skillsRequired = "Each skill must be 50 characters or fewer.";
    const hasLat = String(form.coordinateLat).trim() !== "";
    const hasLng = String(form.coordinateLng).trim() !== "";
    if (hasLat !== hasLng) {
      nextErrors.coordinates = "Add both latitude and longitude, or leave both empty.";
    }
    if (hasLat && hasLng) {
      const lat = Number(form.coordinateLat);
      const lng = Number(form.coordinateLng);
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        nextErrors.coordinateLat = "Latitude must be between -90 and 90.";
      }
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        nextErrors.coordinateLng = "Longitude must be between -180 and 180.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleUseCurrentLocation = () => setShowLocationConfirm(true);

  const confirmUseCurrentLocation = () => {
    setShowLocationConfirm(false);
    if (!navigator.geolocation) {
      toast.error("Location is not supported in this browser.");
      return;
    }

    setIsResolvingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setForm((prev) => ({
          ...prev,
          coordinateLat: String(lat),
          coordinateLng: String(lng),
        }));
        setErrors((prev) => ({
          ...prev,
          coordinateLat: "",
          coordinateLng: "",
          coordinates: "",
        }));
        try {
          const { data } = await API.patch("/users/me/location", { lat, lng });
          const resolved = data.currentLocation || {};
          setForm((prev) => ({
            ...prev,
            workplaceCity: resolved.city || prev.workplaceCity,
            workplaceState: resolved.state || prev.workplaceState,
          }));
          setUser({
            ...user,
            currentLocation: resolved,
            locationAccessEnabled: true,
          });
          toast.success(
            resolved.city || resolved.state
              ? "Location, city, and state added."
              : "Map location added. Enter the city and state if needed.",
          );
        } catch {
          toast.error("Map coordinates were added, but the city and state could not be detected.");
        } finally {
          setIsResolvingLocation(false);
        }
      },
      (error) => {
        setIsResolvingLocation(false);
        const messages = {
          1: "Location permission was denied. Allow it in browser settings or enter the location manually.",
          2: "Your current location is unavailable. Enter the workplace manually.",
          3: "Location lookup timed out. Move to an open area and try again.",
        };
        toast.error(messages[error.code] || "Unable to access your current location.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields.");
      requestAnimationFrame(() => {
        document.querySelector(".input-error, .textarea-error, .select-error")?.focus();
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("roleType", form.roleType);
    formData.append("shortJobType", form.shortJobType);
    formData.append("durationValue", form.durationValue);
    formData.append("durationUnit", form.durationUnit);
    formData.append("jobDate", form.jobDate);
    formData.append("startTime", form.startTime);
    formData.append("endTime", form.endTime);
    formData.append("isPaid", form.isPaid);
    formData.append("location", form.location);
    formData.append("workplaceName", form.workplaceName);
    formData.append("workplaceAddress", form.workplaceAddress);
    formData.append("workplaceCity", form.workplaceCity);
    formData.append("workplaceState", form.workplaceState);
    formData.append("workplaceCountry", form.workplaceCountry);
    formData.append("deadline", form.deadline);
    formData.append("contactEmail", form.contactEmail);
    formData.append("institutionName", form.institutionName);
    formData.append("requiredQualifications", form.requiredQualifications);
    formData.append("skillsRequired", form.skillsRequired);

    if (form.stipend && form.isPaid) {
      formData.append("stipend", form.stipend);
      formData.append("currency", form.currency);
    }
    if (form.maxApplicants) {
      formData.append("maxApplicants", form.maxApplicants);
    }
    if (String(form.coordinateLat).trim() && String(form.coordinateLng).trim()) {
      formData.append("coordinateLat", form.coordinateLat);
      formData.append("coordinateLng", form.coordinateLng);
    }
    if (image) {
      formData.append("image", image);
    }

    setIsSubmitting(true);
    try {
      const { data } = await API.post("/jobs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Opportunity submitted for review.");
      navigate(`/jobs/${data.job._id}`);
    } catch (err) {
      const result = getCreationError(err, "The job could not be created.");
      setErrors((prev) => ({ ...prev, ...result.errors, server: result.message }));
      toast.error(result.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewJob = {
    workplaceName: form.workplaceName,
    workplaceAddress: form.workplaceAddress,
    workplaceCity: form.workplaceCity,
    workplaceState: form.workplaceState,
    workplaceCountry: form.workplaceCountry,
    location: form.location,
    coordinates:
      String(form.coordinateLat).trim() && String(form.coordinateLng).trim()
        ? { lat: Number(form.coordinateLat), lng: Number(form.coordinateLng) }
        : undefined,
  };
  const mapEmbedUrl = getJobMapEmbedUrl(previewJob);

  if (user?.age == null) return <ProfileGate message="Please add your age to continue — you must be 18+ to post a job." />;
  if (Number(user.age) < 18) return <ProfileGate message="You must be 18 or older to post a job on ShorJob." allowEdit={false} />;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-heading">Post a Job</h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Share an opportunity with your professional network
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.server && <ErrorSummary message={errors.server} />}
        <FormRequirementHint />
        {/* Basic Info Card */}
        <div className="card bg-base-100 border border-base-300/50 shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Basic Information
          </h2>

          <div className="space-y-4">
            {/* Title */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">
                  Job Title <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                name="title"
                className={`input input-bordered w-full h-12 text-sm ${errors.title ? "input-error" : ""}`}
                placeholder="e.g., Content Creator for training program"
                value={form.title}
                onChange={handleChange}
                minLength={MIN_STANDALONE_CONTENT_LENGTH}
                maxLength={MAX_SHORT_CREATION_TEXT_LENGTH}
                required
              />
              <span className="label-text-alt text-base-content/40">{form.title.length}/{MAX_SHORT_CREATION_TEXT_LENGTH} characters</span>
              {errors.title && <FieldError>{errors.title}</FieldError>}
            </div>

            {/* Organization Name */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Organization Name <RequiredMark />
                </span>
              </label>
              <input
                type="text"
                name="institutionName"
                className={`input input-bordered w-full h-12 text-sm ${errors.institutionName ? "input-error" : ""}`}
                placeholder="e.g., Delhi Public School"
                value={form.institutionName}
                onChange={handleChange}
                maxLength={150}
                required
              />
              {errors.institutionName && <FieldError>{errors.institutionName}</FieldError>}
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">
                  Description <span className="text-error">*</span>
                </span>
              </label>
              <textarea
                name="description"
                className={`textarea textarea-bordered w-full text-sm min-h-[120px] ${errors.description ? "textarea-error" : ""}`}
                placeholder="Describe the role, responsibilities, and expectations..."
                value={form.description}
                onChange={handleChange}
                maxLength={5000}
                required
              />
              {errors.description && (
                <FieldError>{errors.description}</FieldError>
              )}
            </div>

            {/* Short Job Type */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Short Job Type <span className="text-error">*</span>
                </span>
              </label>
              <select
                name="shortJobType"
                className="select select-bordered w-full h-12 text-sm"
                value={form.shortJobType}
                onChange={handleChange}
                required
              >
                {SHORT_JOB_TYPES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.shortJobType && (
                <FieldError>{errors.shortJobType}</FieldError>
              )}
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-sm font-medium">
                    Duration <RequiredMark />
                  </span>
                </label>
                <input
                  name="durationValue"
                  type="number"
                  min="0.25"
                  max={form.durationUnit === "hours" ? "24" : "365"}
                  step="0.25"
                  value={form.durationValue}
                  onChange={handleChange}
                  className={`input input-bordered ${errors.durationValue ? "input-error" : ""}`}
                  placeholder="4"
                  required
                />
                {errors.durationValue && (
                  <FieldError>{errors.durationValue}</FieldError>
                )}
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-sm font-medium">Unit <RequiredMark /></span>
                </label>
                <select
                  name="durationUnit"
                  value={form.durationUnit}
                  onChange={handleChange}
                  className="select select-bordered"
                  required
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
            <div className="rounded-xl border border-base-300/60 bg-base-200/35 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <Clock className="h-4 w-4 text-primary" /> Daily working time
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="form-control sm:col-span-2">
                  <label className="label pb-1"><span className="label-text text-xs font-semibold">Job date <RequiredMark /></span></label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                    <input name="jobDate" type="date" min={todayInputValue} value={form.jobDate} onChange={handleChange} className={`input input-bordered h-12 w-full rounded-xl pl-10 ${errors.jobDate ? "input-error" : ""}`} required />
                  </div>
                  {errors.jobDate && <FieldError>{errors.jobDate}</FieldError>}
                </div>
                <JobTimeField
                  name="startTime"
                  label="Start time"
                  value={form.startTime}
                  onChange={handleChange}
                  error={errors.startTime}
                />
                <JobTimeField
                  name="endTime"
                  label="End time"
                  value={form.endTime}
                  onChange={handleChange}
                  error={errors.endTime}
                />
              </div>
              <p className="mt-2 text-[11px] text-base-content/45">
                Times are displayed to applicants in 12-hour AM/PM format.
              </p>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="card bg-base-100 border border-base-300/50 shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Job Details
          </h2>

          <div className="space-y-4">
            {/* Location */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Work Mode <RequiredMark />
                </span>
              </label>
              <select
                name="location"
                className={`select select-bordered w-full h-12 text-sm ${errors.location ? "select-error" : ""}`}
                value={form.location}
                onChange={handleChange}
                required
              >
                {LOCATIONS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              {errors.location && <FieldError>{errors.location}</FieldError>}
            </div>

            <div className="rounded-2xl border border-base-300/70 bg-base-200/35 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    Workplace Location
                  </h3>
                  <p className="text-xs text-base-content/45 mt-1">
                    Add the exact work place so applicants can check distance
                    and directions.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs gap-1.5"
                  onClick={handleUseCurrentLocation}
                  disabled={isResolvingLocation}
                >
                  {isResolvingLocation ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <LocateFixed className="w-3.5 h-3.5" />
                  )}
                  {isResolvingLocation ? "Detecting..." : "Use current"}
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="form-control sm:col-span-2">
                  <label className="label py-0 pb-1"><span className="label-text text-xs font-medium">Workplace name <OptionalMark /></span></label>
                  <input type="text" name="workplaceName" className={`input input-bordered h-11 text-sm ${errors.workplaceName ? "input-error" : ""}`} placeholder="Office, institution, or branch" value={form.workplaceName} onChange={handleChange} maxLength={150} />
                </div>
                <div className="form-control sm:col-span-2">
                  <label className="label py-0 pb-1"><span className="label-text text-xs font-medium">Street address <OptionalMark /></span></label>
                  <input type="text" name="workplaceAddress" className={`input input-bordered h-11 text-sm ${errors.workplaceAddress ? "input-error" : ""}`} placeholder="Building, street, and area" value={form.workplaceAddress} onChange={handleChange} maxLength={300} />
                </div>
                <div className="form-control">
                  <label className="label py-0 pb-1"><span className="label-text text-xs font-medium">City {form.location === "remote" ? <OptionalMark /> : <RequiredMark />}</span></label>
                  <input type="text" name="workplaceCity" className={`input input-bordered h-11 text-sm ${errors.workplaceCity ? "input-error" : ""}`} placeholder="City" value={form.workplaceCity} onChange={handleChange} maxLength={100} required={form.location !== "remote"} />
                </div>
                <div className="form-control">
                  <label className="label py-0 pb-1"><span className="label-text text-xs font-medium">State <OptionalMark /></span></label>
                  <input type="text" name="workplaceState" className={`input input-bordered h-11 text-sm ${errors.workplaceState ? "input-error" : ""}`} placeholder="State" value={form.workplaceState} onChange={handleChange} maxLength={100} />
                </div>
                <div className="form-control">
                  <label className="label py-0 pb-1"><span className="label-text text-xs font-medium">Country <OptionalMark /></span></label>
                  <input type="text" name="workplaceCountry" className={`input input-bordered h-11 text-sm ${errors.workplaceCountry ? "input-error" : ""}`} placeholder="Country" value={form.workplaceCountry} onChange={handleChange} maxLength={100} />
                </div>
                <div className="form-control">
                  <label className="label py-0 pb-1"><span className="label-text text-xs font-medium">Coordinates <OptionalMark /></span></label>
                  <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    name="coordinateLat"
                    className={`input input-bordered h-11 text-sm ${errors.coordinateLat ? "input-error" : ""}`}
                    placeholder="Latitude (optional)"
                    value={form.coordinateLat}
                    onChange={handleChange}
                  />
                  <input
                    type="number"
                    step="any"
                    name="coordinateLng"
                    className={`input input-bordered h-11 text-sm ${errors.coordinateLng ? "input-error" : ""}`}
                    placeholder="Longitude (optional)"
                    value={form.coordinateLng}
                    onChange={handleChange}
                  />
                  </div>
                </div>
              </div>
              {(errors.workplaceName ||
                errors.workplaceAddress ||
                errors.workplaceCity ||
                errors.workplaceState ||
                errors.workplaceCountry ||
                errors.coordinates ||
                errors.coordinateLat ||
                errors.coordinateLng) && (
                <FieldError>
                  {errors.workplaceName ||
                    errors.workplaceAddress ||
                    errors.workplaceCity ||
                    errors.workplaceState ||
                    errors.workplaceCountry ||
                    errors.coordinates ||
                    errors.coordinateLat ||
                    errors.coordinateLng}
                </FieldError>
              )}
              <div className="mt-3 overflow-hidden rounded-xl border border-base-300 bg-base-100">
                {mapEmbedUrl ? (
                  <iframe
                    title="Workplace map preview"
                    src={mapEmbedUrl}
                    className="h-48 w-full"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-28 flex-col items-center justify-center gap-1 text-center text-xs text-base-content/45">
                    <MapPin className="h-5 w-5 text-primary/50" />
                    Add coordinates or use current location to preview the map.
                  </div>
                )}
              </div>
              <a
                href={getJobMapLink(previewJob)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Open {getJobWorkplaceLabel(previewJob)} in map
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Paid / Unpaid */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPaid"
                  className="checkbox checkbox-primary checkbox-sm"
                  checked={form.isPaid}
                  onChange={handleChange}
                />
                <span className="text-sm font-medium">Paid Position</span>
              </label>
            </div>

            {/* Stipend (only if paid) */}
            {form.isPaid && (
              <div className="space-y-3">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm flex items-center gap-1.5">
                      Stipend / Salary <RequiredMark />
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="stipend"
                      className={`input input-bordered flex-1 h-12 text-sm ${errors.stipend ? "input-error" : ""}`}
                      placeholder="e.g., 50000"
                      value={form.stipend}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                    <select
                      name="currency"
                      className="select select-bordered w-24 h-12 text-sm"
                      value={form.currency}
                      onChange={handleChange}
                    >
                      <option value="INR">₹ INR</option>
                      <option value="USD">$ USD</option>
                    </select>
                  </div>
                  {errors.stipend && <FieldError>{errors.stipend}</FieldError>}
                </div>
              </div>
            )}

            {/* Required Qualifications */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">
                  Required Qualifications <OptionalMark />
                </span>
              </label>
              <textarea
                name="requiredQualifications"
                className={`textarea textarea-bordered w-full text-sm min-h-[80px] ${errors.requiredQualifications ? "textarea-error" : ""}`}
                placeholder="e.g., B.Ed, M.Sc, CTET qualified..."
                value={form.requiredQualifications}
                onChange={handleChange}
                maxLength={2000}
              />
              {errors.requiredQualifications && <FieldError>{errors.requiredQualifications}</FieldError>}
            </div>

            {/* Skills Required */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">
                  Skills Required <OptionalMark />
                </span>
              </label>
              <input
                type="text"
                name="skillsRequired"
                className={`input input-bordered w-full h-12 text-sm ${errors.skillsRequired ? "input-error" : ""}`}
                placeholder="e.g., Communication, Python, Classroom Management (comma separated)"
                value={form.skillsRequired}
                onChange={handleChange}
              />
              {errors.skillsRequired && <FieldError>{errors.skillsRequired}</FieldError>}
            </div>
          </div>
        </div>

        {/* Schedule & Contact Card */}
        <div className="card bg-base-100 border border-base-300/50 shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule & Contact
          </h2>

          <div className="space-y-4">
            {/* Deadline */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">
                  Application Deadline <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="date"
                name="deadline"
                className={`input input-bordered w-full h-12 text-sm ${errors.deadline ? "input-error" : ""}`}
                value={form.deadline}
                onChange={handleChange}
                maxLength={254}
                min={todayInputValue}
                required
              />
              {errors.deadline && <FieldError>{errors.deadline}</FieldError>}
            </div>

            {/* Contact Email */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Contact Email <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="email"
                name="contactEmail"
                className={`input input-bordered w-full h-12 text-sm ${errors.contactEmail ? "input-error" : ""}`}
                placeholder="hr@institution.com"
                value={form.contactEmail}
                onChange={handleChange}
                required
              />
              {errors.contactEmail && (
                <FieldError>{errors.contactEmail}</FieldError>
              )}
            </div>

            {/* Max Applicants */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">
                  Max Applicants <OptionalMark />
                </span>
              </label>
              <input
                type="number"
                name="maxApplicants"
                className={`input input-bordered w-full h-12 text-sm ${errors.maxApplicants ? "input-error" : ""}`}
                placeholder="e.g., 50"
                value={form.maxApplicants}
                onChange={handleChange}
                min="0"
                max="100000"
                step="1"
              />
              <span className="mt-1 text-[11px] text-base-content/40">Leave empty or enter 0 for unlimited applicants.</span>
              {errors.maxApplicants && (
                <FieldError>{errors.maxApplicants}</FieldError>
              )}
            </div>
          </div>
        </div>

        {/* Image Upload Card */}
        <div className="card bg-base-100 border border-base-300/50 shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Job Image (Optional)
          </h2>

          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 btn btn-circle btn-xs btn-error"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-base-300 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 text-base-content/30" />
              <span className="text-sm text-base-content/50">
                Click to upload an image (max 5MB)
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
          {errors.image && <FieldError>{errors.image}</FieldError>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-full h-12 text-base font-semibold shadow-lg shadow-primary/25"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "Post Job"
          )}
        </button>

        <p className="text-xs text-base-content/40 text-center pb-6">
          By posting a job, you agree to ShortJob's terms and conditions.
        </p>
      </form>
      <ConfirmModal
        isOpen={showLocationConfirm}
        onClose={() => setShowLocationConfirm(false)}
        onConfirm={confirmUseCurrentLocation}
        title="Use Your Current Location?"
        message="ShorJob will ask your browser for location access and use the coordinates for this job's workplace map."
        confirmText="Continue"
        cancelText="Not Now"
        variant="info"
      />
    </div>
  );
};

const FieldError = ({ children }) => (
  <p className="mt-1 text-xs font-medium text-error">{children}</p>
);

const ErrorSummary = ({ message }) => (
  <div role="alert" className="alert alert-error text-sm">
    <span>{message}</span>
  </div>
);

const RequiredMark = () => <span className="text-error" aria-hidden="true">*</span>;

const OptionalMark = () => (
  <span className="font-normal text-base-content/40">(optional)</span>
);

const FormRequirementHint = () => (
  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-base-300/70 bg-base-100 px-4 py-3 text-xs text-base-content/60">
    <span><RequiredMark /> Required fields</span>
    <span>Unmarked fields are optional. Profile details are filled automatically and remain editable.</span>
  </div>
);

const ProfileGate = ({ message, allowEdit = true }) => (
  <div className="mx-auto mt-16 max-w-md rounded-2xl border border-base-300 bg-base-100 p-6 text-center shadow-sm">
    <h1 className="font-heading text-xl font-bold">Complete your profile</h1>
    <p className="mt-2 text-sm text-base-content/65">{message}</p>
    {allowEdit && <Link to="/edit-profile#age" className="btn btn-primary btn-sm mt-5">Add age</Link>}
  </div>
);

export default CreateJob;

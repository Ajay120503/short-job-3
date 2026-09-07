import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Save,
  LocateFixed,
  ExternalLink,
  Clock,
} from "lucide-react";
import API from "../utils/axios";
import toast from "../utils/toast";
import JobTimeField from "../components/job/JobTimeField";
import QualificationMultiSelect from "../components/job/QualificationMultiSelect";
import ConfirmModal from "../components/common/ConfirmModal";
import {
  SHORT_JOB_TYPE_OPTIONS,
  calculateDurationHours,
  calculateEndTime,
  getDurationUnitForJobType,
  getJobDurationHint,
  usesDailyWorkingHours,
} from "../utils/jobSchedule";
import { getCreationError } from "../utils/creationErrors";
import {
  getJobPayoutError,
  JOB_PAYOUT_MAX,
  JOB_PAYOUT_MIN,
} from "../utils/jobPayout";
import {
  getJobMapEmbedUrl,
  getJobMapLink,
  getJobWorkplaceLabel,
} from "../utils/jobLocation";
import {
  JOB_DESCRIPTION_MAX_LENGTH,
  JOB_TEXT_MAX_LENGTH,
  JOB_TEXT_MIN_LENGTH,
} from "../utils/creationLimits";

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
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const earliestJobDate = toLocalDateInput(tomorrow);

const EditJob = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    institutionName: "",
    shortJobType: "short_term",
    durationValue: "",
    durationUnit: "hours",
    jobDate: "",
    startTime: "",
    endTime: "",
    isPaid: true,
    currency: "INR",
    stipend: "",
    location: "onsite",
    workplaceName: "",
    workplaceAddress: "",
    workplaceCity: "",
    workplaceState: "",
    workplaceCountry: "India",
    coordinateLat: "",
    coordinateLng: "",
    requiredQualifications: "",
    skillsRequired: "",
    deadline: "",
    contactEmail: "",
    maxApplicants: "",
    isActive: true,
    workingHoursPerDay: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await API.get(`/jobs/${id}`);
        const job = data.job;
        const normalizedType = SHORT_JOB_TYPE_OPTIONS.some(([value]) => value === job.shortJobType)
          ? job.shortJobType
          : "short_term";
        const scheduleHours = calculateDurationHours(job.startTime, job.endTime);
        setForm({
          title: job.title || "",
          description: job.description || "",
          institutionName: job.institutionName || "",
          shortJobType: normalizedType,
          durationValue: usesDailyWorkingHours(normalizedType)
            ? (job.duration?.value || 1)
            : (scheduleHours || job.duration?.value || 1),
          durationUnit: getDurationUnitForJobType(normalizedType),
          jobDate: job.jobDate ? new Date(job.jobDate).toISOString().split("T")[0] : "",
          startTime: job.startTime || "",
          endTime: job.endTime || "",
          isPaid: true,
          currency: job.currency || "INR",
          stipend: job.stipend || "",
          location: job.location || "onsite",
          workplaceName: job.workplaceName || "",
          workplaceAddress: job.workplaceAddress || "",
          workplaceCity: job.workplaceCity || "",
          workplaceState: job.workplaceState || "",
          workplaceCountry: job.workplaceCountry || "India",
          coordinateLat: job.coordinates?.lat ?? "",
          coordinateLng: job.coordinates?.lng ?? "",
          requiredQualifications: job.requiredQualifications || "",
          skillsRequired: (job.skillsRequired || []).join(", "),
          deadline: job.deadline
            ? new Date(job.deadline).toISOString().split("T")[0]
            : "",
          contactEmail: job.contactEmail || "",
          maxApplicants: job.maxApplicants || "",
          isActive: job.isActive !== false,
          workingHoursPerDay: usesDailyWorkingHours(normalizedType)
            ? (scheduleHours || job.workingHoursPerDay || "")
            : "",
        });
        if (job.image?.url) {
          setImagePreview(job.image.url);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load job.");
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "shortJobType") {
        next.durationUnit = getDurationUnitForJobType(value);
        next.durationValue = value === "weekend_only" ? "2" : "";
        next.workingHoursPerDay = "";
        if (next.startTime && next.endTime) {
          const hours = calculateDurationHours(next.startTime, next.endTime);
          if (usesDailyWorkingHours(value)) next.workingHoursPerDay = hours;
          else next.durationValue = hours;
        }
      }
      if (name === "location" && value === "remote") {
        next.coordinateLat = "";
        next.coordinateLng = "";
      }
      if ((name === "startTime" || name === "endTime") && next.startTime && next.endTime) {
        const hours = calculateDurationHours(next.startTime, next.endTime);
        if (usesDailyWorkingHours(next.shortJobType)) next.workingHoursPerDay = hours;
        else next.durationValue = hours;
      } else if (name === "startTime") {
        const hours = usesDailyWorkingHours(next.shortJobType) ? next.workingHoursPerDay : next.durationValue;
        if (hours) next.endTime = calculateEndTime(next.startTime, hours);
      } else if (name === "durationValue" && !usesDailyWorkingHours(next.shortJobType)) {
        if (next.startTime) next.endTime = calculateEndTime(next.startTime, value);
      }
      return next;
    });
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      ...(name === "shortJobType" || name === "startTime" || name === "endTime" || name === "durationValue"
        ? { durationValue: "", durationUnit: "", workingHoursPerDay: "", startTime: "", endTime: "" }
        : {}),
      ...(name === "location" && value === "remote"
        ? {
            workplaceName: "",
            workplaceAddress: "",
            workplaceCity: "",
            workplaceState: "",
            workplaceCountry: "",
            coordinates: "",
            coordinateLat: "",
            coordinateLng: "",
          }
        : {}),
      server: "",
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Image must be less than 5MB." }));
        return;
      }
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, image: "Please upload an image file." }));
        return;
      }
      setErrors((prev) => ({ ...prev, image: "" }));
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    if (imagePreview && !imagePreview.startsWith("http")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Job title is required.";
    else if (form.title.trim().length < JOB_TEXT_MIN_LENGTH) nextErrors.title = `Job title must contain at least ${JOB_TEXT_MIN_LENGTH} characters.`;
    else if (form.title.trim().length > JOB_TEXT_MAX_LENGTH) nextErrors.title = `Job title cannot exceed ${JOB_TEXT_MAX_LENGTH} characters.`;
    if (form.description.trim().length > JOB_DESCRIPTION_MAX_LENGTH) nextErrors.description = `Description cannot exceed ${JOB_DESCRIPTION_MAX_LENGTH} characters.`;
    const requiredTextRules = {
      workplaceName: [50, "Workplace name"],
      workplaceAddress: [100, "Street address"],
      workplaceCity: [50, "City"],
      workplaceState: [50, "State"],
      workplaceCountry: [50, "Country"],
    };
    const organizationLength = form.institutionName.trim().length;
    if (!organizationLength) nextErrors.institutionName = "Organization name is required.";
    else if (organizationLength < 3 || organizationLength > 50) nextErrors.institutionName = "Organization name must contain 3 to 50 characters.";
    if (form.location !== "remote") {
      Object.entries(requiredTextRules).forEach(([field, [max, label]]) => {
        const length = form[field].trim().length;
        if (!length) nextErrors[field] = `${label} is required.`;
        else if (length < 3 || length > max) nextErrors[field] = `${label} must contain 3 to ${max} characters.`;
      });
    }
    const qualifications = [...new Set(form.requiredQualifications.split(",").map((item) => item.trim()).filter(Boolean))];
    if (qualifications.length > 5 || qualifications.some((item) => item.length < 3 || item.length > 50)) nextErrors.requiredQualifications = "Use up to 5 qualifications of 3 to 50 characters each.";
    const skills = [...new Set(form.skillsRequired.split(",").map((item) => item.trim()).filter(Boolean))];
    if (skills.length > 5 || skills.some((item) => item.length < 3 || item.length > 50)) nextErrors.skillsRequired = "Use up to 5 skills of 3 to 50 characters each.";
    if (!form.shortJobType) nextErrors.shortJobType = "Short job type is required.";
    const scheduleHours = calculateDurationHours(form.startTime, form.endTime);
    const dailySchedule = usesDailyWorkingHours(form.shortJobType);
    const duration = dailySchedule ? Number(form.durationValue) : Number(scheduleHours || form.durationValue);
    const dailyHours = Number(scheduleHours || form.workingHoursPerDay);
    if (!Number.isFinite(duration) || duration <= 0) nextErrors.durationValue = `Enter a valid ${dailySchedule ? "number of days" : "number of hours"}.`;
    else if (!dailySchedule && duration < 0.25) nextErrors.durationValue = "Duration must be at least 0.25 hours (15 minutes).";
    else if (!dailySchedule && duration > 24) nextErrors.durationValue = "Duration must be between 0.25 and 24 hours.";
    else if (form.shortJobType === "weekend_only" && duration !== 2) nextErrors.durationValue = "Weekend jobs run for 2 days.";
    else if (form.shortJobType === "short_term" && (!Number.isInteger(duration) || duration > 7)) nextErrors.durationValue = "Short-Term duration must be 1 to 7 whole days.";
    if (dailySchedule && (!Number.isFinite(dailyHours) || dailyHours < 0.25 || dailyHours > 24)) nextErrors.workingHoursPerDay = "Working hours per day must be between 0.25 and 24.";
    if (!form.jobDate) nextErrors.jobDate = "Job date is required.";
    if (form.jobDate && form.jobDate < earliestJobDate) nextErrors.jobDate = "Job date must be tomorrow or a later date.";
    if (form.shortJobType === "weekend_only" && form.jobDate && new Date(`${form.jobDate}T00:00:00`).getDay() !== 6) nextErrors.jobDate = "Weekend jobs must start on a Saturday.";
    if (!form.startTime) nextErrors.startTime = "Start time is required.";
    if (!form.endTime) nextErrors.endTime = "End time is required.";
    if (form.startTime && form.endTime && form.startTime === form.endTime) nextErrors.endTime = "End time must be different from the start time.";
    if (!form.deadline) nextErrors.deadline = "Application deadline is required.";
    if (form.deadline && form.deadline < todayInputValue) {
      nextErrors.deadline = "Deadline cannot be in the past.";
    }
    if (form.jobDate && form.deadline && form.deadline > form.jobDate) nextErrors.deadline = "Deadline cannot be after the job date.";
    if (!form.contactEmail.trim()) nextErrors.contactEmail = "Contact email is required.";
    const emailLocalPart = form.contactEmail.trim().split("@")[0] || "";
    if (form.contactEmail && (!isValidEmail(form.contactEmail) || emailLocalPart.length < 2 || emailLocalPart.length > 20)) {
      nextErrors.contactEmail = "Enter a valid email with 2 to 20 characters before @.";
    }
    const payoutError = getJobPayoutError(form.stipend);
    if (payoutError) nextErrors.stipend = payoutError;
    if (form.maxApplicants !== "" && (!Number.isInteger(Number(form.maxApplicants)) || Number(form.maxApplicants) < 0 || Number(form.maxApplicants) > 100)) {
      nextErrors.maxApplicants = "Applicant limit must be a whole number between 0 and 100.";
    }
    const hasLat = String(form.coordinateLat).trim() !== "";
    const hasLng = String(form.coordinateLng).trim() !== "";
    if (form.location !== "remote" && hasLat !== hasLng) {
      nextErrors.coordinates = "Add both latitude and longitude, or leave both empty.";
    }
    if (form.location !== "remote" && hasLat && hasLng) {
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          coordinateLat: position.coords.latitude.toFixed(6),
          coordinateLng: position.coords.longitude.toFixed(6),
        }));
        setErrors((prev) => ({
          ...prev,
          coordinateLat: "",
          coordinateLng: "",
          coordinates: "",
        }));
        toast.success("Workplace map location updated.");
      },
      () => toast.error("Unable to access your current location."),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields.");
      requestAnimationFrame(() => {
        document
          .querySelector(
            ".input-error, .textarea-error, .select-error, [aria-invalid='true']",
          )
          ?.focus();
      });
      return;
    }

    const formData = new FormData();
    const scheduleHours = calculateDurationHours(form.startTime, form.endTime);
    const dailySchedule = usesDailyWorkingHours(form.shortJobType);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("shortJobType", form.shortJobType);
    formData.append("durationValue", dailySchedule ? form.durationValue : scheduleHours);
    formData.append("durationUnit", getDurationUnitForJobType(form.shortJobType));
    if (dailySchedule) formData.append("workingHoursPerDay", scheduleHours);
    formData.append("jobDate", form.jobDate);
    formData.append("startTime", form.startTime);
    formData.append("endTime", form.endTime);
    formData.append("isPaid", "true");
    formData.append("location", form.location);
    if (form.location !== "remote") {
      formData.append("workplaceName", form.workplaceName);
      formData.append("workplaceAddress", form.workplaceAddress);
      formData.append("workplaceCity", form.workplaceCity);
      formData.append("workplaceState", form.workplaceState);
      formData.append("workplaceCountry", form.workplaceCountry);
    } else {
      formData.append("clearCoordinates", "true");
    }
    formData.append("deadline", form.deadline);
    formData.append("contactEmail", form.contactEmail);
    formData.append("institutionName", form.institutionName);
    formData.append("requiredQualifications", form.requiredQualifications);
    formData.append("skillsRequired", form.skillsRequired);
    formData.append("isActive", form.isActive);

    if (form.stipend) {
      formData.append("stipend", form.stipend);
      formData.append("currency", form.currency);
    }
    if (form.maxApplicants) {
      formData.append("maxApplicants", form.maxApplicants);
    }
    if (form.location !== "remote" && String(form.coordinateLat).trim() && String(form.coordinateLng).trim()) {
      formData.append("coordinateLat", form.coordinateLat);
      formData.append("coordinateLng", form.coordinateLng);
    } else {
      formData.append("clearCoordinates", "true");
    }
    if (image) {
      formData.append("image", image);
    }

    setIsSubmitting(true);
    try {
      const { data } = await API.put(`/jobs/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Job updated successfully!");
      // The linked feed post is synced server-side (Post.jobPost -> text = title)
      navigate(`/jobs/${data.job._id}`);
    } catch (err) {
      const result = getCreationError(err, "The job could not be updated.");
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
  const validationErrors = Object.entries(errors)
    .filter(([field, message]) => field !== "server" && Boolean(message))
    .map(([field, message]) => ({ field, message }));

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
        <div className="h-8 w-32 skeleton rounded mb-6"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card border border-base-300/50 p-6 space-y-4">
            <div className="h-5 w-1/3 skeleton rounded"></div>
            <div className="h-12 skeleton rounded"></div>
            <div className="h-12 skeleton rounded"></div>
          </div>
        ))}
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold font-heading">Edit Job</h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Update your job listing — the linked feed post updates too
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {errors.server && <ErrorSummary message={errors.server} />}
        {validationErrors.length > 0 && <ValidationSummary errors={validationErrors} />}
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
                minLength={JOB_TEXT_MIN_LENGTH}
                maxLength={JOB_TEXT_MAX_LENGTH}
                required
              />
              <span className="label-text-alt text-base-content/40">{form.title.length}/{JOB_TEXT_MAX_LENGTH} characters</span>
              {errors.title && <FieldError>{errors.title}</FieldError>}
            </div>

            {/* Organization Name */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Organization Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                name="institutionName"
                className={`input input-bordered w-full h-12 text-sm ${errors.institutionName ? "input-error" : ""}`}
                placeholder="e.g., Delhi Public School"
                value={form.institutionName}
                onChange={handleChange}
                minLength={3}
                maxLength={50}
                required
              />
              {errors.institutionName && <FieldError>{errors.institutionName}</FieldError>}
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">
                  Description (optional)
                </span>
              </label>
              <textarea
                name="description"
                className={`textarea textarea-bordered w-full text-sm min-h-[120px] ${errors.description ? "textarea-error" : ""}`}
                placeholder="Describe the role, responsibilities, and expectations..."
                value={form.description}
                onChange={handleChange}
                maxLength={JOB_DESCRIPTION_MAX_LENGTH}
              />
              {errors.description && (
                <FieldError>{errors.description}</FieldError>
              )}
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text flex items-center gap-1.5 text-sm font-medium">
                  <Tag className="h-3.5 w-3.5" />
                  Short Job Type <span className="text-error">*</span>
                </span>
              </label>
              <select
                name="shortJobType"
                value={form.shortJobType}
                onChange={handleChange}
                className={`select select-bordered h-12 w-full text-sm ${errors.shortJobType ? "select-error" : ""}`}
              >
                {SHORT_JOB_TYPE_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.shortJobType && <FieldError>{errors.shortJobType}</FieldError>}
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-sm font-medium">
                    Duration *
                  </span>
                </label>
                <input
                  name="durationValue"
                  type="number"
                  min="0.25"
                  step={usesDailyWorkingHours(form.shortJobType) ? "1" : "0.25"}
                  value={form.durationValue}
                  onChange={handleChange}
                  className={`input input-bordered ${errors.durationValue ? "input-error" : ""}`}
                  max={form.shortJobType === "short_term" ? "7" : form.shortJobType === "weekend_only" ? "2" : "24"}
                  readOnly={form.shortJobType === "weekend_only"}
                />
                {errors.durationValue && (
                  <FieldError>{errors.durationValue}</FieldError>
                )}
                <p className="mt-1 text-[11px] text-base-content/45">
                  {getJobDurationHint(form.shortJobType)}
                </p>
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-sm font-medium">Unit</span>
                </label>
                <select
                  name="durationUnit"
                  value={form.durationUnit}
                  className="select select-bordered bg-base-200/70"
                  disabled
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
                {errors.durationUnit && <FieldError>{errors.durationUnit}</FieldError>}
              </div>
            </div>
            {usesDailyWorkingHours(form.shortJobType) && (
              <div className="form-control">
                <label className="label pb-1"><span className="label-text text-sm font-medium">Working Hours per Day <span className="text-error">*</span></span></label>
                <input
                  name="workingHoursPerDay"
                  type="number"
                  min="0.25"
                  max="24"
                  step="0.25"
                  value={calculateDurationHours(form.startTime, form.endTime)}
                  className={`input input-bordered bg-base-200/70 ${errors.workingHoursPerDay ? "input-error" : ""}`}
                  placeholder="Set start and end time"
                  required
                  readOnly
                />
                <p className="mt-1 text-[11px] text-base-content/45">Calculated automatically from the daily start and end time.</p>
                {errors.workingHoursPerDay && <FieldError>{errors.workingHoursPerDay}</FieldError>}
              </div>
            )}
            <div className="rounded-xl border border-base-300/60 bg-base-200/35 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <Clock className="h-4 w-4 text-primary" /> Daily working time
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="form-control sm:col-span-2">
                  <label className="label pb-1"><span className="label-text text-xs font-semibold">Job date <span className="text-error">*</span></span></label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                    <input name="jobDate" type="date" min={earliestJobDate} value={form.jobDate} onChange={handleChange} className={`input input-bordered h-12 w-full rounded-xl pl-10 ${errors.jobDate ? "input-error" : ""}`} required />
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
                Applicants see these times in 12-hour AM/PM format. Duration and working hours stay synchronized automatically.
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
                  Location
                </span>
              </label>
              <select
                name="location"
                className="select select-bordered w-full h-12 text-sm"
                value={form.location}
                onChange={handleChange}
              >
                {LOCATIONS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <fieldset
              disabled={form.location === "remote"}
              aria-disabled={form.location === "remote"}
              className={`rounded-2xl border border-base-300/70 bg-base-200/35 p-4 transition-opacity ${
                form.location === "remote" ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    Workplace Location
                  </h3>
                  <p className="text-xs text-base-content/45 mt-1">
                    {form.location === "remote"
                      ? "Physical workplace details are disabled for remote jobs."
                      : "Update the exact work place so applicants can check distance and directions."}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs gap-1.5"
                  onClick={handleUseCurrentLocation}
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  Use current
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  name="workplaceName"
                  className={`input input-bordered h-11 text-sm sm:col-span-2 ${errors.workplaceName ? "input-error" : ""}`}
                  placeholder="Workplace name / branch"
                  value={form.workplaceName}
                  onChange={handleChange}
                  minLength={3}
                  maxLength={50}
                  required
                />
                <input
                  type="text"
                  name="workplaceAddress"
                  className={`input input-bordered h-11 text-sm sm:col-span-2 ${errors.workplaceAddress ? "input-error" : ""}`}
                  placeholder="Full street address"
                  value={form.workplaceAddress}
                  onChange={handleChange}
                  minLength={3}
                  maxLength={100}
                  required
                />
                <input
                  type="text"
                  name="workplaceCity"
                  className={`input input-bordered h-11 text-sm ${errors.workplaceCity ? "input-error" : ""}`}
                  placeholder="City"
                  value={form.workplaceCity}
                  onChange={handleChange}
                  minLength={3}
                  maxLength={50}
                  required
                />
                <input
                  type="text"
                  name="workplaceState"
                  className={`input input-bordered h-11 text-sm ${errors.workplaceState ? "input-error" : ""}`}
                  placeholder="State"
                  value={form.workplaceState}
                  onChange={handleChange}
                  minLength={3}
                  maxLength={50}
                  required
                />
                <input
                  type="text"
                  name="workplaceCountry"
                  className={`input input-bordered h-11 text-sm ${errors.workplaceCountry ? "input-error" : ""}`}
                  placeholder="Country"
                  value={form.workplaceCountry}
                  onChange={handleChange}
                  minLength={3}
                  maxLength={50}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    name="coordinateLat"
                    className={`input input-bordered h-11 text-sm ${errors.coordinateLat ? "input-error" : ""}`}
                    placeholder="Latitude"
                    value={form.coordinateLat}
                    onChange={handleChange}
                  />
                  <input
                    type="number"
                    step="any"
                    name="coordinateLng"
                    className={`input input-bordered h-11 text-sm ${errors.coordinateLng ? "input-error" : ""}`}
                    placeholder="Longitude"
                    value={form.coordinateLng}
                    onChange={handleChange}
                  />
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
            </fieldset>

            <div className="badge badge-success badge-soft">Paid job</div>

            {/* Payout / salary */}
            {form.isPaid && (
              <div className="space-y-3">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm">
                      Payout / Salary <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="stipend"
                      className={`input input-bordered flex-1 h-12 text-sm ${errors.stipend ? "input-error" : ""}`}
                      placeholder="e.g., 100 or 100.50"
                      value={form.stipend}
                      onChange={handleChange}
                      min={JOB_PAYOUT_MIN}
                      max={JOB_PAYOUT_MAX}
                      step="0.01"
                      inputMode="decimal"
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
                  <p className="mt-1 text-[11px] text-base-content/45">
                    Whole numbers and values with up to 2 decimal places are accepted.
                  </p>
                </div>
              </div>
            )}

            {/* Required Qualifications */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">
                  Required Qualifications
                </span>
              </label>
              <QualificationMultiSelect
                value={form.requiredQualifications}
                onChange={handleChange}
                error={errors.requiredQualifications}
              />
              {errors.requiredQualifications && (
                <div id="required-qualifications-error">
                  <FieldError>{errors.requiredQualifications}</FieldError>
                </div>
              )}
            </div>

            {/* Skills Required */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">
                  Skills Required
                </span>
              </label>
              <input
                type="text"
                name="skillsRequired"
                className={`input input-bordered w-full h-12 text-sm ${errors.skillsRequired ? "input-error" : ""}`}
                placeholder="e.g., Communication, Python, Classroom Management (comma separated)"
                value={form.skillsRequired}
                onChange={handleChange}
                maxLength={258}
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
                maxLength={254}
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
                  Max Applicants (0 = unlimited)
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
                max="100"
                step="1"
              />
              {errors.maxApplicants && (
                <FieldError>{errors.maxApplicants}</FieldError>
              )}
            </div>

            {/* Active Toggle */}
            <div className="form-control">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  className="toggle toggle-primary toggle-sm"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                <span className="text-sm font-medium">
                  Accepting applications
                </span>
              </label>
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
            <div className="relative rounded-xl border border-base-300 bg-base-200/70 p-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-72 object-contain rounded-lg"
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
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
          {errors.image && <FieldError>{errors.image}</FieldError>}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pb-6">
          <button
            type="submit"
            className="btn btn-primary flex-1 h-12 text-base font-semibold shadow-lg shadow-primary/25 gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
      <ConfirmModal
        isOpen={showLocationConfirm}
        onClose={() => setShowLocationConfirm(false)}
        onConfirm={confirmUseCurrentLocation}
        title="Use Your Current Location?"
        message="ShorJob will ask your browser for location access and replace this job's workplace coordinates with your current location."
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

const ValidationSummary = ({ errors: validationErrors }) => (
  <div role="alert" className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
    <p className="font-semibold">Please correct these fields:</p>
    <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
      {validationErrors.map(({ field, message }) => (
        <li key={field}>{message}</li>
      ))}
    </ul>
  </div>
);

export default EditJob;

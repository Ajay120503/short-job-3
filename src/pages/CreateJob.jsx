import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import API from "../utils/axios";
import toast from "react-hot-toast";

const ROLE_TYPES = [
  { value: "teacher", label: "Creator" },
  { value: "professor", label: "Expert" },
  { value: "assistant", label: "Assistant" },
  { value: "research", label: "Research / Analysis" },
  { value: "intern", label: "Internship" },
  { value: "volunteer", label: "Volunteer" },
  { value: "hod", label: "Team Leadership" },
  { value: "principal", label: "Organization Leadership" },
  { value: "other", label: "Other" },
];

const LOCATIONS = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const todayInputValue = new Date().toISOString().split("T")[0];

const CreateJob = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    institutionName: "",
    roleType: "other",
    isPaid: false,
    currency: "INR",
    stipend: "",
    location: "onsite",
    requiredQualifications: "",
    skillsRequired: "",
    deadline: "",
    contactEmail: "",
    maxApplicants: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
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
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Job title is required.";
    if (form.title.trim().length > 120) nextErrors.title = "Job title is too long.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (form.description.trim().length < 30) {
      nextErrors.description = "Add at least 30 characters so applicants understand the role.";
    }
    if (!form.deadline) nextErrors.deadline = "Application deadline is required.";
    if (form.deadline && form.deadline < todayInputValue) {
      nextErrors.deadline = "Deadline cannot be in the past.";
    }
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
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("roleType", form.roleType);
    formData.append("isPaid", form.isPaid);
    formData.append("location", form.location);
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
      const message = err.response?.data?.message || "Failed to create job.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
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
                required
              />
              {errors.title && <FieldError>{errors.title}</FieldError>}
            </div>

            {/* Organization Name */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Organization Name
                </span>
              </label>
              <input
                type="text"
                name="institutionName"
                className="input input-bordered w-full h-12 text-sm"
                placeholder="e.g., Delhi Public School"
                value={form.institutionName}
                onChange={handleChange}
              />
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
                required
              />
              {errors.description && <FieldError>{errors.description}</FieldError>}
            </div>

            {/* Opportunity Type */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Opportunity Type
                </span>
              </label>
              <select
                name="roleType"
                className="select select-bordered w-full h-12 text-sm"
                value={form.roleType}
                onChange={handleChange}
              >
                {ROLE_TYPES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
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
                      Stipend / Salary
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
                  Required Qualifications
                </span>
              </label>
              <textarea
                name="requiredQualifications"
                className="textarea textarea-bordered w-full text-sm min-h-[80px]"
                placeholder="e.g., B.Ed, M.Sc, CTET qualified..."
                value={form.requiredQualifications}
                onChange={handleChange}
              />
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
                className="input input-bordered w-full h-12 text-sm"
                placeholder="e.g., Communication, Python, Classroom Management (comma separated)"
                value={form.skillsRequired}
                onChange={handleChange}
              />
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
                required
              />
              {errors.contactEmail && <FieldError>{errors.contactEmail}</FieldError>}
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
              />
              {errors.maxApplicants && <FieldError>{errors.maxApplicants}</FieldError>}
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
                accept="image/*"
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
    </div>
  );
};

const FieldError = ({ children }) => (
  <p className="mt-1 text-xs font-medium text-error">{children}</p>
);

export default CreateJob;

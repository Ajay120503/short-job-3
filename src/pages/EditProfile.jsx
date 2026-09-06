import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, X, Upload } from "lucide-react";
import useAuthStore from "../store/authStore";
import API from "../utils/axios";
import toast from "../utils/toast";
import { getCreationError } from "../utils/creationErrors";
import {
  PROFILE_LIMITS,
  PROFILE_LIST_MAX_INPUT_LENGTH,
  validateProfileText,
} from "../utils/profileValidation";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const calculateAge = (dateValue) => {
  if (!dateValue) return "";
  const birthDate = new Date(dateValue);
  if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) return "";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return Math.max(age, 0);
};

const minimumAgeDate = (() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().split("T")[0];
})();
const maximumAgeDate = (() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 60);
  return date.toISOString().split("T")[0];
})();

const EditProfile = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    age: user?.age || "",
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    institutionName: user?.institutionName || "",
    city: user?.city || "",
    state: user?.state || "",
    address: user?.address || "",
    educationLevel: user?.educationLevel || "",
    subject: user?.subject || "",
    experience: user?.experience || "",
    skills: user?.skills?.join(", ") || "",
    qualifications: user?.qualifications?.join(", ") || "",
    profession: user?.profession || "",
    isCurrentlyWorking: user?.isCurrentlyWorking || false,
    currentPosition: user?.currentPosition || "",
    currentCompany: user?.currentCompany || "",
    previousWork: user?.previousWork || "",
    interests: user?.interests?.join(", ") || "",
    linkedinUrl: user?.linkedinUrl || "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [institutionPic, setInstitutionPic] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePic?.url || "");
  const [institutionPreview, setInstitutionPreview] = useState(
    user?.institutionPic?.url || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;
    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
      ...(name === "dateOfBirth" ? { age: calculateAge(nextValue) } : {}),
    }));
    setErrors((prev) => ({ ...prev, [name]: "", server: "" }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_PROFILE_IMAGE_TYPES.has(file.type)) {
      setErrors((prev) => ({ ...prev, profilePic: "Upload a JPG, PNG, GIF, or WebP image." }));
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((prev) => ({ ...prev, profilePic: "Profile photo must be under 5MB." }));
      return;
    }
    setErrors((prev) => ({ ...prev, profilePic: "" }));
    setProfilePic(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleInstitutionPicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_PROFILE_IMAGE_TYPES.has(file.type)) {
      setErrors((prev) => ({ ...prev, institutionPic: "Upload a JPG, PNG, GIF, or WebP image." }));
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((prev) => ({ ...prev, institutionPic: "Logo must be under 5MB." }));
      return;
    }
    setErrors((prev) => ({ ...prev, institutionPic: "" }));
    setInstitutionPic(file);
    setInstitutionPreview(URL.createObjectURL(file));
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setErrors((prev) => ({ ...prev, resume: "Upload a PDF file only." }));
      e.target.value = "";
      return;
    }
    if (file.size > MAX_RESUME_SIZE) {
      setErrors((prev) => ({ ...prev, resume: "CV must be 5MB or smaller." }));
      return;
    }
    setErrors((prev) => ({ ...prev, resume: "" }));
    setResumeFile(file);
  };

  const validateForm = () => {
    const nextErrors = validateProfileText(form, { includeName: true });
    if (form.dateOfBirth) {
      const calculatedAge = calculateAge(form.dateOfBirth);
      if (calculatedAge === "") nextErrors.dateOfBirth = "Choose a valid past date.";
      if (calculatedAge !== "" && calculatedAge < 18) {
        nextErrors.dateOfBirth = "You must be at least 18 years old to use ShortJob.";
      } else if (calculatedAge !== "" && calculatedAge > 60) {
        nextErrors.dateOfBirth = "Age cannot be greater than 60.";
      }
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
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value)
      );
      if (profilePic) formData.append("profilePic", profilePic);
      if (institutionPic) formData.append("institutionPic", institutionPic);
      if (resumeFile) formData.append("resume", resumeFile);

      const { data } = await API.put(`/users/${user._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(data.user);
      toast.success("Profile updated!");
      navigate(`/profile/${user._id}`);
    } catch (err) {
      const result = getCreationError(err, "The profile could not be updated.");
      const fieldErrors = result.errors;
      setErrors((prev) => ({ ...prev, ...fieldErrors, server: result.message }));
      if (fieldErrors?.age) {
        setErrors((prev) => ({ ...prev, dateOfBirth: fieldErrors.age }));
      }
      toast.error(result.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 pb-20">
      <h1 className="text-2xl font-bold font-heading mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.server && <ErrorSummary message={errors.server} />}
        {/* Profile Picture */}
        <div className="card bg-base-100 border border-base-300/50 p-4">
          <h3 className="font-semibold text-sm mb-3">Profile Picture</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-placeholder overflow-hidden ring-4 ring-base-200">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-base-content/40 text-4xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setProfilePic(null);
                    setPreviewUrl("");
                  }}
                  className="absolute -top-1 -right-1 btn btn-circle btn-xs btn-error shadow"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <label className="btn btn-outline btn-sm gap-2 cursor-pointer">
              <Camera className="w-4 h-4" />{" "}
              {previewUrl ? "Change" : "Add Photo"}
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleProfilePicChange}
              />
            </label>
          </div>
          {errors.profilePic && <FieldError>{errors.profilePic}</FieldError>}
        </div>

        {/* Institution Picture */}
        <div className="card bg-base-100 border border-base-300/50 p-4">
          <h3 className="font-semibold text-sm mb-3">Institution Logo</h3>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl bg-base-200 overflow-hidden ring-2 ring-base-300 flex items-center justify-center">
              {institutionPreview ? (
                <img
                  src={institutionPreview}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-base-content/20 text-xs">No logo</div>
              )}
            </div>
            <label className="btn btn-outline btn-sm gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />{" "}
              {institutionPreview ? "Change" : "Upload"}
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleInstitutionPicChange}
              />
            </label>
          </div>
          {errors.institutionPic && (
            <FieldError>{errors.institutionPic}</FieldError>
          )}
        </div>

        {/* Basic Info */}
        <div className="card bg-base-100 border border-base-300/50 p-4">
          <h3 className="font-semibold text-sm mb-3">Basic Information</h3>
          <div className="space-y-3">
            <div className="form-control">
              <label className="label py-0 pb-1">
                <span className="label-text text-xs font-medium">
                  Full Name
                </span>
              </label>
              <input
                name="name"
                className={`input input-bordered w-full input-sm text-sm ${errors.name ? "input-error" : ""}`}
                value={form.name}
                onChange={handleChange}
                minLength={3}
                maxLength={PROFILE_LIMITS.name}
                required
              />
              <span className="label-text-alt text-base-content/40">
                {form.name.length}/{PROFILE_LIMITS.name} characters · letters
                and standard name punctuation only
              </span>
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </div>
            <div className="form-control">
              <label className="label py-0 pb-1">
                <span className="label-text text-xs font-medium">Bio</span>
              </label>
              <textarea
                name="bio"
                className={`textarea textarea-bordered w-full textarea-sm text-sm ${errors.bio ? "textarea-error" : ""}`}
                rows={2}
                maxLength={PROFILE_LIMITS.bio}
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
              />
              <span className="label-text-alt text-base-content/40">
                {form.bio.length}/{PROFILE_LIMITS.bio} characters
              </span>
              {errors.bio && <FieldError>{errors.bio}</FieldError>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label py-0 pb-1">
                  <span className="label-text text-xs font-medium">Age</span>
                </label>
                <input
                  name="age"
                  type="number"
                  className="input input-bordered w-full input-sm text-sm bg-base-200/70"
                  value={form.age}
                  readOnly
                  min="18"
                  max="60"
                  required
                  placeholder="Auto"
                />
                <p className="mt-1 text-[11px] text-base-content/40">
                  Calculated from date of birth.
                </p>
              </div>
              <div className="form-control">
                <label className="label py-0 pb-1">
                  <span className="label-text text-xs font-medium">
                    Date of Birth
                  </span>
                </label>
                <input
                  name="dateOfBirth"
                  type="date"
                  className={`input input-bordered w-full input-sm text-sm ${errors.dateOfBirth ? "input-error" : ""}`}
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  min={maximumAgeDate}
                  max={minimumAgeDate}
                  required
                />
                {errors.dateOfBirth && (
                  <FieldError>{errors.dateOfBirth}</FieldError>
                )}
              </div>
            </div>
            <div className="form-control">
              <label className="label py-0 pb-1">
                <span className="label-text text-xs font-medium">
                  Profession
                </span>
              </label>
              <input
                name="profession"
                className={`input input-bordered w-full input-sm text-sm ${errors.profession ? "input-error" : ""}`}
                value={form.profession}
                onChange={handleChange}
                maxLength={PROFILE_LIMITS.profession}
                placeholder="e.g. Part-time Tutor"
              />
              {errors.profession && (
                <FieldError>{errors.profession}</FieldError>
              )}
            </div>
            <div className="form-control rounded-lg bg-base-200/50 p-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isCurrentlyWorking"
                  className="checkbox checkbox-primary checkbox-sm"
                  checked={form.isCurrentlyWorking}
                  onChange={handleChange}
                />
                <span className="text-sm font-medium">
                  I am currently working somewhere
                </span>
              </label>
            </div>
            {form.isCurrentlyWorking && (
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-0 pb-1">
                    <span className="label-text text-xs font-medium">
                      Current Position
                    </span>
                  </label>
                  <input
                    name="currentPosition"
                    className={`input input-bordered w-full input-sm text-sm ${errors.currentPosition ? "input-error" : ""}`}
                    value={form.currentPosition}
                    onChange={handleChange}
                    maxLength={PROFILE_LIMITS.currentPosition}
                    placeholder="e.g. Product Trainer"
                  />
                  {errors.currentPosition && (
                    <FieldError>{errors.currentPosition}</FieldError>
                  )}
                </div>
                <div className="form-control">
                  <label className="label py-0 pb-1">
                    <span className="label-text text-xs font-medium">
                      Current Workplace
                    </span>
                  </label>
                  <input
                    name="currentCompany"
                    className={`input input-bordered w-full input-sm text-sm ${errors.currentCompany ? "input-error" : ""}`}
                    value={form.currentCompany}
                    onChange={handleChange}
                    maxLength={PROFILE_LIMITS.currentCompany}
                    placeholder="e.g. DPS Pune"
                  />
                  {errors.currentCompany && (
                    <FieldError>{errors.currentCompany}</FieldError>
                  )}
                </div>
              </div>
            )}
            <div className="form-control">
              <label className="label py-0 pb-1">
                <span className="label-text text-xs font-medium">
                  Previous Work
                </span>
              </label>
              <textarea
                name="previousWork"
                className={`textarea textarea-bordered w-full textarea-sm text-sm ${errors.previousWork ? "textarea-error" : ""}`}
                rows={3}
                value={form.previousWork}
                onChange={handleChange}
                maxLength={PROFILE_LIMITS.previousWork}
                placeholder="Previous roles, organizations, internships, or projects..."
              />
              {errors.previousWork && (
                <FieldError>{errors.previousWork}</FieldError>
              )}
            </div>
          </div>
        </div>

        {/* Background & Organization */}
        <div className="card bg-base-100 border border-base-300/50 p-4">
          <h3 className="font-semibold text-sm mb-3">
            Background & Organization
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label py-0 pb-1">
                <span className="label-text text-xs font-medium">
                  Organization
                </span>
              </label>
              <input
                name="institutionName"
                className={`input input-bordered w-full input-sm text-sm ${errors.institutionName ? "input-error" : ""}`}
                value={form.institutionName}
                onChange={handleChange}
                maxLength={PROFILE_LIMITS.institutionName}
                placeholder="e.g. IIT Delhi"
              />
              {errors.institutionName && (
                <FieldError>{errors.institutionName}</FieldError>
              )}
            </div>
            <div className="form-control">
              <label className="label py-0 pb-1">
                <span className="label-text text-xs font-medium">
                  Background Level
                </span>
              </label>
              <select
                name="educationLevel"
                className="select select-bordered w-full select-sm text-sm"
                value={form.educationLevel}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="10th">10th</option>
                <option value="12th">12th</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="postgraduate">Postgraduate</option>
                <option value="phd">PhD</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label py-0 pb-1">
                <span className="label-text text-xs font-medium">Subject</span>
              </label>
              <input
                name="subject"
                className={`input input-bordered w-full input-sm text-sm ${errors.subject ? "input-error" : ""}`}
                value={form.subject}
                onChange={handleChange}
                maxLength={PROFILE_LIMITS.subject}
                placeholder="e.g. Mathematics"
              />
              {errors.subject && <FieldError>{errors.subject}</FieldError>}
            </div>
            <div className="form-control">
              <label className="label py-0 pb-1">
                <span className="label-text text-xs font-medium">
                  Experience (years)
                </span>
              </label>
              <input
                name="experience"
                type="number"
                className={`input input-bordered w-full input-sm text-sm ${errors.experience ? "input-error" : ""}`}
                value={form.experience}
                onChange={handleChange}
                min="0"
                max="80"
              />
              {errors.experience && (
                <FieldError>{errors.experience}</FieldError>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="form-control">
              <label className="label py-0 pb-1">
                <span className="label-text text-xs font-medium">
                  Skills (comma separated)
                </span>
              </label>
              <input
                name="skills"
                className={`input input-bordered w-full input-sm text-sm ${errors.skills ? "input-error" : ""}`}
                value={form.skills}
                onChange={handleChange}
                maxLength={PROFILE_LIST_MAX_INPUT_LENGTH}
                placeholder="Python, Teaching"
              />
              {errors.skills && <FieldError>{errors.skills}</FieldError>}
            </div>
            <div className="form-control">
              <label className="label py-0 pb-1">
                <span className="label-text text-xs font-medium">
                  Qualifications (comma separated)
                </span>
              </label>
              <input
                name="qualifications"
                className={`input input-bordered w-full input-sm text-sm ${errors.qualifications ? "input-error" : ""}`}
                value={form.qualifications}
                onChange={handleChange}
                maxLength={PROFILE_LIST_MAX_INPUT_LENGTH}
                placeholder="B.Tech, M.Sc"
              />
              {errors.qualifications && (
                <FieldError>{errors.qualifications}</FieldError>
              )}
            </div>
          </div>
        </div>

        {/* Location & Links */}
        <div className="card bg-base-100 border border-base-300/50 p-4">
          <h3 className="font-semibold text-sm mb-3">Location & Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label py-0 pb-1">
                <span className="label-text text-xs font-medium">City</span>
              </label>
              <input
                name="city"
                className={`input input-bordered w-full input-sm text-sm ${errors.city ? "input-error" : ""}`}
                value={form.city}
                onChange={handleChange}
                maxLength={PROFILE_LIMITS.city}
                placeholder="e.g. Mumbai"
              />
              {errors.city && <FieldError>{errors.city}</FieldError>}
            </div>
            <div className="form-control">
              <label className="label py-0 pb-1">
                <span className="label-text text-xs font-medium">State</span>
              </label>
              <input
                name="state"
                className={`input input-bordered w-full input-sm text-sm ${errors.state ? "input-error" : ""}`}
                value={form.state}
                onChange={handleChange}
                maxLength={PROFILE_LIMITS.state}
                placeholder="e.g. Maharashtra"
              />
              {errors.state && <FieldError>{errors.state}</FieldError>}
            </div>
            <div className="form-control col-span-2">
              <label className="label py-0 pb-1">
                <span className="label-text text-xs font-medium">Address</span>
              </label>
              <input
                name="address"
                className={`input input-bordered w-full input-sm text-sm ${errors.address ? "input-error" : ""}`}
                value={form.address}
                onChange={handleChange}
                maxLength={PROFILE_LIMITS.address}
                placeholder="Street, Locality"
              />
              {errors.address && (
                <p className="mt-1 text-xs text-error">{errors.address}</p>
              )}
            </div>
            <div className="form-control col-span-2">
              <label className="label py-0 pb-1">
                <span className="label-text text-xs font-medium">
                  LinkedIn URL
                </span>
              </label>
              <input
                name="linkedinUrl"
                type="url"
                className={`input input-bordered w-full input-sm text-sm ${errors.linkedinUrl ? "input-error" : ""}`}
                value={form.linkedinUrl}
                onChange={handleChange}
                maxLength={PROFILE_LIMITS.linkedinUrl}
                placeholder="https://linkedin.com/in/yourprofile"
              />
              {errors.linkedinUrl && (
                <FieldError>{errors.linkedinUrl}</FieldError>
              )}
            </div>
            <div className="form-control col-span-2">
              <label className="label py-0 pb-1">
                <span className="label-text text-xs font-medium">
                  Interests (comma separated)
                </span>
              </label>
              <input
                name="interests"
                className={`input input-bordered w-full input-sm text-sm ${errors.interests ? "input-error" : ""}`}
                value={form.interests}
                onChange={handleChange}
                maxLength={PROFILE_LIST_MAX_INPUT_LENGTH}
                placeholder="Research, Sports, Music"
              />
              {errors.interests && <FieldError>{errors.interests}</FieldError>}
            </div>
          </div>
        </div>

        {/* Resume Upload */}
        <div className="card bg-base-100 border border-base-300/50 p-4">
          <h3 className="font-semibold text-sm mb-3">CV</h3>
          <div className="flex items-center gap-4">
            {user?.resumeUrl && (
              <a
                href={user.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary underline truncate max-w-[200px]"
              >
                Current resume
              </a>
            )}
            <label className="btn btn-outline btn-sm gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              {resumeFile
                ? resumeFile.name
                : user?.resumeUrl
                  ? "Replace"
                  : "Upload PDF"}
              <input
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={handleResumeChange}
              />
            </label>
          </div>
          {errors.resume && <FieldError>{errors.resume}</FieldError>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-full shadow-lg shadow-primary/20"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
};

const FieldError = ({ children }) => (
  <p className="mt-1 text-xs font-medium text-error">{children}</p>
);

const ErrorSummary = ({ message }) => (
  <div role="alert" className="alert alert-error text-sm"><span>{message}</span></div>
);

export default EditProfile;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Link as LinkIcon,
  MapPin,
  Sparkles,
  Upload,
  UserRound,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import API from "../utils/axios";
import AuthLayout from "../components/auth/AuthLayout";
import toast from "../utils/toast";
import { getCreationError } from "../utils/creationErrors";
import {
  PROFILE_LIMITS,
  PROFILE_LIST_MAX_INPUT_LENGTH,
  validateProfileText,
} from "../utils/profileValidation";

const steps = [
  { key: "details", label: "Your details" },
  { key: "background", label: "Experience & skills" },
  { key: "organization", label: "Your organization" },
];

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
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

/**
 * Profile completion wizard after OTP/email verification.
 */
const CompleteProfile = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    bio: user?.bio || "",
    address: user?.address || "",
    age: user?.age || "",
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    city: user?.city || "",
    state: user?.state || "",
    institutionName: user?.institutionName || "",
    institutionType: user?.institutionType || "",
    skills: user?.skills?.join(", ") || "",
    qualifications: user?.qualifications?.join(", ") || "",
    educationLevel: user?.educationLevel || "",
    subject: user?.subject || "",
    experience: user?.experience || 0,
    profession: user?.profession || "",
    isCurrentlyWorking: user?.isCurrentlyWorking || false,
    currentPosition: user?.currentPosition || "",
    currentCompany: user?.currentCompany || "",
    previousWork: user?.previousWork || "",
    linkedinUrl: user?.linkedinUrl || "",
    profilePic: null,
  });

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(
    user?.profilePic?.url || "",
  );
  const [errors, setErrors] = useState({});

  // If user already has profile basics and is verified, skip wizard
  useEffect(() => {
    if (user?.isVerified && Number(user?.age) >= 18 && (user?.bio || user?.profilePic?.url)) {
      navigate("/feed");
    }
  }, [user, navigate]);

  // ── Profile pic upload ──
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setErrors((prev) => ({ ...prev, profilePic: "Upload a JPG, PNG, GIF, or WebP image." }));
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((prev) => ({ ...prev, profilePic: "Profile photo must be under 5MB." }));
      e.target.value = "";
      return;
    }
    setErrors((prev) => ({ ...prev, profilePic: "" }));
    setProfilePicFile(file);
    setProfilePicPreview(URL.createObjectURL(file));
  };

  // ── Form handlers ──
  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "dateOfBirth" ? { age: calculateAge(value) } : {}),
    }));
    setErrors((prev) => ({ ...prev, [field]: "", server: "" }));
  };

  const validateStep = (targetStep = step) => {
    const allProfileErrors = validateProfileText(formData);
    const stepFields = targetStep === 0
      ? ["bio", "address", "city", "state", "linkedinUrl"]
      : targetStep === 1
        ? ["subject", "skills", "qualifications", "experience", "profession", "currentPosition", "currentCompany", "previousWork"]
        : ["institutionName"];
    const nextErrors = Object.fromEntries(
      Object.entries(allProfileErrors).filter(([field]) => stepFields.includes(field)),
    );
    if (targetStep === 0) {
      if (!formData.dateOfBirth) {
        nextErrors.dateOfBirth = "Date of birth is required to confirm you are 18 or older.";
      } else {
        const age = calculateAge(formData.dateOfBirth);
        if (age === "") nextErrors.dateOfBirth = "Choose a valid past date.";
        if (age !== "" && age < 18) {
          nextErrors.dateOfBirth = "You must be at least 18 years old to use ShortJob.";
        } else if (age !== "" && age > 100) {
          nextErrors.dateOfBirth = "Age must be 100 years or less.";
        }
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));
  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    const age = calculateAge(formData.dateOfBirth);
    if (age === "" || age < 18 || age > 100) {
      setErrors({
        dateOfBirth:
          age !== "" && age < 18
            ? "You must be at least 18 years old to use ShortJob."
            : "Enter a valid date of birth for an age between 18 and 100.",
      });
      setStep(0);
      toast.error("You must confirm that you are 18 or older.");
      return;
    }
    if (!validateStep()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      // 1. Save profile data via /api/users/:id (multipart for profile pic)
      const profileFormData = new FormData();
      profileFormData.append("name", user?.name || "");
      profileFormData.append("bio", formData.bio);
      profileFormData.append("address", formData.address);
      profileFormData.append("age", formData.age);
      profileFormData.append("dateOfBirth", formData.dateOfBirth);
      profileFormData.append("city", formData.city);
      profileFormData.append("state", formData.state);
      profileFormData.append("institutionName", formData.institutionName);
      profileFormData.append("institutionType", formData.institutionType);
      profileFormData.append("skills", formData.skills);
      profileFormData.append("qualifications", formData.qualifications);
      profileFormData.append("educationLevel", formData.educationLevel);
      profileFormData.append("subject", formData.subject);
      profileFormData.append("experience", formData.experience);
      profileFormData.append("profession", formData.profession);
      profileFormData.append("isCurrentlyWorking", formData.isCurrentlyWorking);
      profileFormData.append("currentPosition", formData.currentPosition);
      profileFormData.append("currentCompany", formData.currentCompany);
      profileFormData.append("previousWork", formData.previousWork);
      profileFormData.append("linkedinUrl", formData.linkedinUrl);

      if (profilePicFile) {
        profileFormData.append("profilePic", profilePicFile);
      }

      const { data: profileData } = await API.put(
        `/users/${user._id}`,
        profileFormData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (profileData.user) {
        setUser(profileData.user);
      }

      toast.success("Profile completed successfully!");
      navigate("/feed");
    } catch (err) {
      const result = getCreationError(err, "The profile could not be completed.");
      const mappedErrors = { ...result.errors, server: result.message };
      if (mappedErrors.age) mappedErrors.dateOfBirth = mappedErrors.age;
      setErrors(mappedErrors);
      const firstField = Object.keys(result.errors)[0];
      if (["bio", "address", "city", "state", "linkedinUrl", "age", "dateOfBirth"].includes(firstField)) setStep(0);
      else if (["subject", "skills", "qualifications", "experience", "profession", "currentPosition", "currentCompany", "previousWork"].includes(firstField)) setStep(1);
      else if (firstField) setStep(2);
      toast.error(result.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-6 grid grid-cols-3 gap-2">
      {steps.map((s, idx) => (
        <button
          key={s.key}
          type="button"
          onClick={() => {
            if (idx <= step || validateStep()) setStep(idx);
          }}
          className={`rounded-xl border p-3 text-left transition-all ${
            idx === step
              ? "border-primary bg-primary/10 text-primary"
              : idx < step
                ? "border-success/25 bg-success/10 text-success"
                : "border-base-300 bg-base-100 text-base-content/55"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                idx <= step ? "bg-current/10" : "bg-base-200"
              }`}
            >
              {idx < step ? (
                <Check className="w-4 h-4" />
              ) : (
                idx + 1
              )}
            </span>
            <span className="min-w-0 text-xs font-semibold leading-tight">
              {s.label}
            </span>
          </div>
        </button>
      ))}
    </div>
  );

  // ── Step 1: Details ──
  const renderDetailsStep = () => (
    <div className="space-y-4">
      <SectionTitle
        icon={UserRound}
        title="Your details"
        description="Add the basics people will see on your profile."
      />

      {/* Profile picture */}
      <div className="flex items-center gap-4 rounded-2xl border border-base-300/70 bg-base-200/35 p-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-base-100 ring-4 ring-base-300/45">
            {profilePicPreview ? (
              <img
                src={profilePicPreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base-content/25">
                <UserRound className="w-8 h-8" />
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 btn btn-xs btn-circle btn-primary">
            <Upload className="w-3 h-3" />
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleProfilePicChange}
            />
          </label>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">Profile photo</p>
          <p className="text-xs text-base-content/50">
            Upload a clear image under 5MB.
          </p>
          {errors.profilePic && <FieldError>{errors.profilePic}</FieldError>}
        </div>
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">Bio</span>
        </label>
        <textarea
          rows={3}
          className="textarea textarea-bordered w-full text-sm"
          placeholder="Tell us about yourself..."
          maxLength={PROFILE_LIMITS.bio}
          value={formData.bio}
          onChange={(e) => updateField("bio", e.target.value)}
        />
        <span className="label-text-alt text-base-content/40">
          {formData.bio.length}/{PROFILE_LIMITS.bio}
        </span>
        {errors.bio && <FieldError>{errors.bio}</FieldError>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text font-medium text-sm">Date of Birth</span>
          </label>
          <input
            type="date"
            className={`input input-bordered w-full input-sm ${errors.dateOfBirth ? "input-error" : ""}`}
            max={minimumAgeDate}
            required
            value={formData.dateOfBirth}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
          />
          {errors.dateOfBirth && <FieldError>{errors.dateOfBirth}</FieldError>}
        </div>
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text font-medium text-sm">Age</span>
          </label>
          <input
            type="number"
            className="input input-bordered w-full input-sm bg-base-200/70"
            value={formData.age}
            readOnly
            placeholder="Auto"
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Address
          </span>
        </label>
        <input
          type="text"
          className={`input input-bordered w-full input-sm ${errors.address ? "input-error" : ""}`}
          placeholder="Street, Locality"
          value={formData.address}
          onChange={(e) => updateField("address", e.target.value)}
          maxLength={PROFILE_LIMITS.address}
        />
        {errors.address && (
          <p className="mt-1 text-xs text-error">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text font-medium text-sm">City</span>
          </label>
          <input
            type="text"
            className={`input input-bordered w-full input-sm ${errors.city ? "input-error" : ""}`}
            placeholder="City"
          value={formData.city}
          onChange={(e) => updateField("city", e.target.value)}
          maxLength={PROFILE_LIMITS.city}
          />
          {errors.city && <FieldError>{errors.city}</FieldError>}
        </div>
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text font-medium text-sm">State</span>
          </label>
          <input
            type="text"
            className={`input input-bordered w-full input-sm ${errors.state ? "input-error" : ""}`}
            placeholder="State"
          value={formData.state}
          onChange={(e) => updateField("state", e.target.value)}
          maxLength={PROFILE_LIMITS.state}
          />
          {errors.state && <FieldError>{errors.state}</FieldError>}
        </div>
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5" />
            LinkedIn URL
          </span>
        </label>
        <input
          type="url"
          className={`input input-bordered w-full input-sm ${errors.linkedinUrl ? "input-error" : ""}`}
          placeholder="https://linkedin.com/in/yourprofile"
          value={formData.linkedinUrl}
          onChange={(e) => updateField("linkedinUrl", e.target.value)}
          maxLength={PROFILE_LIMITS.linkedinUrl}
        />
        {errors.linkedinUrl && <FieldError>{errors.linkedinUrl}</FieldError>}
      </div>
    </div>
  );

  // ── Step 2: Background & Skills ──
  const renderEducationStep = () => (
    <div className="space-y-4">
      <SectionTitle
        icon={Sparkles}
        title="Experience & skills"
        description="Show what you do, what you know, and how people can evaluate you."
      />

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">
            Learning level
          </span>
        </label>
        <select
          className="select select-bordered w-full select-sm"
          value={formData.educationLevel}
          onChange={(e) => updateField("educationLevel", e.target.value)}
        >
          <option value="">Select</option>
          <option value="10th">Secondary</option>
          <option value="12th">Higher secondary</option>
          <option value="undergraduate">Undergraduate</option>
          <option value="postgraduate">Postgraduate</option>
          <option value="phd">Doctorate</option>
        </select>
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">Focus area</span>
        </label>
        <input
          type="text"
          className={`input input-bordered w-full input-sm ${errors.subject ? "input-error" : ""}`}
          placeholder="e.g. Design, Operations, Marketing"
          value={formData.subject}
          onChange={(e) => updateField("subject", e.target.value)}
          maxLength={PROFILE_LIMITS.subject}
        />
        {errors.subject && <FieldError>{errors.subject}</FieldError>}
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">
            Skills (comma separated)
          </span>
        </label>
        <input
          type="text"
          className={`input input-bordered w-full input-sm ${errors.skills ? "input-error" : ""}`}
          placeholder="e.g. Python, Design, React"
          value={formData.skills}
          onChange={(e) => updateField("skills", e.target.value)}
          maxLength={PROFILE_LIST_MAX_INPUT_LENGTH}
        />
        {errors.skills && <FieldError>{errors.skills}</FieldError>}
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">
            Qualifications (comma separated)
          </span>
        </label>
        <input
          type="text"
          className={`input input-bordered w-full input-sm ${errors.qualifications ? "input-error" : ""}`}
          placeholder="e.g. B.Tech, M.Sc"
          value={formData.qualifications}
          onChange={(e) => updateField("qualifications", e.target.value)}
          maxLength={PROFILE_LIST_MAX_INPUT_LENGTH}
        />
        {errors.qualifications && <FieldError>{errors.qualifications}</FieldError>}
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">
            Experience (years)
          </span>
        </label>
        <input
          type="number"
          className={`input input-bordered w-full input-sm ${errors.experience ? "input-error" : ""}`}
          placeholder="0"
          min="0"
          max="80"
          value={formData.experience}
          onChange={(e) =>
            updateField("experience", parseInt(e.target.value) || 0)
          }
        />
        {errors.experience && <FieldError>{errors.experience}</FieldError>}
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">Current role headline</span>
        </label>
        <input
          type="text"
          className={`input input-bordered w-full input-sm ${errors.profession ? "input-error" : ""}`}
          placeholder="e.g. Product designer, Operations intern"
          value={formData.profession}
          onChange={(e) => updateField("profession", e.target.value)}
          maxLength={PROFILE_LIMITS.profession}
        />
        {errors.profession && <FieldError>{errors.profession}</FieldError>}
      </div>

      <div className="rounded-2xl border border-base-300/60 bg-base-200/30 p-4 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="checkbox checkbox-primary checkbox-sm"
            checked={formData.isCurrentlyWorking}
            onChange={(e) =>
              updateField("isCurrentlyWorking", e.target.checked)
            }
          />
          <span className="text-sm font-medium">
            I am currently working somewhere
          </span>
        </label>

        {formData.isCurrentlyWorking && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">
                  Current Position
                </span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full input-sm ${errors.currentPosition ? "input-error" : ""}`}
                placeholder="e.g. Assistant Manager"
                value={formData.currentPosition}
                onChange={(e) => updateField("currentPosition", e.target.value)}
                maxLength={PROFILE_LIMITS.currentPosition}
              />
              {errors.currentPosition && <FieldError>{errors.currentPosition}</FieldError>}
            </div>
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">
                  Current Workplace
                </span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full input-sm ${errors.currentCompany ? "input-error" : ""}`}
                placeholder="e.g. Acme Studio"
                value={formData.currentCompany}
                onChange={(e) => updateField("currentCompany", e.target.value)}
                maxLength={PROFILE_LIMITS.currentCompany}
              />
              {errors.currentCompany && <FieldError>{errors.currentCompany}</FieldError>}
            </div>
          </div>
        )}

        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text font-medium text-sm">
              Previous Work
            </span>
          </label>
          <textarea
            rows={3}
            className={`textarea textarea-bordered w-full text-sm ${errors.previousWork ? "textarea-error" : ""}`}
            placeholder="Previous roles, organizations, internships, or projects..."
            value={formData.previousWork}
            onChange={(e) => updateField("previousWork", e.target.value)}
            maxLength={PROFILE_LIMITS.previousWork}
          />
          {errors.previousWork && <FieldError>{errors.previousWork}</FieldError>}
        </div>
      </div>
    </div>
  );

  // ── Step 3: Organization ──
  const renderInstitutionStep = () => (
    <div className="space-y-4">
      <SectionTitle
        icon={Building2}
        title="Organization"
        description="Optional details that help others understand your professional context."
      />

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">
            Organization Type
          </span>
        </label>
        <select
          className="select select-bordered w-full select-sm"
          value={formData.institutionType}
          onChange={(e) => updateField("institutionType", e.target.value)}
        >
          <option value="">Select organization type</option>
          <option value="school">Company / Organization</option>
          <option value="college">Network</option>
          <option value="university">Community</option>
          <option value="coaching">Program</option>
        </select>
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">
            Organization Name
          </span>
        </label>
        <input
          type="text"
          className={`input input-bordered w-full input-sm ${errors.institutionName ? "input-error" : ""}`}
          placeholder="e.g. Acme Studio"
          value={formData.institutionName}
          onChange={(e) => updateField("institutionName", e.target.value)}
          maxLength={PROFILE_LIMITS.institutionName}
        />
        {errors.institutionName && <FieldError>{errors.institutionName}</FieldError>}
      </div>
    </div>
  );

  return (
    <AuthLayout
      title="Complete your profile"
      subtitle={`Step ${step + 1} of ${steps.length}. Add the profile details that help others trust and understand your work.`}
      badge="Profile setup"
      panelClassName="max-w-3xl"
    >
      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.server && <ErrorSummary message={errors.server} />}
        {step === 0 && renderDetailsStep()}
        {step === 1 && renderEducationStep()}
        {step === 2 && renderInstitutionStep()}

        <div className="border-t border-base-200 pt-5">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-outline flex-1 gap-2"
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
              )}
              {step === steps.length - 1 ? (
                <button
                  type="submit"
                  className="btn btn-primary flex-1 gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      Complete Profile
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary flex-1 gap-2"
                  disabled={loading}
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-base-content/45 sm:text-left">
            ShortJob is available only to users who are 18 years of age or
            older.
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

const SectionTitle = ({ icon: Icon, title, description }) => (
  <div className="rounded-2xl border border-base-300/70 bg-base-200/35 p-4">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="font-bold font-heading">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-base-content/55">
          {description}
        </p>
      </div>
    </div>
  </div>
);

const FieldError = ({ children }) => (
  <p className="mt-1 text-xs font-medium text-error">{children}</p>
);

const ErrorSummary = ({ message }) => (
  <div role="alert" className="alert alert-error text-sm"><span>{message}</span></div>
);

export default CompleteProfile;

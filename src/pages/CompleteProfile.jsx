import { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Upload } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import useAuthStore from "../store/authStore";
import API from "../utils/axios";
import toast from "react-hot-toast";

const steps = [
  { key: "details", label: "Your details" },
  { key: "background", label: "Background & skills" },
  { key: "organization", label: "Your organization" },
];

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

  // If user already has profile basics and is verified, skip wizard
  useEffect(() => {
    if (user?.isVerified && (user?.bio || user?.profilePic?.url)) {
      navigate("/feed");
    }
  }, [user, navigate]);

  // ── Profile pic upload ──
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePicFile(file);
    setProfilePicPreview(URL.createObjectURL(file));
  };

  // ── Form handlers ──
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () =>
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      // 1. Save profile data via /api/users/:id (multipart for profile pic)
      const profileFormData = new FormData();
      profileFormData.append("name", user?.name || "");
      profileFormData.append("bio", formData.bio);
      profileFormData.append("address", formData.address);
      profileFormData.append("city", formData.city);
      profileFormData.append("state", formData.state);
      profileFormData.append("institutionName", formData.institutionName);
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
      toast.error(
        err.response?.data?.message ||
          "Failed to complete profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((s, idx) => (
        <Fragment key={s.key}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                idx === step
                  ? "bg-primary border-primary text-white"
                  : idx < step
                    ? "bg-primary border-primary text-white"
                    : "border-base-300 text-base-content/50"
              }`}
            >
              {idx < step ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-bold">{idx + 1}</span>
              )}
            </div>
            <span className="text-xs mt-1.5 text-center">{s.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 transition-colors ${
                idx < step ? "bg-primary" : "bg-base-300"
              }`}
            />
          )}
        </Fragment>
      ))}
    </div>
  );

  // ── Step 1: Details ──
  const renderDetailsStep = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-bold mb-4">Your details</h2>

      {/* Profile picture */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-base-200">
            {profilePicPreview ? (
              <img
                src={profilePicPreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base-content/20">
                <FontAwesomeIcon icon={faUserGraduate} className="w-8 h-8" />
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 btn btn-xs btn-circle btn-ghost">
            <Upload className="w-3 h-3" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleProfilePicChange}
            />
          </label>
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
          maxLength={200}
          value={formData.bio}
          onChange={(e) => updateField("bio", e.target.value)}
        />
        <span className="label-text-alt text-base-content/40">
          {formData.bio.length}/200
        </span>
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">Address</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full input-sm"
          placeholder="Street, Locality"
          value={formData.address}
          onChange={(e) => updateField("address", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text font-medium text-sm">City</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full input-sm"
            placeholder="City"
            value={formData.city}
            onChange={(e) => updateField("city", e.target.value)}
          />
        </div>
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text font-medium text-sm">State</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full input-sm"
            placeholder="State"
            value={formData.state}
            onChange={(e) => updateField("state", e.target.value)}
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">LinkedIn URL</span>
        </label>
        <input
          type="url"
          className="input input-bordered w-full input-sm"
          placeholder="https://linkedin.com/in/yourprofile"
          value={formData.linkedinUrl}
          onChange={(e) => updateField("linkedinUrl", e.target.value)}
        />
      </div>
    </div>
  );

  // ── Step 2: Background & Skills ──
  const renderEducationStep = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-bold mb-4">Background & skills</h2>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">
            Background Level
          </span>
        </label>
        <select
          className="select select-bordered w-full select-sm"
          value={formData.educationLevel}
          onChange={(e) => updateField("educationLevel", e.target.value)}
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
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">Subject</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full input-sm"
          placeholder="e.g. Computer Science"
          value={formData.subject}
          onChange={(e) => updateField("subject", e.target.value)}
        />
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">
            Skills (comma separated)
          </span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full input-sm"
          placeholder="e.g. Python, Design, React"
          value={formData.skills}
          onChange={(e) => updateField("skills", e.target.value)}
        />
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">
            Qualifications (comma separated)
          </span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full input-sm"
          placeholder="e.g. B.Tech, M.Sc"
          value={formData.qualifications}
          onChange={(e) => updateField("qualifications", e.target.value)}
        />
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">
            Experience (years)
          </span>
        </label>
        <input
          type="number"
          className="input input-bordered w-full input-sm"
          placeholder="0"
          min="0"
          value={formData.experience}
          onChange={(e) =>
            updateField("experience", parseInt(e.target.value) || 0)
          }
        />
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium text-sm">Profession</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full input-sm"
          placeholder="e.g. Part-time Tutor"
          value={formData.profession}
          onChange={(e) => updateField("profession", e.target.value)}
        />
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
                className="input input-bordered w-full input-sm"
                placeholder="e.g. Assistant Manager"
                value={formData.currentPosition}
                onChange={(e) => updateField("currentPosition", e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">
                  Current Workplace
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full input-sm"
                placeholder="e.g. Delhi Public School"
                value={formData.currentCompany}
                onChange={(e) => updateField("currentCompany", e.target.value)}
              />
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
            className="textarea textarea-bordered w-full text-sm"
            placeholder="Previous roles, organizations, internships, or projects..."
            value={formData.previousWork}
            onChange={(e) => updateField("previousWork", e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  // ── Step 3: Organization ──
  const renderInstitutionStep = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-bold mb-2">Your organization (optional)</h2>
      <p className="text-sm text-base-content/60 mb-4">
        This helps others understand your professional background.
      </p>

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
          <option value="school">Organization</option>
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
          className="input input-bordered w-full input-sm"
          placeholder="e.g. Example University"
          value={formData.institutionName}
          onChange={(e) => updateField("institutionName", e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-100 flex">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-3">
              <FontAwesomeIcon
                icon={faUserGraduate}
                className="w-8 h-8 text-white"
                fontSize={24}
              />
            </div>
            <h1 className="text-2xl font-bold font-heading mb-1">
              Complete Your Profile
            </h1>
            <p className="text-sm text-base-content/50">
              Step {step + 1} of {steps.length}
            </p>
          </div>

          {/* Progress indicator */}
          {renderStepIndicator()}

          {/* Step content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 0 && renderDetailsStep()}
            {step === 1 && renderEducationStep()}
            {step === 2 && renderInstitutionStep()}

            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-ghost btn-outline flex-1"
                >
                  ← Previous
                </button>
              )}
              {step === steps.length - 1 ? (
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Complete Profile →"
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary flex-1"
                >
                  Next →
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;

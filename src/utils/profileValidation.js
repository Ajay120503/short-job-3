import { getPersonNameError, PERSON_NAME_MAX_LENGTH } from "./textValidation";

export const PROFILE_TEXT_MIN_LENGTH = 5;
export const PROFILE_TEXT_MAX_LENGTH = 20;
export const PROFILE_LIST_MAX_INPUT_LENGTH = 438;

export const PROFILE_LIMITS = {
  name: PERSON_NAME_MAX_LENGTH,
  bio: PROFILE_TEXT_MAX_LENGTH,
  institutionName: PROFILE_TEXT_MAX_LENGTH,
  subject: PROFILE_TEXT_MAX_LENGTH,
  address: PROFILE_TEXT_MAX_LENGTH,
  city: PROFILE_TEXT_MAX_LENGTH,
  state: PROFILE_TEXT_MAX_LENGTH,
  linkedinUrl: 500,
  profession: PROFILE_TEXT_MAX_LENGTH,
  currentPosition: PROFILE_TEXT_MAX_LENGTH,
  currentCompany: PROFILE_TEXT_MAX_LENGTH,
  previousWork: PROFILE_TEXT_MAX_LENGTH,
};

const listRules = {
  skills: [20, PROFILE_TEXT_MIN_LENGTH, PROFILE_TEXT_MAX_LENGTH, "skill"],
  qualifications: [20, PROFILE_TEXT_MIN_LENGTH, PROFILE_TEXT_MAX_LENGTH, "qualification"],
  interests: [20, PROFILE_TEXT_MIN_LENGTH, PROFILE_TEXT_MAX_LENGTH, "interest"],
};

export const validateProfileText = (form, { includeName = false } = {}) => {
  const errors = {};
  const labels = {
    name: "Full name", institutionName: "Organization name", subject: "Subject",
    address: "Address", city: "City", state: "State", linkedinUrl: "LinkedIn URL",
    profession: "Profession", currentPosition: "Current position",
    currentCompany: "Current workplace", previousWork: "Previous work",
  };

  Object.entries(PROFILE_LIMITS).forEach(([field, limit]) => {
    if (field === "name" && !includeName) return;
    const length = String(form[field] || "").trim().length;
    if (field !== "name" && field !== "linkedinUrl" && length > 0 && length < PROFILE_TEXT_MIN_LENGTH) {
      errors[field] = `${labels[field] || field} must contain at least ${PROFILE_TEXT_MIN_LENGTH} characters.`;
    } else if (length > limit) {
      errors[field] = `${labels[field] || field} cannot exceed ${limit} characters.`;
    }
  });

  if (includeName) {
    const nameError = getPersonNameError(form.name);
    if (nameError) errors.name = nameError;
  }

  Object.entries(listRules).forEach(([field, [maxItems, minLength, maxLength, label]]) => {
    if (form[field] == null) return;
    const values = [...new Set(String(form[field]).split(",").map((item) => item.trim()).filter(Boolean))];
    if (values.length > maxItems) errors[field] = `Add no more than ${maxItems} ${label}s.`;
    else if (values.some((value) => value.length < minLength)) errors[field] = `Each ${label} must contain at least ${minLength} characters.`;
    else if (values.some((value) => value.length > maxLength)) errors[field] = `Each ${label} must be ${maxLength} characters or fewer.`;
  });

  const experience = form.experience;
  if (experience !== "" && (!Number.isFinite(Number(experience)) || Number(experience) < 0 || Number(experience) > 80)) {
    errors.experience = "Experience must be between 0 and 80 years.";
  }
  if (form.linkedinUrl && !/^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(form.linkedinUrl.trim())) {
    errors.linkedinUrl = "Enter a valid LinkedIn URL.";
  }
  if (form.isCurrentlyWorking && !String(form.currentPosition || "").trim()) {
    errors.currentPosition = "Current position is required when currently working.";
  }
  if (form.isCurrentlyWorking && !String(form.currentCompany || "").trim()) {
    errors.currentCompany = "Current workplace is required when currently working.";
  }

  return errors;
};

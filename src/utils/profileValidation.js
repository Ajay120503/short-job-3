import { getPersonNameError } from "./textValidation";

export const PROFILE_LIST_MAX_INPUT_LENGTH = 218;
export const FOCUS_AREA_MAX_INPUT_LENGTH = 58;

export const PROFILE_LIMITS = {
  name: 50,
  bio: 200,
  institutionName: 50,
  subject: 20,
  address: 100,
  city: 20,
  state: 20,
  linkedinUrl: 500,
  profession: 50,
  currentPosition: 50,
  currentCompany: 50,
  previousWork: 100,
};

const listRules = {
  skills: [10, 3, 20, "skill"],
  qualifications: [10, 3, 20, "qualification"],
  interests: [10, 3, 20, "interest"],
};

const standardTextRules = {
  bio: [0, 200, "Bio"],
  institutionName: [3, 50, "Organization name"],
  subject: [3, 20, "Subject"],
  address: [0, 100, "Address"],
  city: [3, 20, "City"],
  state: [3, 20, "State"],
  profession: [3, 50, "Profession"],
  currentPosition: [3, 50, "Current position"],
  currentCompany: [3, 50, "Current workplace"],
  previousWork: [0, 100, "Previous work"],
};

export const validateProfileText = (form, { includeName = false, mode = "profile" } = {}) => {
  const errors = {};
  const textRules = mode === "complete"
    ? {
        ...standardTextRules,
        address: [3, 100, "Address"],
        city: [2, 10, "City"],
        state: [2, 10, "State"],
        profession: [3, 20, "Current role headline"],
      }
    : standardTextRules;

  Object.entries(textRules).forEach(([field, [min, max, label]]) => {
    const length = String(form[field] || "").trim().length;
    if (length > 0 && min > 0 && length < min) {
      errors[field] = `${label} must contain at least ${min} characters.`;
    } else if (length > max) {
      errors[field] = `${label} cannot exceed ${max} characters.`;
    }
  });

  if (includeName) {
    const nameError = getPersonNameError(form.name, { minLength: 3, maxLength: 50 });
    if (nameError) errors.name = nameError;
  }

  if (mode === "complete" && form.subject != null) {
    const focusAreas = [...new Set(String(form.subject).split(",").map((item) => item.trim()).filter(Boolean))];
    delete errors.subject;
    if (focusAreas.length > 5) errors.subject = "Add no more than 5 focus areas.";
    else if (focusAreas.some((value) => value.length < 3 || value.length > 10)) {
      errors.subject = "Each focus area must contain 3 to 10 characters.";
    }
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
  if (form.linkedinUrl && !/^https?:\/\/(?:www\.)?linkedin\.com\/.+/i.test(form.linkedinUrl.trim())) {
    errors.linkedinUrl = "Enter a LinkedIn URL starting with http:// or https://.";
  }
  return errors;
};

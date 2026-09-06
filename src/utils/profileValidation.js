export const PROFILE_LIMITS = {
  name: 100,
  bio: 200,
  institutionName: 150,
  subject: 100,
  address: 300,
  city: 100,
  state: 100,
  linkedinUrl: 500,
  profession: 120,
  currentPosition: 120,
  currentCompany: 150,
  previousWork: 1000,
};

const listRules = {
  skills: [20, 50, "skill"],
  qualifications: [20, 100, "qualification"],
  interests: [20, 50, "interest"],
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
    if (String(form[field] || "").trim().length > limit) {
      errors[field] = `${labels[field] || field} cannot exceed ${limit} characters.`;
    }
  });

  Object.entries(listRules).forEach(([field, [maxItems, maxLength, label]]) => {
    if (form[field] == null) return;
    const values = [...new Set(String(form[field]).split(",").map((item) => item.trim()).filter(Boolean))];
    if (values.length > maxItems) errors[field] = `Add no more than ${maxItems} ${label}s.`;
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

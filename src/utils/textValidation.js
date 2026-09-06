export const PERSON_NAME_MIN_LENGTH = 5;
export const PERSON_NAME_MAX_LENGTH = 20;

const PERSON_NAME_PATTERN = /^[\p{L}\p{M} .'-]+$/u;
const LETTER_PATTERN = /\p{L}/gu;

export const getPersonNameError = (value, { required = true } = {}) => {
  const name = String(value || "").trim();
  if (!name) return required ? "Full name is required." : "";
  if ((name.match(LETTER_PATTERN) || []).length < PERSON_NAME_MIN_LENGTH) {
    return `Full name must contain at least ${PERSON_NAME_MIN_LENGTH} letters.`;
  }
  if (name.length > PERSON_NAME_MAX_LENGTH) {
    return `Full name cannot exceed ${PERSON_NAME_MAX_LENGTH} characters.`;
  }
  if (!PERSON_NAME_PATTERN.test(name)) {
    return "Use letters, spaces, apostrophes, periods, or hyphens only.";
  }
  return "";
};

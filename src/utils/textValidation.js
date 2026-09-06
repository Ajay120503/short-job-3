export const PERSON_NAME_MIN_LENGTH = 3;
export const PERSON_NAME_MAX_LENGTH = 20;

const PERSON_NAME_PATTERN = /^[\p{L}\p{M} .'-]+$/u;
const LETTER_PATTERN = /\p{L}/gu;

export const getPersonNameError = (
  value,
  { required = true, minLength = PERSON_NAME_MIN_LENGTH, maxLength = PERSON_NAME_MAX_LENGTH } = {},
) => {
  const name = String(value || "").trim();
  if (!name) return required ? "Full name is required." : "";
  if ((name.match(LETTER_PATTERN) || []).length < minLength) {
    return `Full name must contain at least ${minLength} letters.`;
  }
  if (name.length > maxLength) {
    return `Full name cannot exceed ${maxLength} characters.`;
  }
  if (!PERSON_NAME_PATTERN.test(name)) {
    return "Use letters, spaces, apostrophes, periods, or hyphens only.";
  }
  return "";
};

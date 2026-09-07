export const normalizeJobSkills = (skills = []) => {
  const items = Array.isArray(skills) ? skills : String(skills || "").split(",");
  return [
    ...new Set(
      items
        .map((skill) => String(skill || "").trim())
        .filter(Boolean)
    ),
  ];
};

const normalizeMatchTerm = (value) => String(value || "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/&/g, " and ")
  .replace(/[^a-z0-9+#]+/g, " ")
  .trim()
  .replace(/\s+/g, " ");

const singularizeWords = (value) => value
  .split(" ")
  .map((word) => (
    word.length > 4 && word.endsWith("s") && !/(ss|us|is)$/.test(word)
      ? word.slice(0, -1)
      : word
  ))
  .join(" ");

export const doProfileTermsMatch = (left, right) => {
  const first = singularizeWords(normalizeMatchTerm(left));
  const second = singularizeWords(normalizeMatchTerm(right));
  if (!first || !second) return false;
  if (first === second) return true;

  // Treat formatting variants such as "team work"/"teamwork" and
  // "React.js"/"React JS" as the same structured profile skill.
  if (first.replace(/\s/g, "") === second.replace(/\s/g, "")) return true;

  const firstWords = first.split(" ");
  const secondWords = second.split(" ");
  const shorter = firstWords.length <= secondWords.length ? firstWords : secondWords;
  const longer = firstWords.length <= secondWords.length ? secondWords : firstWords;
  if (shorter.length === 1 && longer.length > 1) {
    return shorter[0].length >= 4 && shorter[0] === longer[0];
  }
  return shorter.every((word) => word.length >= 3 && longer.includes(word));
};

export const getUserJobMatchTerms = (user = {}) => {
  const structuredValues = [
    ...normalizeJobSkills(user.skills),
    ...normalizeJobSkills(user.interests),
    ...normalizeJobSkills(user.qualifications),
    user.subject,
    user.profession,
    user.currentPosition,
  ];

  return normalizeJobSkills(
    structuredValues.flatMap((value) => (
      typeof value === "string" ? value.split(/[,;\n|•]+/) : value
    )),
  );
};

export const getJobSkillMatch = (job, user) => {
  const requiredSkills = normalizeJobSkills(job?.skillsRequired);
  const profileTerms = getUserJobMatchTerms(user);
  const matchedSkills = requiredSkills.filter((skill) =>
    profileTerms.some((term) => doProfileTermsMatch(skill, term))
  );
  const missingSkills = requiredSkills.filter((skill) => !matchedSkills.includes(skill));
  const matchPercent = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  return { requiredSkills, profileTerms, matchedSkills, missingSkills, matchPercent };
};

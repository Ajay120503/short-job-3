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

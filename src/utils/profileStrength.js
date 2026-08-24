export const calcStrength = (user) => {
  if (!user) return 0;
  const checks = [
    { field: 'name', weight: 10 },
    { field: 'profilePic.url', weight: 15 },
    { field: 'bio', weight: 10 },
    { field: 'age', weight: 5 },
    { field: 'address', weight: 5 },
    { field: 'resumeUrl', weight: 20 },
    { field: 'skills', weight: 15, check: (v) => Array.isArray(v) && v.length >= 3 },
    { field: 'qualifications', weight: 10, check: (v) => Array.isArray(v) && v.length >= 1 },
    { field: 'educationLevel', weight: 10 },
  ];
  let score = 0;
  checks.forEach(({ field, weight, check }) => {
    const val = field.split('.').reduce((o, k) => o?.[k], user);
    if (check ? check(val) : Boolean(val)) score += weight;
  });
  return score;
};

export const getIncompleteFields = (user) => {
  if (!user) return [];
  const incomplete = [];
  if (!user.name) incomplete.push({ label: 'Add Name (+10%)', field: 'name' });
  if (!user.profilePic?.url) incomplete.push({ label: 'Add Profile Photo (+15%)', field: 'profilePic' });
  if (!user.bio) incomplete.push({ label: 'Add Bio (+10%)', field: 'bio' });
  if (!user.age) incomplete.push({ label: 'Add Age (+5%)', field: 'age' });
  if (!user.address) incomplete.push({ label: 'Add Address (+5%)', field: 'address' });
  if (!user.resumeUrl) incomplete.push({ label: 'Upload Resume (+20%)', field: 'resume' });
  if (!Array.isArray(user.skills) || user.skills.length < 3) incomplete.push({ label: 'Add 3+ Skills (+15%)', field: 'skills' });
  if (!Array.isArray(user.qualifications) || user.qualifications.length < 1) incomplete.push({ label: 'Add Qualification (+10%)', field: 'qualifications' });
  if (!user.educationLevel) incomplete.push({ label: 'Add Background Level (+10%)', field: 'educationLevel' });
  return incomplete;
};

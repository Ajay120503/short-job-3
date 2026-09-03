export const getProfileCompletionStatus = (user) => {
  const fields = {
    name: Boolean(user?.name?.trim?.()),
    age: user?.age !== undefined && user?.age !== null,
    profilePic: Boolean(user?.profilePic?.url),
    'address.city': Boolean(user?.address?.city || user?.city),
  };
  const missingMandatory = Object.entries(fields).filter(([, present]) => !present).map(([field]) => field);
  return { isComplete: missingMandatory.length === 0, missingMandatory };
};

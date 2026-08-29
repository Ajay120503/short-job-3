export const getUserId = (value) =>
  typeof value === "string" ? value : value?._id || value?.id;

export const isPlatformAdmin = (user) =>
  Boolean(user?.isAdmin || user?.isSuperAdmin);

export const isRecentlyActive = (user) => {
  if (Array.isArray(user?.activeDays) && user.activeDays.length >= 5) {
    return true;
  }

  if (!user?.lastActiveAt) return false;
  const lastActive = new Date(user.lastActiveAt).getTime();
  if (Number.isNaN(lastActive)) return false;

  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - lastActive <= sevenDays;
};

export const getFollowerCount = (user) => user?.followers?.length || 0;

export const getUserSignal = (user) => {
  if (isPlatformAdmin(user)) {
    return {
      key: "admin",
      label: user?.isSuperAdmin ? "Super Admin" : "Admin",
      className: "special-style special-indigo special-label truncate",
    };
  }

  if (getFollowerCount(user) >= 5) {
    return {
      key: "popular",
      label: "Popular",
      className: "badge-warning badge-soft",
    };
  }

  if (isRecentlyActive(user)) {
    return {
      key: "active",
      label: "Active",
      className: "badge-success badge-soft",
    };
  }

  return null;
};

export const sortDiscoverableUsers = (users = []) =>
  [...users].sort((a, b) => {
    if (isPlatformAdmin(a) !== isPlatformAdmin(b)) {
      return isPlatformAdmin(a) ? -1 : 1;
    }

    if (isRecentlyActive(a) !== isRecentlyActive(b)) {
      return isRecentlyActive(a) ? -1 : 1;
    }

    return getFollowerCount(b) - getFollowerCount(a);
  });

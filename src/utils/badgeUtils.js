/**
 * Badge utility functions — used throughout the client to check
 * user badges for permission gating and display purposes.
 */
import { badgeConfig } from "./badgeConfig";

// Badges a user can self-select during profile completion
export const SELF_BADGES = [
  // Academic identity
  "student",
  "teacher",
  "professor",
  "principal",
  "hod",
  "researcher",
  "phd_scholar",
  "lecturer",
  // Institution type
  "school_member",
  "college_member",
  "university_member",
  "coaching_member",
  // Skills / domain
  "stem_expert",
  "arts_expert",
  "sports_coach",
  "counselor",
];

// Trust badges — only grantable by admin/system, never self-selected
export const TRUST_BADGES = [
  "verified_institution",
  "top_contributor",
  "email_verified",
  "phone_verified",
  "platform_owner"
];

// Self-selectable badge groups for the wizard grid
export const BADGE_GROUPS = [
  {
    label: "Academic Identity",
    badges: [
      "student",
      "teacher",
      "professor",
      "principal",
      "hod",
      "researcher",
      "phd_scholar",
      "lecturer",
    ],
  },
  {
    label: "Institution Type",
    badges: [
      "school_member",
      "college_member",
      "university_member",
      "coaching_member",
    ],
  },
  {
    label: "Skills & Domain",
    badges: ["stem_expert", "arts_expert", "sports_coach", "counselor"],
  },
];

// Institution-member badges (can post jobs / notices / stories)
export const INSTITUTION_MEMBER_BADGES = [
  "teacher",
  "professor",
  "hod",
  "principal",
  "lecturer",
  "school_member",
  "college_member",
  "university_member",
  "coaching_member",
];

// Academic identity badges — used for display "role" label
const ACADEMIC_ID_BADGES = [
  "student",
  "teacher",
  "professor",
  "principal",
  "hod",
  "researcher",
  "phd_scholar",
  "lecturer",
];

// Badges that can be granted by admin only
export const ADMIN_ONLY_BADGES = TRUST_BADGES;

/**
 * Check whether a user has a specific active badge.
 * @param {object} user — user object from store
 * @param {string} badgeType
 * @returns {boolean}
 */
export const userHasBadge = (user, badgeType) => {
  if (!user?.badges) return false;
  return user.badges.some((b) => b.type === badgeType && b.isActive !== false);
};

/**
 * Check whether a user has any of the given badge types.
 * @param {object} user
 * @param {string[]} badgeTypes
 * @returns {boolean}
 */
export const hasAnyBadge = (user, badgeTypes) => {
  return badgeTypes.some((bt) => userHasBadge(user, bt));
};

/**
 * Is this user a student (by badge or legacy category)?
 */
export const isStudent = (user) => {
  return userHasBadge(user, "student") || user?.category === "student";
};

export const canApplyToJobs = (user) => {
  return Boolean(user);
};

export const canCreateJobs = (user) => Boolean(user);

export const canCreateStories = (user) => Boolean(user);

/**
 * Can this user post jobs / notices / stories?
 * (institution member or admin)
 */
export const isInstitutionMember = (user) => {
  return Boolean(user);
};

/**
 * Is this user an admin? (matches backend middleware check)
 */
export const isAdminUser = (user) => {
  return Boolean(user?.isAdmin || user?.isSuperAdmin);
};

export const isSuperAdminUser = (user) => Boolean(user?.isSuperAdmin);

/**
 * Return array of active badge objects.
 */
export const getActiveBadges = (user) => {
  if (!user?.badges) return [];
  return user.badges.filter((b) => b.isActive !== false);
};

/**
 * Returns a human-readable label for a user's primary identity badge.
 * Used everywhere that previously checked `user?.role` for display.
 * Falls back to category, then "User".
 *
 * @param {object} user
 * @returns {string}
 */
export const getUserRoleLabel = (user) => {
  if (!user) return "User";

  // Check badges first
  if (user.badges) {
    const active = user.badges.filter((b) => b.isActive !== false);
    const academicBadge = active.find((b) =>
      ACADEMIC_ID_BADGES.includes(b.type)
    );
    if (academicBadge) {
      const label = badgeConfig[academicBadge.type]?.label;
      if (label) return label;
      // Fallback: prettify the type string
      return academicBadge.type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }
    // If no academic badge, show the first active badge
    if (active.length > 0) {
      const label = badgeConfig[active[0].type]?.label;
      if (label) return label;
      // Fallback: prettify the type string
      return active[0].type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  }

  // Legacy fallback: category
  if (user.category) {
    const label = badgeConfig[user.category]?.label;
    if (label) return label;
    return user.category.charAt(0).toUpperCase() + user.category.slice(1);
  }

  return "User";
};

import { getUserSignal, isPlatformAdmin } from "./userSignals";
import { userHasBadge } from "./badgeUtils";

export const SPECIAL_STYLE_VARIANTS = [
  {
    value: "teal",
    label: "Signature Teal",
    swatch: "bg-primary",
  },
  {
    value: "coral",
    label: "Coral",
    swatch: "bg-accent",
  },
  {
    value: "emerald",
    label: "Emerald",
    swatch: "bg-success",
  },
  {
    value: "amber",
    label: "Amber",
    swatch: "bg-warning",
  },
  {
    value: "indigo",
    label: "Indigo",
    swatch: "bg-[#5667d8]",
  },
  {
    value: "sky",
    label: "Sky Blue",
    swatch: "bg-info",
  },
  {
    value: "deep-teal",
    label: "Deep Teal",
    swatch: "bg-secondary",
  },
  {
    value: "rose",
    label: "Rose",
    swatch: "bg-error",
  },
  {
    value: "slate",
    label: "Slate",
    swatch: "bg-neutral",
  },
  {
    value: "violet",
    label: "Violet",
    swatch: "bg-[#7c3aed]",
  },
  {
    value: "pink",
    label: "Pink",
    swatch: "bg-[#ec4899]",
  },
  {
    value: "premium",
    label: "Premium Gold",
    swatch: "bg-[#d4af37]",
    adminOnly: true,
  },
];

export const canUseSpecialStyle = (user) => {
  if (!user) return false;
  const signal = getUserSignal(user);
  return Boolean(
    isPlatformAdmin(user) ||
      signal?.key === "popular" ||
      signal?.key === "active" ||
      userHasBadge(user, "top_contributor") ||
      user?.verifiedStatus === "top_contributor"
  );
};

const createVariantClasses = (value) => {
  const variantClass = `special-style special-${value}`;

  return {
    shell: `${variantClass} special-shell text-base-content`,
    shellHover: "special-shell-hover",
    label: `${variantClass} special-label`,
    soft: `${variantClass} special-soft`,
    muted: `${variantClass} special-muted`,
    ring: `${variantClass} special-ring ring-2 ring-offset-2`,
    storyRing: `${variantClass} special-story-ring`,
    marker: `${variantClass} special-marker`,
    icon: `${variantClass} special-icon`,
  };
};

const variants = Object.fromEntries(
  SPECIAL_STYLE_VARIANTS.map((variant) => [
    variant.value,
    createVariantClasses(variant.value),
  ])
);

export const getSpecialStyleVariant = (user) => {
  const requested = user?.profileThemeVariant;
  // Premium Gold is admin-only — non-admins fall back to their regular variant
  if (requested === "premium" && !isPlatformAdmin(user)) {
    return "teal";
  }
  if (canUseSpecialStyle(user) && variants[requested]) return requested;
  if (isPlatformAdmin(user)) return "indigo";
  return "teal";
};

export const getSpecialUserStyle = (user) =>
  variants[getSpecialStyleVariant(user)] || variants.teal;

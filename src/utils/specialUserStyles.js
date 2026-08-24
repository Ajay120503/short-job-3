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

const variants = {
  teal: {
    shell:
      "bg-primary/8 text-base-content border-primary/25 shadow-sm shadow-primary/10",
    shellHover: "hover:border-primary/40 hover:shadow-primary/15",
    label: "badge-primary badge-soft",
    soft: "bg-primary/10 text-primary border-primary/20",
    muted: "text-primary/75",
    ring: "ring-2 ring-primary ring-offset-2 ring-offset-base-100",
    storyRing: "bg-primary",
    marker: "bg-primary text-primary-content",
    icon: "text-primary",
  },
  coral: {
    shell:
      "bg-accent/8 text-base-content border-accent/25 shadow-sm shadow-accent/10",
    shellHover: "hover:border-accent/40 hover:shadow-accent/15",
    label: "bg-accent/12 text-accent border-accent/25",
    soft: "bg-accent/10 text-accent border-accent/20",
    muted: "text-accent/80",
    ring: "ring-2 ring-accent ring-offset-2 ring-offset-base-100",
    storyRing: "bg-accent",
    marker: "bg-accent text-accent-content",
    icon: "text-accent",
  },
  emerald: {
    shell:
      "bg-success/8 text-base-content border-success/25 shadow-sm shadow-success/10",
    shellHover: "hover:border-success/40 hover:shadow-success/15",
    label: "badge-success badge-soft",
    soft: "bg-success/10 text-success border-success/20",
    muted: "text-success/80",
    ring: "ring-2 ring-success ring-offset-2 ring-offset-base-100",
    storyRing: "bg-success",
    marker: "bg-success text-success-content",
    icon: "text-success",
  },
  amber: {
    shell:
      "bg-warning/10 text-base-content border-warning/30 shadow-sm shadow-warning/10",
    shellHover: "hover:border-warning/50 hover:shadow-warning/15",
    label: "badge-warning badge-soft",
    soft: "bg-warning/12 text-warning border-warning/25",
    muted: "text-warning/85",
    ring: "ring-2 ring-warning ring-offset-2 ring-offset-base-100",
    storyRing: "bg-warning",
    marker: "bg-warning text-warning-content",
    icon: "text-warning",
  },
  indigo: {
    shell:
      "bg-[#eef0ff] text-base-content border-[#c6ccff] shadow-sm shadow-[#5667d8]/10",
    shellHover: "hover:border-[#9ca6f7] hover:shadow-[#5667d8]/15",
    label: "bg-[#e4e7ff] text-[#3847ad] border-[#b7bef6]",
    soft: "bg-[#e4e7ff] text-[#3847ad] border-[#b7bef6]",
    muted: "text-[#5360ba]",
    ring: "ring-2 ring-[#5667d8] ring-offset-2 ring-offset-base-100",
    storyRing: "bg-[#5667d8]",
    marker: "bg-[#5667d8] text-white",
    icon: "text-[#5667d8]",
  },
  sky: {
    shell: "bg-info/8 text-base-content border-info/25 shadow-sm shadow-info/10",
    shellHover: "hover:border-info/40 hover:shadow-info/15",
    label: "badge-info badge-soft",
    soft: "bg-info/10 text-info border-info/20",
    muted: "text-info/80",
    ring: "ring-2 ring-info ring-offset-2 ring-offset-base-100",
    storyRing: "bg-info",
    marker: "bg-info text-info-content",
    icon: "text-info",
  },
  "deep-teal": {
    shell:
      "bg-secondary/8 text-base-content border-secondary/25 shadow-sm shadow-secondary/10",
    shellHover: "hover:border-secondary/40 hover:shadow-secondary/15",
    label: "bg-secondary/12 text-secondary border-secondary/25",
    soft: "bg-secondary/10 text-secondary border-secondary/20",
    muted: "text-secondary/80",
    ring: "ring-2 ring-secondary ring-offset-2 ring-offset-base-100",
    storyRing: "bg-secondary",
    marker: "bg-secondary text-secondary-content",
    icon: "text-secondary",
  },
  rose: {
    shell: "bg-error/8 text-base-content border-error/25 shadow-sm shadow-error/10",
    shellHover: "hover:border-error/40 hover:shadow-error/15",
    label: "badge-error badge-soft",
    soft: "bg-error/10 text-error border-error/20",
    muted: "text-error/80",
    ring: "ring-2 ring-error ring-offset-2 ring-offset-base-100",
    storyRing: "bg-error",
    marker: "bg-error text-error-content",
    icon: "text-error",
  },
  slate: {
    shell:
      "bg-neutral/8 text-base-content border-neutral/25 shadow-sm shadow-neutral/10",
    shellHover: "hover:border-neutral/40 hover:shadow-neutral/15",
    label: "bg-neutral/12 text-neutral border-neutral/25",
    soft: "bg-neutral/10 text-neutral border-neutral/20",
    muted: "text-neutral/80",
    ring: "ring-2 ring-neutral ring-offset-2 ring-offset-base-100",
    storyRing: "bg-neutral",
    marker: "bg-neutral text-neutral-content",
    icon: "text-neutral",
  },
  violet: {
    shell:
      "bg-[#f5f3ff] text-base-content border-[#ddd6fe] shadow-sm shadow-[#7c3aed]/10",
    shellHover: "hover:border-[#c4b5fd] hover:shadow-[#7c3aed]/15",
    label: "bg-[#ede9fe] text-[#5b21b6] border-[#c4b5fd]",
    soft: "bg-[#ede9fe] text-[#5b21b6] border-[#c4b5fd]",
    muted: "text-[#6d28d9]",
    ring: "ring-2 ring-[#7c3aed] ring-offset-2 ring-offset-base-100",
    storyRing: "bg-[#7c3aed]",
    marker: "bg-[#7c3aed] text-white",
    icon: "text-[#7c3aed]",
  },
  pink: {
    shell:
      "bg-[#fdf2f8] text-base-content border-[#fbcfe8] shadow-sm shadow-[#ec4899]/10",
    shellHover: "hover:border-[#f9a8d4] hover:shadow-[#ec4899]/15",
    label: "bg-[#fce7f3] text-[#9d174d] border-[#fbcfe8]",
    soft: "bg-[#fce7f3] text-[#9d174d] border-[#fbcfe8]",
    muted: "text-[#be185d]",
    ring: "ring-2 ring-[#ec4899] ring-offset-2 ring-offset-base-100",
    storyRing: "bg-[#ec4899]",
    marker: "bg-[#ec4899] text-white",
    icon: "text-[#ec4899]",
  },
  premium: {
    shell:
      "bg-[#fdf9e7] text-base-content border-[#e6d68a] shadow-sm shadow-[#d4af37]/15",
    shellHover: "hover:border-[#d4af37]/60 hover:shadow-[#d4af37]/25",
    label: "bg-[#f5ecc9] text-[#8a6d1a] border-[#e6d68a]",
    soft: "bg-[#f5ecc9] text-[#8a6d1a] border-[#e6d68a]",
    muted: "text-[#a8842c]",
    ring: "ring-2 ring-[#d4af37] ring-offset-2 ring-offset-base-100",
    storyRing: "bg-[#d4af37]",
    marker: "bg-[#d4af37] text-[#2f2710]",
    icon: "text-[#d4af37]",
  },
};

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

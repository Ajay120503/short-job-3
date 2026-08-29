/**
 * Badge configuration — maps each badge type to display metadata.
 * Used by BadgeChip and the badge selection wizard.
 *
 * Trust badges (verified_institution, top_contributor, email_verified,
 * phone_verified) are SYSTEM/ADMIN only — users cannot self-assign them.
 */

import {
  BookOpen,
  School,
  Users,
  FlaskConical,
  Microscope,
  BadgeCheck,
  Star,
  Mail,
  Phone,
  Award,
  Globe,
  Library,
  UserCheck,
  ShieldCheck,
  // ClipboardText,
  Sparkles,
  Dumbbell,
  Palette,
  Stethoscope,
} from "lucide-react";
import FontAwesomeGraduateIcon from "../components/common/FontAwesomeGraduateIcon";

/**
 * Map icon name strings → Lucide React components.
 * BadgeChip and BadgeSelector use this to render the correct icon.
 */
export const badgeIconMap = {
  GraduationCap: FontAwesomeGraduateIcon,
  BookOpen,
  School,
  Users,
  FlaskConical,
  Microscope,
  BadgeCheck,
  Star,
  Mail,
  Phone,
  Award,
  Globe,
  Library,
  UserCheck,
  ShieldCheck,
  // ClipboardText,
  Sparkles,
  Dumbbell,
  Palette,
  Stethoscope,
};

export const badgeConfig = {
  // Legacy identity keys kept for existing users; labels are generalized.
  student: {
    label: "Member",
    bg: "color-mix(in srgb, var(--color-primary) 13%, var(--color-base-100))",
    text: "var(--color-primary)",
    icon: "GraduationCap",
  },
  teacher: {
    label: "Creator",
    bg: "color-mix(in srgb, var(--color-accent) 14%, var(--color-base-100))",
    text: "var(--color-accent)",
    icon: "BookOpen",
  },
  professor: {
    label: "Expert",
    bg: "color-mix(in srgb, var(--color-accent) 14%, var(--color-base-100))",
    text: "var(--color-accent)",
    icon: "BookOpen",
  },
  principal: {
    label: "Lead",
    bg: "var(--color-primary)",
    text: "var(--color-primary-content)",
    icon: "School",
  },
  hod: {
    label: "Team Lead",
    bg: "var(--color-secondary)",
    text: "var(--color-secondary-content)",
    icon: "Users",
  },
  researcher: {
    label: "Researcher",
    bg: "color-mix(in srgb, var(--color-info) 13%, var(--color-base-100))",
    text: "var(--color-info)",
    icon: "FlaskConical",
  },
  phd_scholar: {
    label: "Specialist",
    bg: "color-mix(in srgb, var(--color-info) 13%, var(--color-base-100))",
    text: "var(--color-info)",
    icon: "Microscope",
  },
  lecturer: {
    label: "Presenter",
    bg: "color-mix(in srgb, var(--color-accent) 14%, var(--color-base-100))",
    text: "var(--color-accent)",
    icon: "BookOpen",
  },
  // ── Organization type ──
  school_member: {
    label: "Organization Member",
    bg: "color-mix(in srgb, var(--color-primary) 13%, var(--color-base-100))",
    text: "var(--color-primary)",
    icon: "Library",
  },
  college_member: {
    label: "Network Member",
    bg: "color-mix(in srgb, var(--color-primary) 13%, var(--color-base-100))",
    text: "var(--color-primary)",
    icon: "School",
  },
  university_member: {
    label: "Community Member",
    bg: "color-mix(in srgb, var(--color-primary) 13%, var(--color-base-100))",
    text: "var(--color-primary)",
    icon: "GraduationCap",
  },
  coaching_member: {
    label: "Program Member",
    bg: "color-mix(in srgb, var(--color-primary) 13%, var(--color-base-100))",
    text: "var(--color-primary)",
    icon: "ClipboardText",
  },
  // ── Skills / domain ──
  stem_expert: {
    label: "STEM Expert",
    bg: "color-mix(in srgb, var(--color-success) 14%, var(--color-base-100))",
    text: "var(--color-success)",
    icon: "Sparkles",
  },
  arts_expert: {
    label: "Arts Expert",
    bg: "color-mix(in srgb, #b999ff 18%, var(--color-base-100))",
    text: "color-mix(in srgb, #b999ff 82%, var(--color-base-content))",
    icon: "Palette",
  },
  sports_coach: {
    label: "Sports Coach",
    bg: "color-mix(in srgb, var(--color-warning) 16%, var(--color-base-100))",
    text: "var(--color-warning)",
    icon: "Dumbbell",
  },
  counselor: {
    label: "Counselor",
    bg: "color-mix(in srgb, var(--color-success) 14%, var(--color-base-100))",
    text: "var(--color-success)",
    icon: "Stethoscope",
  },
  // ── Trust (admin/system only) ──
  verified_institution: {
    label: "Verified Institution",
    bg: "var(--color-success)",
    text: "var(--color-success-content)",
    icon: "BadgeCheck",
  },
  top_contributor: {
    label: "Top Contributor",
    bg: "color-mix(in srgb, var(--color-warning) 16%, var(--color-base-100))",
    text: "var(--color-warning)",
    icon: "Star",
  },
  email_verified: {
    label: "Email Verified",
    bg: "color-mix(in srgb, var(--color-success) 14%, var(--color-base-100))",
    text: "var(--color-success)",
    icon: "Mail",
  },
  phone_verified: {
    label: "Phone Verified",
    bg: "color-mix(in srgb, var(--color-success) 14%, var(--color-base-100))",
    text: "var(--color-success)",
    icon: "Phone",
  },
  platform_owner: {
    label: "Platform Owner",
    bg: "var(--color-neutral)",
    text: "var(--color-neutral-content)",
    icon: "ShieldCheck",
  },
};

export default badgeConfig;

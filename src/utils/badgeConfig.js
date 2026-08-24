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
    bg: "#E0F5F4",
    text: "#0A5C60",
    icon: "GraduationCap",
  },
  teacher: {
    label: "Creator",
    bg: "#FFE4DE",
    text: "#B83F1D",
    icon: "BookOpen",
  },
  professor: {
    label: "Expert",
    bg: "#FFE4DE",
    text: "#B83F1D",
    icon: "BookOpen",
  },
  principal: {
    label: "Lead",
    bg: "#0D7377",
    text: "#FFFFFF",
    icon: "School",
  },
  hod: {
    label: "Team Lead",
    bg: "#0A5C60",
    text: "#FFFFFF",
    icon: "Users",
  },
  researcher: {
    label: "Researcher",
    bg: "#E0F5F4",
    text: "#0A5C60",
    icon: "FlaskConical",
  },
  phd_scholar: {
    label: "Specialist",
    bg: "#E0F5F4",
    text: "#0A5C60",
    icon: "Microscope",
  },
  lecturer: {
    label: "Presenter",
    bg: "#FFE4DE",
    text: "#B83F1D",
    icon: "BookOpen",
  },
  // ── Organization type ──
  school_member: {
    label: "Organization Member",
    bg: "#E0F5F4",
    text: "#0A5C60",
    icon: "Library",
  },
  college_member: {
    label: "Network Member",
    bg: "#E0F5F4",
    text: "#0A5C60",
    icon: "School",
  },
  university_member: {
    label: "Community Member",
    bg: "#E0F5F4",
    text: "#0A5C60",
    icon: "GraduationCap",
  },
  coaching_member: {
    label: "Program Member",
    bg: "#E0F5F4",
    text: "#0A5C60",
    icon: "ClipboardText",
  },
  // ── Skills / domain ──
  stem_expert: {
    label: "STEM Expert",
    bg: "#DCFCE7",
    text: "#14532D",
    icon: "Sparkles",
  },
  arts_expert: {
    label: "Arts Expert",
    bg: "#F3E8FF",
    text: "#581C87",
    icon: "Palette",
  },
  sports_coach: {
    label: "Sports Coach",
    bg: "#FEF3C7",
    text: "#92400E",
    icon: "Dumbbell",
  },
  counselor: {
    label: "Counselor",
    bg: "#DCFCE7",
    text: "#14532D",
    icon: "Stethoscope",
  },
  // ── Trust (admin/system only) ──
  verified_institution: {
    label: "Verified Institution",
    bg: "#2F9E44",
    text: "#FFFFFF",
    icon: "BadgeCheck",
  },
  top_contributor: {
    label: "Top Contributor",
    bg: "#FEF3C7",
    text: "#92400E",
    icon: "Star",
  },
  email_verified: {
    label: "Email Verified",
    bg: "#D1FAE5",
    text: "#065F46",
    icon: "Mail",
  },
  phone_verified: {
    label: "Phone Verified",
    bg: "#D1FAE5",
    text: "#065F46",
    icon: "Phone",
  },
  platform_owner: {
    label: "Platform Owner",
    bg: "#26332F",
    text: "#FFFFFF",
    icon: "ShieldCheck",
  },
};

export default badgeConfig;

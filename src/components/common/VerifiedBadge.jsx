import { CheckCircle, School, Star } from "lucide-react";

const badges = {
  email: {
    icon: CheckCircle,
    color: "badge-info",
    label: "Email Verified",
  },
  institution: {
    icon: School,
    color: "badge-success",
    label: "Institution Verified",
  },
  top_contributor: {
    icon: Star,
    color: "badge-warning",
    label: "Top Contributor",
  },
};

const VerifiedBadge = ({ verifiedStatus, size = 14, showLabel = false }) => {
  if (!verifiedStatus || verifiedStatus === "none") return null;

  const badge = badges[verifiedStatus];
  if (!badge) return null;

  const Icon = badge.icon;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 ${badge.color} badge badge-soft badge-sm`}
      title={badge.label}
      aria-label={badge.label}
    >
      <Icon size={size} />
      {showLabel && <span className="text-xs font-medium">{badge.label}</span>}
    </span>
  );
};

export default VerifiedBadge;

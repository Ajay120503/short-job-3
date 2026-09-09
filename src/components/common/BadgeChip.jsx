import { badgeConfig, badgeIconMap } from "../../utils/badgeConfig";

/**
 * Renders a single badge as a colored chip with an icon.
 *
 * @param {string} badgeType  — key from badgeConfig
 * @param {string} [size]     — "sm" | "md" (default "md")
 * @param {string} [className]
 */
const BadgeChip = ({ badgeType, size = "md", className = "" }) => {
  const config = badgeConfig[badgeType];
  if (!config) return null;

  const Icon = badgeIconMap[config.icon];

  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1.5 text-xs font-medium";

  return (
    <span
      className={`profile-badge inline-flex max-w-full items-center rounded-full font-medium leading-5 transition-colors ${sizeClasses} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: "1px solid color-mix(in srgb, currentColor 20%, transparent)",
      }}
      title={config.label}
    >
      {Icon && <Icon className="w-3 h-3 mr-1 flex-shrink-0" />}
      <span className="truncate">{config.label}</span>
    </span>
  );
};

BadgeChip.displayName = "BadgeChip";

export default BadgeChip;

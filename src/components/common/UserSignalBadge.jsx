import { getUserSignal } from "../../utils/userSignals";
import { getSpecialUserStyle } from "../../utils/specialUserStyles";

const sizeClasses = {
  xs: "badge-xs text-[10px]",
  sm: "badge-sm text-[10px]",
};

const UserSignalBadge = ({ user, size = "xs", className = "" }) => {
  const signal = getUserSignal(user);
  if (!signal) return null;
  const specialStyle = getSpecialUserStyle(user);

  return (
    <span
      className={`badge font-semibold line-clamp-1 ${sizeClasses[size] || sizeClasses.xs} ${
        signal.key === "admin" ? specialStyle.label : signal.className
      } ${className}`}
    >
      {signal.label}
    </span>
  );
};

export default UserSignalBadge;

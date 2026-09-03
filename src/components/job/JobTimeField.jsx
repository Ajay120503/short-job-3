import { Clock3 } from "lucide-react";
import { formatJobTime } from "../../utils/jobSchedule";

const JobTimeField = ({ name, label, value, onChange, error }) => {
  const displayTime = formatJobTime(value);

  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-base-content/70">
        {label} <span className="text-error">*</span>
      </span>
      <span
        className={`flex h-12 items-center gap-2 rounded-xl border bg-base-100 px-3 transition-all focus-within:ring-2 ${
          error
            ? "border-error focus-within:ring-error/15"
            : "border-base-300 focus-within:border-primary/50 focus-within:ring-primary/15"
        }`}
      >
        <Clock3 className="h-4 w-4 shrink-0 text-primary" />
        <input
          name={name}
          type="time"
          value={value}
          onChange={onChange}
          required
          aria-invalid={Boolean(error)}
          className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm font-semibold text-base-content outline-none [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60"
        />
        <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold ${displayTime ? "bg-primary/10 text-primary" : "bg-base-200 text-base-content/35"}`}>
          {displayTime ? displayTime.split(" ").at(-1) : "AM/PM"}
        </span>
      </span>
      <span className={`mt-1 block min-h-4 text-[11px] ${error ? "font-medium text-error" : "text-base-content/40"}`}>
        {error || displayTime || `Select ${label.toLowerCase()}`}
      </span>
    </label>
  );
};

export default JobTimeField;

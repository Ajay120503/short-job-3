import { Check, ChevronDown, GraduationCap, X } from "lucide-react";

const JOB_QUALIFICATION_OPTIONS = [
  "No formal qualification required",
  "High School / 12th Pass",
  "ITI Certification",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate / PhD",
  "B.Ed",
  "M.Ed",
  "Teaching Certification",
  "Professional Certification",
  "Relevant Work Experience",
];

const NO_FORMAL_QUALIFICATION = JOB_QUALIFICATION_OPTIONS[0];
const MAX_SELECTIONS = 5;

const parseValue = (value) => [
  ...new Set(
    String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  ),
];

const QualificationMultiSelect = ({ value, onChange, error }) => {
  const selected = parseValue(value);

  const emitChange = (items) => {
    onChange({
      target: {
        name: "requiredQualifications",
        value: items.join(", "),
        type: "text",
      },
    });
  };

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      emitChange(selected.filter((item) => item !== option));
      return;
    }

    if (option === NO_FORMAL_QUALIFICATION) {
      emitChange([option]);
      return;
    }

    const withoutNoFormal = selected.filter(
      (item) => item !== NO_FORMAL_QUALIFICATION,
    );
    if (withoutNoFormal.length >= MAX_SELECTIONS) return;
    emitChange([...withoutNoFormal, option]);
  };

  const limitReached =
    selected.length >= MAX_SELECTIONS &&
    !selected.includes(NO_FORMAL_QUALIFICATION);

  return (
    <div>
      <details className="dropdown w-full">
        <summary
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "required-qualifications-error" : undefined}
          className={`flex h-12 w-full cursor-pointer list-none items-center justify-between rounded-lg border bg-base-100 px-3 text-sm transition-colors marker:content-none hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
            error ? "border-error" : "border-base-300"
          }`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
            <span
              className={
                selected.length
                  ? "truncate text-base-content"
                  : "truncate text-base-content/45"
              }
            >
              {selected.length
                ? `${selected.length} qualification${selected.length === 1 ? "" : "s"} selected`
                : "Select qualifications"}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-base-content/45" />
        </summary>

        <div className="z-app-dropdown dropdown-content mt-2 w-full rounded-xl border border-base-300 bg-base-100 p-2 shadow-xl">
          <div className="mb-2 flex items-center justify-between px-2 py-1">
            <span className="text-xs font-semibold">Choose up to 5</span>
            <span
              className={`text-xs font-bold ${
                limitReached ? "text-warning" : "text-base-content/45"
              }`}
            >
              {selected.length}/{MAX_SELECTIONS}
            </span>
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto overscroll-contain">
            {JOB_QUALIFICATION_OPTIONS.map((option) => {
              const checked = selected.includes(option);
              const disabled =
                !checked &&
                option !== NO_FORMAL_QUALIFICATION &&
                limitReached;
              return (
                <label
                  key={option}
                  className={`flex min-h-10 items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                    disabled
                      ? "cursor-not-allowed opacity-40"
                      : "cursor-pointer hover:bg-base-200"
                  } ${checked ? "bg-primary/10 text-primary" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleOption(option)}
                  />
                  <span className="min-w-0 flex-1">{option}</span>
                  {checked && <Check className="h-4 w-4 shrink-0" />}
                </label>
              );
            })}
          </div>
          {limitReached && (
            <p className="px-2 pt-2 text-[11px] font-medium text-warning">
              Maximum 5 qualifications selected. Remove one to choose another.
            </p>
          )}
        </div>
      </details>

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary"
            >
              <span className="truncate">{item}</span>
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-primary/15"
                onClick={() => emitChange(selected.filter((entry) => entry !== item))}
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="mt-1.5 text-[11px] text-base-content/45">
        Optional. Select the education or experience applicants should have.
      </p>
    </div>
  );
};

export default QualificationMultiSelect;

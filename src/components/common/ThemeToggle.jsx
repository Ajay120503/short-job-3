import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  APP_THEME_CHANGE_EVENT,
  getStoredThemeMode,
  setStoredThemeMode,
} from "../../utils/theme";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const ThemeToggle = ({ compact = false, className = "" }) => {
  const [mode, setMode] = useState(getStoredThemeMode);

  useEffect(() => {
    const syncMode = () => setMode(getStoredThemeMode());
    window.addEventListener(APP_THEME_CHANGE_EVENT, syncMode);
    window.addEventListener("storage", syncMode);
    return () => {
      window.removeEventListener(APP_THEME_CHANGE_EVENT, syncMode);
      window.removeEventListener("storage", syncMode);
    };
  }, []);

  if (compact) {
    const active = options.find((option) => option.value === mode) || options[2];
    const ActiveIcon = active.icon;

    return (
      <div className={`dropdown dropdown-end ${className}`}>
        <button
          type="button"
          tabIndex={0}
          className="btn btn-ghost btn-sm btn-circle"
          aria-label="Change theme"
          title={`Theme: ${active.label}`}
        >
          <ActiveIcon className="h-4 w-4" />
        </button>
        <div
          tabIndex={0}
          className="dropdown-content z-[60] mt-2 w-40 rounded-xl border border-base-300 bg-base-100 p-1.5 shadow-xl"
        >
          {options.map((option) => {
            const Icon = option.icon;
            const selected = mode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setStoredThemeMode(option.value);
                  document.activeElement?.blur();
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                  selected
                    ? "bg-primary/10 text-primary"
                    : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                }`}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex rounded-xl border border-base-300 bg-base-100/80 p-1 shadow-sm backdrop-blur ${className}`}
      aria-label="Theme selector"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const selected = mode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setStoredThemeMode(option.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
              selected
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/55 hover:bg-base-200 hover:text-base-content"
            }`}
            aria-pressed={selected}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;

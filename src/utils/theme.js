export const APP_THEME_STORAGE_KEY = "shortjob-theme-mode";
export const APP_THEME_MODES = ["light", "dark", "system"];
export const APP_THEME_CHANGE_EVENT = "shortjob-theme-change";

const canUseWindow = () => typeof window !== "undefined";
const canUseDocument = () => typeof document !== "undefined";

export const getStoredThemeMode = () => {
  if (!canUseWindow()) return "system";
  const stored = localStorage.getItem(APP_THEME_STORAGE_KEY);
  return APP_THEME_MODES.includes(stored) ? stored : "system";
};

export const getResolvedTheme = (mode = getStoredThemeMode()) => {
  if (mode === "dark") return "ShortJobDark";
  if (mode === "light") return "ShortJob";
  return canUseWindow() &&
    window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "ShortJobDark"
    : "ShortJob";
};

export const applyAppTheme = (mode = getStoredThemeMode()) => {
  const resolvedTheme = getResolvedTheme(mode);
  if (!canUseDocument()) return resolvedTheme;
  document.documentElement.setAttribute("data-theme", resolvedTheme);
  document.documentElement.style.colorScheme =
    resolvedTheme === "ShortJobDark" ? "dark" : "light";
  const themeColor = resolvedTheme === "ShortJobDark" ? "#071615" : "#147f83";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", themeColor);
  return resolvedTheme;
};

export const setStoredThemeMode = (mode) => {
  const nextMode = APP_THEME_MODES.includes(mode) ? mode : "system";
  if (canUseWindow()) {
    localStorage.setItem(APP_THEME_STORAGE_KEY, nextMode);
  }
  applyAppTheme(nextMode);
  if (canUseWindow()) {
    window.dispatchEvent(
      new CustomEvent(APP_THEME_CHANGE_EVENT, { detail: { mode: nextMode } })
    );
  }
  return nextMode;
};

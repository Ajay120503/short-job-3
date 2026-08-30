export const APP_FONT_STORAGE_KEY = "shortjob-font-mode";
export const APP_FONT_CHANGE_EVENT = "shortjob-font-change";

export const APP_FONT_OPTIONS = [
  {
    value: "modern",
    label: "Modern",
    description: "Balanced and clean",
    preview: "ShortJob",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Sharp work-focused UI",
    preview: "ShortJob",
  },
  {
    value: "rounded",
    label: "Rounded",
    description: "Friendly social feel",
    preview: "ShortJob",
  },
  {
    value: "editorial",
    label: "Editorial",
    description: "Premium profile style",
    preview: "ShortJob",
  },
  {
    value: "compact",
    label: "Compact",
    description: "Dense dashboard reading",
    preview: "ShortJob",
  },
  {
    value: "system",
    label: "System",
    description: "Use device font",
    preview: "ShortJob",
  },
];

export const APP_FONT_MODES = APP_FONT_OPTIONS.map((option) => option.value);

const canUseWindow = () => typeof window !== "undefined";
const canUseDocument = () => typeof document !== "undefined";

export const getStoredFontMode = () => {
  if (!canUseWindow()) return "modern";
  const stored = localStorage.getItem(APP_FONT_STORAGE_KEY);
  return APP_FONT_MODES.includes(stored) ? stored : "modern";
};

export const applyAppFont = (mode = getStoredFontMode()) => {
  const nextMode = APP_FONT_MODES.includes(mode) ? mode : "modern";
  if (canUseDocument()) {
    document.documentElement.setAttribute("data-font", nextMode);
  }
  return nextMode;
};

export const setStoredFontMode = (mode) => {
  const nextMode = APP_FONT_MODES.includes(mode) ? mode : "modern";
  if (canUseWindow()) {
    localStorage.setItem(APP_FONT_STORAGE_KEY, nextMode);
  }
  applyAppFont(nextMode);
  if (canUseWindow()) {
    window.dispatchEvent(
      new CustomEvent(APP_FONT_CHANGE_EVENT, { detail: { mode: nextMode } })
    );
  }
  return nextMode;
};

import hotToast from "react-hot-toast";

const recentToasts = new Map();
const DEDUPE_WINDOW_MS = 2500;
let sequence = 0;

const pruneRecent = (now) => {
  for (const [key, entry] of recentToasts) {
    if (now - entry.createdAt > DEDUPE_WINDOW_MS) recentToasts.delete(key);
  }
};

const show = (method, message, options = {}) => {
  const now = Date.now();
  pruneRecent(now);
  const suppliedKey = options.dedupeKey;
  const messageKey = typeof message === "string" ? message.trim() : "";
  const key = suppliedKey || (messageKey ? `${method}:${messageKey}` : "");
  const toastOptions = { ...options };
  delete toastOptions.dedupeKey;

  if (key) {
    const existing = recentToasts.get(key);
    if (existing && now - existing.createdAt <= DEDUPE_WINDOW_MS) return existing.id;
  }

  const id = toastOptions.id || `shortjob-toast-${now}-${sequence += 1}`;
  const toastId = method === "default"
    ? hotToast(message, { ...toastOptions, id })
    : hotToast[method](message, { ...toastOptions, id });
  if (key) recentToasts.set(key, { id: toastId, createdAt: now });
  return toastId;
};

const toast = (message, options) => show("default", message, options);
toast.success = (message, options) => show("success", message, options);
toast.error = (message, options) => show("error", message, options);
toast.loading = (message, options) => show("loading", message, options);
toast.dismiss = hotToast.dismiss;
toast.remove = hotToast.remove;
toast.promise = hotToast.promise;
toast.custom = (message, options) => show("custom", message, options);

export default toast;

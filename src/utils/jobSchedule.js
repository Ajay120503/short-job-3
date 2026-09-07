export const formatJobTime = (value) => {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value || "")) return "";
  const [hourText, minute] = value.split(":");
  const hour = Number(hourText);
  const period = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${minute} ${period}`;
};

export const getJobScheduleLabel = (job) => {
  const start = formatJobTime(job?.startTime);
  const end = formatJobTime(job?.endTime);
  return start && end ? `${start} – ${end}` : "";
};

export const calculateDurationHours = (startTime, endTime) => {
  if (!startTime || !endTime) return "";
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  let minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  if (minutes <= 0) minutes += 24 * 60;
  return Number((minutes / 60).toFixed(2));
};

export const calculateEndTime = (startTime, durationHours) => {
  if (!startTime || !Number.isFinite(Number(durationHours)) || Number(durationHours) <= 0) return "";
  const [hour, minute] = startTime.split(":").map(Number);
  const totalMinutes = (hour * 60 + minute + Math.round(Number(durationHours) * 60)) % (24 * 60);
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
};

export const formatJobDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const getJobDateTimeLabel = (job) => {
  const date = formatJobDate(job?.jobDate);
  const time = getJobScheduleLabel(job);
  return [date, time].filter(Boolean).join(" · ");
};

export const SHORT_JOB_TYPE_OPTIONS = [
  ["few_hours", "Few Hours"],
  ["one_day_gig", "One Day"],
  ["weekend_only", "Weekend"],
  ["short_term", "Short-Term"],
];

export const usesDailyWorkingHours = (shortJobType) =>
  shortJobType === "weekend_only" || shortJobType === "short_term";

export const getDurationUnitForJobType = (shortJobType) =>
  usesDailyWorkingHours(shortJobType) ? "days" : "hours";

export const getJobDurationHint = (shortJobType) => {
  if (shortJobType === "weekend_only") return "Weekend jobs are fixed at 2 days (Saturday and Sunday).";
  if (shortJobType === "short_term") return "Enter 1 to 7 whole working days.";
  if (shortJobType === "one_day_gig") return "Enter 0.25 to 24 hours for this one-day job.";
  return "Enter 0.25 to 24 hours for this job.";
};

export const getJobDurationLabel = (job) => {
  const value = Number(job?.duration?.value);
  if (!Number.isFinite(value) || value <= 0) return "Not specified";
  if (usesDailyWorkingHours(job?.shortJobType)) {
    const hours = Number(job?.workingHoursPerDay);
    const daysLabel = `${value} ${value === 1 ? "Day" : "Days"}`;
    return Number.isFinite(hours) && hours > 0
      ? `${daysLabel} × ${hours} Hours/Day`
      : daysLabel;
  }
  return `${value} ${value === 1 ? "Hour" : "Hours"}`;
};

const SHORT_JOB_TYPE_LABELS = {
  one_day_gig: "One Day",
  few_hours: "Few Hours",
  weekend_only: "Weekend",
  short_term: "Short-Term",
};

export const getShortJobTypeLabel = (job) =>
  SHORT_JOB_TYPE_LABELS[job?.shortJobType] || "Job opportunity";

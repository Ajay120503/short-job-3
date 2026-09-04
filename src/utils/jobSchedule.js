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

const SHORT_JOB_TYPE_LABELS = {
  one_day_gig: "One-day gig",
  few_hours: "A few hours",
  weekend_only: "Weekend opportunity",
  short_term: "Short-term opportunity",
  ongoing_part_time: "Part-time opportunity",
  full_time: "Full-time opportunity",
  internship: "Internship",
  volunteer: "Volunteer opportunity",
};

export const getShortJobTypeLabel = (job) =>
  SHORT_JOB_TYPE_LABELS[job?.shortJobType] || "Job opportunity";

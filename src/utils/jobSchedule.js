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

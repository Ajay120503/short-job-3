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

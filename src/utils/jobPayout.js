export const JOB_PAYOUT_MIN = 0.01;
export const JOB_PAYOUT_MAX = 1000000000;

export const getJobPayoutError = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "Payout / salary is required.";
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) {
    return "Enter a whole number or a decimal with no more than 2 digits after the decimal point.";
  }

  const amount = Number(text);
  if (!Number.isFinite(amount) || amount < JOB_PAYOUT_MIN) {
    return "Payout / salary must be at least 0.01.";
  }
  if (amount > JOB_PAYOUT_MAX) {
    return "Payout / salary cannot exceed 1,000,000,000.";
  }
  return "";
};

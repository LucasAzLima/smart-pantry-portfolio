export type ExpiryStatus = "expired" | "warning" | "fresh" | "none";

export const DEFAULT_EXPIRY_WARNING_DAYS = 7;

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EXPIRY_DATE_DIGIT_LIMIT = 8;

export function maskExpiryDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, EXPIRY_DATE_DIGIT_LIMIT);

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseExpiryDate(expiryDate: string): Date | null {
  const trimmed = expiryDate.trim();
  if (!trimmed || !DATE_ONLY_PATTERN.test(trimmed)) {
    return null;
  }

  const [yearText, monthText, dayText] = trimmed.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

/**
 * Returns expiry status relative to `now` (defaults to today).
 * - `none`: missing or invalid date
 * - `expired`: expiry date is before today
 * - `warning`: expiry is today or within `warningDays` days (inclusive)
 * - `fresh`: expiry is after the warning window
 */
export function calculateExpiryStatus(
  expiryDate: string,
  now: Date = new Date(),
  warningDays: number = DEFAULT_EXPIRY_WARNING_DAYS,
): ExpiryStatus {
  const expiry = parseExpiryDate(expiryDate);
  if (!expiry) {
    return "none";
  }

  const today = startOfLocalDay(now);
  const expiryDay = startOfLocalDay(expiry);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilExpiry = Math.round(
    (expiryDay.getTime() - today.getTime()) / msPerDay,
  );

  if (daysUntilExpiry < 0) {
    return "expired";
  }

  if (daysUntilExpiry <= warningDays) {
    return "warning";
  }

  return "fresh";
}

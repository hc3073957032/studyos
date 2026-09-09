export function startOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfDay(date: Date = new Date()): Date {
  const start = startOfDay(date);
  return new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59, 999);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfWeek(date: Date = new Date()): Date {
  const start = startOfDay(date);
  const day = (start.getDay() + 6) % 7;
  return addDays(start, -day);
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function minutesFromMilliseconds(ms: number): number {
  return Math.max(0, Math.round(ms / 60_000));
}

export function calculateStreak(sessionDates: Date[]): number {
  const uniqueDays = new Set(sessionDates.map((date) => toDateKey(date)));
  if (uniqueDays.size === 0) {
    return 0;
  }

  let cursor = startOfDay(new Date());
  if (!uniqueDays.has(toDateKey(cursor))) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (uniqueDays.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60, 120];

export function nextReviewInterval(currentDays: number, outcome: "again" | "hard" | "good" | "easy"): number {
  const index = REVIEW_INTERVALS.indexOf(currentDays);
  const currentIndex = index >= 0 ? index : 0;
  if (outcome === "again") {
    return 1;
  }
  if (outcome === "hard") {
    return REVIEW_INTERVALS[Math.max(0, currentIndex - 1)] ?? 1;
  }
  if (outcome === "easy") {
    return REVIEW_INTERVALS[Math.min(REVIEW_INTERVALS.length - 1, currentIndex + 2)] ?? currentDays;
  }
  return REVIEW_INTERVALS[Math.min(REVIEW_INTERVALS.length - 1, currentIndex + 1)] ?? currentDays;
}

import { describe, expect, it } from "vitest";

import {
  addDays,
  calculateStreak,
  nextReviewInterval,
  startOfDay,
  toDateKey,
} from "@/lib/algorithms/study";

describe("calculateStreak", () => {
  it("counts consecutive days ending today or yesterday", () => {
    const today = startOfDay(new Date());
    const dates = [today, addDays(today, -1), addDays(today, -2), addDays(today, -4)];
    expect(calculateStreak(dates)).toBe(3);
  });

  it("returns zero without sessions", () => {
    expect(calculateStreak([])).toBe(0);
  });
});

describe("nextReviewInterval", () => {
  it("moves along the review ladder for a good answer", () => {
    expect(nextReviewInterval(1, "good")).toBe(3);
    expect(nextReviewInterval(7, "good")).toBe(14);
  });

  it("resets after a forgotten answer", () => {
    expect(nextReviewInterval(14, "again")).toBe(1);
  });
});

describe("date helpers", () => {
  it("formats local dates in a stable key", () => {
    const date = new Date(2026, 8, 9);
    expect(toDateKey(date)).toBe("2026-09-09");
  });
});

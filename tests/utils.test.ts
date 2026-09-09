import { describe, expect, it } from "vitest";

import { formatMinutes, formatPercent, isToday } from "@/lib/utils";

describe("formatMinutes", () => {
  it("formats minutes below one hour", () => {
    expect(formatMinutes(30)).toBe("30 min");
  });

  it("formats whole hours", () => {
    expect(formatMinutes(120)).toBe("2h");
  });

  it("formats mixed durations", () => {
    expect(formatMinutes(155)).toBe("2h 35m");
  });
});

describe("formatPercent", () => {
  it("clamps values outside the valid range", () => {
    expect(formatPercent(120)).toBe("100%");
    expect(formatPercent(-5)).toBe("0%");
  });

  it("rounds partial percentages", () => {
    expect(formatPercent(67.8)).toBe("68%");
  });
});

describe("isToday", () => {
  it("recognizes the current day", () => {
    expect(isToday(new Date())).toBe(true);
  });
});

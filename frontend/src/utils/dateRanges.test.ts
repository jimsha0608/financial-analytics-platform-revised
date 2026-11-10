import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getDateRangeForPreset } from "./dateRanges";

describe("getDateRangeForPreset", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 16)); // August 16, 2026 (month is 0-indexed)
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("this_month spans from the 1st to today", () => {
    expect(getDateRangeForPreset("this_month")).toEqual({
      dateFrom: "2026-08-01",
      dateTo: "2026-08-16",
    });
  });

  it("last_month spans the entirety of the previous calendar month", () => {
    expect(getDateRangeForPreset("last_month")).toEqual({
      dateFrom: "2026-07-01",
      dateTo: "2026-07-31",
    });
  });

  it("last_3_months includes the current month plus two full months back", () => {
    expect(getDateRangeForPreset("last_3_months")).toEqual({
      dateFrom: "2026-06-01",
      dateTo: "2026-08-16",
    });
  });

  it("this_year spans from January 1st to today", () => {
    expect(getDateRangeForPreset("this_year")).toEqual({
      dateFrom: "2026-01-01",
      dateTo: "2026-08-16",
    });
  });

  it("handles last_month spanning a year boundary", () => {
    vi.setSystemTime(new Date(2026, 0, 15)); // January 15, 2026
    expect(getDateRangeForPreset("last_month")).toEqual({
      dateFrom: "2025-12-01",
      dateTo: "2025-12-31",
    });
  });
});

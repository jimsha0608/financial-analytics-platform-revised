import { describe, expect, it } from "vitest";

import { formatCurrency, formatDate, formatMonthLabel } from "./formatters";

describe("formatCurrency", () => {
  it("formats a decimal string as USD", () => {
    expect(formatCurrency("1234.5")).toBe("$1,234.50");
  });

  it("formats a negative number", () => {
    expect(formatCurrency(-42)).toBe("-$42.00");
  });

  it("formats zero", () => {
    expect(formatCurrency("0.00")).toBe("$0.00");
  });
});

describe("formatDate", () => {
  it("does not shift the date backward in timezones west of UTC", () => {
    expect(formatDate("2026-08-01")).toBe("Aug 1, 2026");
  });

  it("formats the last day of a month correctly", () => {
    expect(formatDate("2026-02-28")).toBe("Feb 28, 2026");
  });
});

describe("formatMonthLabel", () => {
  it("formats a month string as a full month and year", () => {
    expect(formatMonthLabel("2026-08-01")).toBe("August 2026");
  });
});

export type DateRangePreset =
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "last_6_months"
  | "this_year"
  | "custom";

export interface DateRange {
  dateFrom: string;
  dateTo: string;
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDateRangeForPreset(preset: Exclude<DateRangePreset, "custom">): DateRange {
  const now = new Date();

  switch (preset) {
    case "this_month":
      return {
        dateFrom: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
        dateTo: toISODate(now),
      };
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { dateFrom: toISODate(start), dateTo: toISODate(end) };
    }
    case "last_3_months":
      return {
        dateFrom: toISODate(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
        dateTo: toISODate(now),
      };
    case "last_6_months":
      return {
        dateFrom: toISODate(new Date(now.getFullYear(), now.getMonth() - 5, 1)),
        dateTo: toISODate(now),
      };
    case "this_year":
      return {
        dateFrom: toISODate(new Date(now.getFullYear(), 0, 1)),
        dateTo: toISODate(now),
      };
  }
}

export const DATE_RANGE_PRESET_LABELS: Record<DateRangePreset, string> = {
  this_month: "This Month",
  last_month: "Last Month",
  last_3_months: "Last 3 Months",
  last_6_months: "Last 6 Months",
  this_year: "This Year",
  custom: "Custom Range",
};

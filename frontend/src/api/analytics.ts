import { apiClient } from "./client";
import type {
  AnalyticsSummary,
  CategoryBreakdownItem,
  MonthlyReport,
  TrendPoint,
} from "./types";

export interface DateRangeParams {
  date_from?: string;
  date_to?: string;
}

export async function fetchSummary(params: DateRangeParams): Promise<AnalyticsSummary> {
  const { data } = await apiClient.get<AnalyticsSummary>("/analytics/summary/", { params });
  return data;
}

export async function fetchCategoryBreakdown(
  params: DateRangeParams & { type?: "income" | "expense" }
): Promise<CategoryBreakdownItem[]> {
  const { data } = await apiClient.get<CategoryBreakdownItem[]>("/analytics/categories/", {
    params,
  });
  return data;
}

export async function fetchTrend(
  params: DateRangeParams & { interval?: "day" | "week" | "month" }
): Promise<TrendPoint[]> {
  const { data } = await apiClient.get<TrendPoint[]>("/analytics/trend/", { params });
  return data;
}

export async function fetchMonthlyReport(month: string): Promise<MonthlyReport> {
  const { data } = await apiClient.get<MonthlyReport>("/reports/monthly/", {
    params: { month },
  });
  return data;
}

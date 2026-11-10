import { useEffect, useMemo, useState } from "react";

import { fetchCategoryBreakdown, fetchSummary, fetchTrend } from "@/api/analytics";
import { listTransactions } from "@/api/transactions";
import type {
  AnalyticsSummary,
  CategoryBreakdownItem,
  Transaction,
  TrendPoint,
} from "@/api/types";
import CategoryBreakdownChart from "@/components/dashboard/CategoryBreakdownChart";
import DateRangeSelector from "@/components/dashboard/DateRangeSelector";
import RecentTransactionsList from "@/components/dashboard/RecentTransactionsList";
import SummaryCards from "@/components/dashboard/SummaryCards";
import TopCategoriesList from "@/components/dashboard/TopCategoriesList";
import TrendChart from "@/components/dashboard/TrendChart";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Spinner from "@/components/ui/Spinner";
import { getErrorMessage } from "@/utils/apiError";
import { getDateRangeForPreset, type DateRangePreset } from "@/utils/dateRanges";

function daysBetween(from: string, to: string): number {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

export default function DashboardPage() {
  const [preset, setPreset] = useState<DateRangePreset>("this_month");
  const [customFrom, setCustomFrom] = useState(() => getDateRangeForPreset("this_month").dateFrom);
  const [customTo, setCustomTo] = useState(() => getDateRangeForPreset("this_month").dateTo);

  const { dateFrom, dateTo } = useMemo(() => {
    if (preset === "custom") {
      return { dateFrom: customFrom, dateTo: customTo };
    }
    return getDateRangeForPreset(preset);
  }, [preset, customFrom, customTo]);

  const interval = useMemo<"day" | "week" | "month">(() => {
    const span = daysBetween(dateFrom, dateTo);
    if (span <= 31) return "day";
    if (span <= 120) return "week";
    return "month";
  }, [dateFrom, dateTo]);

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetchSummary({ date_from: dateFrom, date_to: dateTo }),
      fetchCategoryBreakdown({ date_from: dateFrom, date_to: dateTo, type: "expense" }),
      fetchTrend({ date_from: dateFrom, date_to: dateTo, interval }),
      listTransactions({ ordering: "-date", page_size: 5 }),
    ])
      .then(([summaryData, breakdownData, trendData, transactionsData]) => {
        if (!isMounted) return;
        setSummary(summaryData);
        setCategoryBreakdown(breakdownData);
        setTrend(trendData);
        setRecentTransactions(transactionsData.results);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(getErrorMessage(err));
        setSummary(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dateFrom, dateTo, interval]);

  function handlePresetChange(nextPreset: DateRangePreset) {
    setPreset(nextPreset);
    if (nextPreset !== "custom") {
      const range = getDateRangeForPreset(nextPreset);
      setCustomFrom(range.dateFrom);
      setCustomTo(range.dateTo);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <DateRangeSelector
          preset={preset}
          customFrom={customFrom}
          customTo={customTo}
          onPresetChange={handlePresetChange}
          onCustomChange={(from, to) => {
            setCustomFrom(from);
            setCustomTo(to);
          }}
        />
      </div>

      {error && <ErrorMessage message={error} />}

      {isLoading && !summary ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : (
        summary && (
          <>
            <SummaryCards summary={summary} />
            <TrendChart data={trend} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CategoryBreakdownChart data={categoryBreakdown} />
              <TopCategoriesList data={categoryBreakdown} />
            </div>
            <RecentTransactionsList transactions={recentTransactions} />
          </>
        )
      )}
    </div>
  );
}

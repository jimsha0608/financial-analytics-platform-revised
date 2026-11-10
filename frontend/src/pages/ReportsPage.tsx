import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchMonthlyReport } from "@/api/analytics";
import type { MonthlyReport } from "@/api/types";
import CategoryBreakdownChart from "@/components/dashboard/CategoryBreakdownChart";
import Card from "@/components/ui/Card";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Spinner from "@/components/ui/Spinner";
import { getErrorMessage } from "@/utils/apiError";
import { formatCurrency, formatDate, formatMonthLabel } from "@/utils/formatters";

function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function ChangeBadge({
  percent,
  positiveIsGood,
}: {
  percent: number | null;
  positiveIsGood: boolean;
}) {
  if (percent === null) {
    return <span className="text-xs text-slate-400">No data last month</span>;
  }
  const isIncrease = percent > 0;
  const isGood = percent === 0 ? null : isIncrease === positiveIsGood;
  const Icon = isIncrease ? TrendingUp : TrendingDown;
  const colorClass = isGood === null ? "text-slate-500" : isGood ? "text-emerald-600" : "text-red-600";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${colorClass}`}>
      {percent !== 0 && <Icon className="h-3.5 w-3.5" aria-hidden />}
      {Math.abs(percent)}% vs last month
    </span>
  );
}

export default function ReportsPage() {
  const [month, setMonth] = useState(currentMonthValue());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    fetchMonthlyReport(month)
      .then((data) => {
        if (isMounted) setReport(data);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(getErrorMessage(err));
        setReport(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [month]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold text-slate-900">Monthly Report</h1>
        <input
          type="month"
          value={month}
          max={currentMonthValue()}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {error && <ErrorMessage message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : report ? (
        <>
          <p className="text-sm text-slate-500">Showing report for {formatMonthLabel(report.month)}</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-sm text-slate-500">Total Income</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {formatCurrency(report.total_income)}
              </p>
              <div className="mt-1">
                <ChangeBadge percent={report.income_change_percent} positiveIsGood />
              </div>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Total Expenses</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {formatCurrency(report.total_expenses)}
              </p>
              <div className="mt-1">
                <ChangeBadge percent={report.expense_change_percent} positiveIsGood={false} />
              </div>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Net Savings</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {formatCurrency(report.net_savings)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {formatCurrency(report.previous_month.net_savings)} last month
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CategoryBreakdownChart data={report.spending_by_category} title="Spending by Category" />

            <Card>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Largest Expenses</h3>
              {report.largest_expenses.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  No expenses recorded this month.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {report.largest_expenses.map((expense) => (
                    <li key={expense.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{expense.description}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(expense.date)}
                          {expense.category_name ? ` · ${expense.category_name}` : ""}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-red-600">
                        {formatCurrency(expense.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Compared to {formatMonthLabel(report.previous_month.month)}
            </h3>
            <dl className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Income</dt>
                <dd className="font-medium text-slate-900">
                  {formatCurrency(report.previous_month.total_income)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Expenses</dt>
                <dd className="font-medium text-slate-900">
                  {formatCurrency(report.previous_month.total_expenses)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Net Savings</dt>
                <dd className="font-medium text-slate-900">
                  {formatCurrency(report.previous_month.net_savings)}
                </dd>
              </div>
            </dl>
          </Card>
        </>
      ) : null}
    </div>
  );
}

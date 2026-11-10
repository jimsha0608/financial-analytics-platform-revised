import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Wallet } from "lucide-react";

import type { AnalyticsSummary } from "@/api/types";
import Card from "@/components/ui/Card";
import { formatCurrency } from "@/utils/formatters";

interface SummaryCardsProps {
  summary: AnalyticsSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const netIsPositive = Number(summary.net_income) >= 0;

  const cards = [
    {
      label: "Total Income",
      value: summary.total_income,
      icon: ArrowUpCircle,
      accent: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Total Expenses",
      value: summary.total_expenses,
      icon: ArrowDownCircle,
      accent: "text-red-600 bg-red-50",
    },
    {
      label: "Net Income",
      value: summary.net_income,
      icon: TrendingUp,
      accent: netIsPositive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50",
    },
    {
      label: "Current Balance",
      value: summary.current_balance,
      icon: Wallet,
      accent: "text-brand-600 bg-brand-50",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, accent }) => (
        <Card key={label} className="flex items-center gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accent}`}>
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(value)}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

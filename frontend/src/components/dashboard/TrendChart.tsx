import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TrendPoint } from "@/api/types";
import Card from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface TrendChartProps {
  data: TrendPoint[];
}

export default function TrendChart({ data }: TrendChartProps) {
  const chartData = data.map((point) => ({
    label: formatDate(point.period),
    income: Number(point.income),
    expenses: Number(point.expenses),
  }));

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Income vs Expenses</h3>
      {chartData.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">No data for this period.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
              tickFormatter={(v: number) => formatCurrency(v)}
              width={80}
            />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

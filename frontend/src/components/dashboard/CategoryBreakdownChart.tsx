import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { CategoryBreakdownItem } from "@/api/types";
import Card from "@/components/ui/Card";
import { formatCurrency } from "@/utils/formatters";

const FALLBACK_COLORS = [
  "#3b66f5",
  "#14b8a6",
  "#f97316",
  "#ec4899",
  "#8b5cf6",
  "#eab308",
  "#ef4444",
  "#06b6d4",
  "#6366f1",
  "#6b7280",
];

interface CategoryBreakdownChartProps {
  data: CategoryBreakdownItem[];
  title?: string;
}

export default function CategoryBreakdownChart({
  data,
  title = "Expenses by Category",
}: CategoryBreakdownChartProps) {
  const chartData = data.map((item) => ({ ...item, totalValue: Number(item.total) }));

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-slate-900">{title}</h3>
      {chartData.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">No data for this period.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="totalValue"
              nameKey="category_name"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.category_id ?? `uncategorized-${index}`}
                  fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              formatter={(value: string) => <span className="text-xs text-slate-600">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

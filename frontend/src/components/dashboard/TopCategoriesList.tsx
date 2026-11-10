import type { CategoryBreakdownItem } from "@/api/types";
import Card from "@/components/ui/Card";
import { formatCurrency } from "@/utils/formatters";

interface TopCategoriesListProps {
  data: CategoryBreakdownItem[];
  limit?: number;
}

export default function TopCategoriesList({ data, limit = 5 }: TopCategoriesListProps) {
  const topCategories = data.slice(0, limit);

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Top Spending Categories</h3>
      {topCategories.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">No data for this period.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {topCategories.map((category) => (
            <li key={category.category_id ?? category.category_name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{category.category_name}</span>
                <span className="text-slate-500">{formatCurrency(category.total)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${category.percentage}%`,
                    backgroundColor: category.color || "#3b66f5",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

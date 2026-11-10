import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from "lucide-react";

import type { Transaction } from "@/api/types";
import { formatCurrency, formatDate } from "@/utils/formatters";

type SortableColumn = "date" | "amount";

const SORTABLE_COLUMNS: { key: SortableColumn; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount" },
];

interface TransactionTableProps {
  transactions: Transaction[];
  ordering: string;
  onOrderingChange: (ordering: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export default function TransactionTable({
  transactions,
  ordering,
  onOrderingChange,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  function toggleSort(column: SortableColumn) {
    onOrderingChange(ordering === `-${column}` ? column : `-${column}`);
  }

  function sortIcon(column: SortableColumn) {
    if (ordering === column) return <ArrowUp className="h-3.5 w-3.5" />;
    if (ordering === `-${column}`) return <ArrowDown className="h-3.5 w-3.5" />;
    return <ArrowUpDown className="h-3.5 w-3.5 text-slate-300" />;
  }

  if (transactions.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-slate-400">No transactions match your filters.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            {SORTABLE_COLUMNS.map((col) => (
              <th key={col.key} className="py-2 pr-4 font-medium">
                <button
                  className="flex items-center gap-1 hover:text-slate-700"
                  onClick={() => toggleSort(col.key)}
                >
                  {col.label}
                  {sortIcon(col.key)}
                </button>
              </th>
            ))}
            <th className="py-2 pr-4 font-medium">Description</th>
            <th className="py-2 pr-4 font-medium">Category</th>
            <th className="py-2 pr-4 font-medium">Type</th>
            <th className="py-2 pr-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((txn) => (
            <tr key={txn.id} className="text-slate-700">
              <td className="py-3 pr-4 whitespace-nowrap">{formatDate(txn.date)}</td>
              <td
                className={`py-3 pr-4 font-medium whitespace-nowrap ${
                  txn.type === "income" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {txn.type === "income" ? "+" : "-"}
                {formatCurrency(txn.amount)}
              </td>
              <td className="py-3 pr-4">
                <div>{txn.description}</div>
                {txn.merchant && <div className="text-xs text-slate-400">{txn.merchant}</div>}
              </td>
              <td className="py-3 pr-4">{txn.category_name ?? "Uncategorized"}</td>
              <td className="py-3 pr-4 capitalize">{txn.type}</td>
              <td className="py-3 pr-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(txn)}
                    className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
                    aria-label={`Edit ${txn.description}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(txn)}
                    className="rounded p-1.5 text-red-500 hover:bg-red-50"
                    aria-label={`Delete ${txn.description}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

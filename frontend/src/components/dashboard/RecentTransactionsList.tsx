import { Link } from "react-router-dom";

import type { Transaction } from "@/api/types";
import Card from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface RecentTransactionsListProps {
  transactions: Transaction[];
}

export default function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
        <Link to="/transactions" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          View all
        </Link>
      </div>
      {transactions.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">No transactions yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {transactions.map((txn) => (
            <li key={txn.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{txn.description}</p>
                <p className="text-xs text-slate-500">
                  {formatDate(txn.date)}
                  {txn.category_name ? ` · ${txn.category_name}` : ""}
                </p>
              </div>
              <span
                className={`text-sm font-semibold ${
                  txn.type === "income" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {txn.type === "income" ? "+" : "-"}
                {formatCurrency(txn.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

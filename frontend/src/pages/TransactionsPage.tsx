import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
  type TransactionPayload,
} from "@/api/transactions";
import type { Transaction } from "@/api/types";
import TransactionFiltersBar, {
  type NonSearchFilters,
} from "@/components/transactions/TransactionFilters";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionTable from "@/components/transactions/TransactionTable";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import Spinner from "@/components/ui/Spinner";
import { useCategories } from "@/hooks/useCategories";
import { useDebounce } from "@/hooks/useDebounce";
import { getErrorMessage } from "@/utils/apiError";

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const { categories } = useCategories();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 350);
  const [filters, setFilters] = useState<NonSearchFilters>({});
  const [ordering, setOrdering] = useState("-date");
  const [page, setPage] = useState(1);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    listTransactions({
      ...filters,
      search: debouncedSearch || undefined,
      ordering,
      page,
      page_size: PAGE_SIZE,
    })
      .then((data) => {
        if (!isMounted) return;
        setTransactions(data.results);
        setCount(data.count);
      })
      .catch((err: unknown) => {
        if (isMounted) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filters, debouncedSearch, ordering, page, refreshToken]);

  function handleFiltersChange(next: NonSearchFilters) {
    setFilters(next);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPage(1);
  }

  function handleOrderingChange(next: string) {
    setOrdering(next);
    setPage(1);
  }

  function handleClearFilters() {
    setFilters({});
    setSearchInput("");
    setPage(1);
  }

  function refresh() {
    setRefreshToken((n) => n + 1);
  }

  async function handleCreate(payload: TransactionPayload) {
    await createTransaction(payload);
    setIsCreating(false);
    refresh();
  }

  async function handleUpdate(payload: TransactionPayload) {
    if (!editingTransaction) return;
    await updateTransaction(editingTransaction.id, payload);
    setEditingTransaction(null);
    refresh();
  }

  async function handleDelete(transaction: Transaction) {
    if (!window.confirm(`Delete "${transaction.description}"? This cannot be undone.`)) return;
    await deleteTransaction(transaction.id);
    refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Transactions</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4" aria-hidden /> Add transaction
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <TransactionFiltersBar
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          filters={filters}
          categories={categories}
          onChange={handleFiltersChange}
          onClear={handleClearFilters}
        />
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <>
            <TransactionTable
              transactions={transactions}
              ordering={ordering}
              onOrderingChange={handleOrderingChange}
              onEdit={setEditingTransaction}
              onDelete={handleDelete}
            />
            <div className="mt-4">
              <Pagination page={page} pageSize={PAGE_SIZE} count={count} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {isCreating && (
        <Modal title="Add transaction" onClose={() => setIsCreating(false)}>
          <TransactionForm
            categories={categories}
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </Modal>
      )}

      {editingTransaction && (
        <Modal title="Edit transaction" onClose={() => setEditingTransaction(null)}>
          <TransactionForm
            categories={categories}
            initialValue={editingTransaction}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTransaction(null)}
          />
        </Modal>
      )}
    </div>
  );
}

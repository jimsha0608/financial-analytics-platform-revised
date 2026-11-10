import { useState, type FormEvent } from "react";

import type { TransactionPayload } from "@/api/transactions";
import type { Category, Transaction } from "@/api/types";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { getErrorMessage } from "@/utils/apiError";
import { getDateRangeForPreset } from "@/utils/dateRanges";

interface TransactionFormProps {
  categories: Category[];
  initialValue?: Transaction;
  onSubmit: (payload: TransactionPayload) => Promise<void>;
  onCancel: () => void;
}

const today = getDateRangeForPreset("this_month").dateTo;

export default function TransactionForm({
  categories,
  initialValue,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionPayload["type"]>(initialValue?.type ?? "expense");
  const [amount, setAmount] = useState(initialValue?.amount ?? "");
  const [date, setDate] = useState(initialValue?.date ?? today);
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [merchant, setMerchant] = useState(initialValue?.merchant ?? "");
  const [notes, setNotes] = useState(initialValue?.notes ?? "");
  const [category, setCategory] = useState(
    initialValue?.category ? String(initialValue.category) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        amount,
        date,
        description,
        merchant: merchant || undefined,
        notes: notes || undefined,
        category: category ? Number(category) : null,
      });
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <ErrorMessage message={error} />}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as TransactionPayload["type"])}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          required
          max={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <Input
        label="Description"
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input label="Merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} />
      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium text-slate-700">
          Notes
        </label>
        <textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialValue ? "Save changes" : "Add transaction"}
        </Button>
      </div>
    </form>
  );
}

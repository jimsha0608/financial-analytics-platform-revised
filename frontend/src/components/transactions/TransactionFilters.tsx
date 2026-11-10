import type { TransactionFilters as Filters } from "@/api/transactions";
import type { Category, TransactionType } from "@/api/types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export type NonSearchFilters = Omit<Filters, "search" | "page" | "page_size" | "ordering">;

interface TransactionFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: NonSearchFilters;
  categories: Category[];
  onChange: (filters: NonSearchFilters) => void;
  onClear: () => void;
}

export default function TransactionFiltersBar({
  searchValue,
  onSearchChange,
  filters,
  categories,
  onChange,
  onClear,
}: TransactionFiltersProps) {
  function handleTypeChange(value: string) {
    onChange({ ...filters, type: value === "" ? undefined : (value as TransactionType) });
  }

  function handleCategoryChange(value: string) {
    onChange({ ...filters, category: value === "" ? undefined : Number(value) });
  }

  function handleDateFromChange(value: string) {
    onChange({ ...filters, date_from: value === "" ? undefined : value });
  }

  function handleDateToChange(value: string) {
    onChange({ ...filters, date_to: value === "" ? undefined : value });
  }

  function handleMinAmountChange(value: string) {
    onChange({ ...filters, min_amount: value === "" ? undefined : value });
  }

  function handleMaxAmountChange(value: string) {
    onChange({ ...filters, max_amount: value === "" ? undefined : value });
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
      <div className="lg:col-span-2">
        <Input
          label="Search"
          placeholder="Description, merchant, notes..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select label="Type" value={filters.type ?? ""} onChange={(e) => handleTypeChange(e.target.value)}>
        <option value="">All</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </Select>
      <Select
        label="Category"
        value={filters.category ?? ""}
        onChange={(e) => handleCategoryChange(e.target.value)}
      >
        <option value="">All</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Input
        label="From"
        type="date"
        value={filters.date_from ?? ""}
        onChange={(e) => handleDateFromChange(e.target.value)}
      />
      <Input
        label="To"
        type="date"
        value={filters.date_to ?? ""}
        onChange={(e) => handleDateToChange(e.target.value)}
      />
      <div className="flex items-end gap-2">
        <Input
          label="Min $"
          type="number"
          step="0.01"
          min="0"
          value={filters.min_amount ?? ""}
          onChange={(e) => handleMinAmountChange(e.target.value)}
        />
        <Input
          label="Max $"
          type="number"
          step="0.01"
          min="0"
          value={filters.max_amount ?? ""}
          onChange={(e) => handleMaxAmountChange(e.target.value)}
        />
      </div>
      <div className="flex items-end lg:col-span-7">
        <button onClick={onClear} className="text-sm font-medium text-slate-500 hover:text-slate-700">
          Clear filters
        </button>
      </div>
    </div>
  );
}

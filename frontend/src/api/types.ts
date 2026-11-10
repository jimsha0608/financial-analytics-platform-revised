export type TransactionType = "income" | "expense";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  date: string;
  description: string;
  merchant: string;
  notes: string;
  category: number | null;
  category_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiErrorBody {
  detail: string;
  errors?: Record<string, string[]>;
}

export interface AnalyticsSummary {
  total_income: string;
  total_expenses: string;
  net_income: string;
  current_balance: string;
}

export interface CategoryBreakdownItem {
  category_id: number | null;
  category_name: string;
  color: string;
  total: string;
  percentage: number;
}

export interface TrendPoint {
  period: string;
  income: string;
  expenses: string;
}

export interface LargestExpense {
  id: string;
  description: string;
  merchant: string;
  amount: string;
  date: string;
  category_name: string | null;
}

export interface MonthlyReport {
  month: string;
  total_income: string;
  total_expenses: string;
  net_savings: string;
  spending_by_category: CategoryBreakdownItem[];
  largest_expenses: LargestExpense[];
  previous_month: {
    month: string;
    total_income: string;
    total_expenses: string;
    net_savings: string;
  };
  income_change_percent: number | null;
  expense_change_percent: number | null;
}

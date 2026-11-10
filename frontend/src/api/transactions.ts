import { apiClient } from "./client";
import type { PaginatedResponse, Transaction, TransactionType } from "./types";

export interface TransactionFilters {
  search?: string;
  type?: TransactionType;
  category?: number;
  date_from?: string;
  date_to?: string;
  min_amount?: string;
  max_amount?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export async function listTransactions(
  filters: TransactionFilters = {}
): Promise<PaginatedResponse<Transaction>> {
  const { data } = await apiClient.get<PaginatedResponse<Transaction>>("/transactions/", {
    params: filters,
  });
  return data;
}

export interface TransactionPayload {
  type: TransactionType;
  amount: string;
  date: string;
  description: string;
  merchant?: string;
  notes?: string;
  category?: number | null;
}

export async function createTransaction(payload: TransactionPayload): Promise<Transaction> {
  const { data } = await apiClient.post<Transaction>("/transactions/", payload);
  return data;
}

export async function getTransaction(id: string): Promise<Transaction> {
  const { data } = await apiClient.get<Transaction>(`/transactions/${id}/`);
  return data;
}

export async function updateTransaction(
  id: string,
  payload: Partial<TransactionPayload>
): Promise<Transaction> {
  const { data } = await apiClient.patch<Transaction>(`/transactions/${id}/`, payload);
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/transactions/${id}/`);
}

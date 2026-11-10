import { apiClient } from "./client";
import type { Category, PaginatedResponse } from "./types";

export async function listCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<PaginatedResponse<Category>>("/categories/", {
    params: { page_size: 100 },
  });
  return data.results;
}

export interface CategoryPayload {
  name: string;
  icon?: string;
  color?: string;
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const { data } = await apiClient.post<Category>("/categories/", payload);
  return data;
}

export async function updateCategory(
  id: number,
  payload: Partial<CategoryPayload>
): Promise<Category> {
  const { data } = await apiClient.patch<Category>(`/categories/${id}/`, payload);
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}/`);
}

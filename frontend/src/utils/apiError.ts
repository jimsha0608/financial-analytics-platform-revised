import { isAxiosError } from "axios";

import type { ApiErrorBody } from "@/api/types";

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    const data = error.response?.data;
    const firstFieldError = data?.errors && Object.values(data.errors)[0];
    if (Array.isArray(firstFieldError) && firstFieldError.length > 0) {
      return firstFieldError[0];
    }
    if (data?.detail) {
      return data.detail;
    }
    if (error.message === "Network Error") {
      return "Could not reach the server. Please check your connection and try again.";
    }
  }
  return "Something went wrong. Please try again.";
}

import { apiClient } from "./client";
import { clearTokens, getRefreshToken, setTokens } from "./tokenStorage";
import type { User } from "./types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export async function login(payload: LoginPayload): Promise<User> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login/", payload);
  setTokens({ access: data.access, refresh: data.refresh });
  return data.user;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await apiClient.post<User>("/auth/register/", payload);
  return data;
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  try {
    if (refresh) {
      await apiClient.post("/auth/logout/", { refresh });
    }
  } finally {
    clearTokens();
  }
}

export async function fetchProfile(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me/");
  return data;
}

export async function updateProfile(
  payload: Partial<Pick<User, "first_name" | "last_name">>
): Promise<User> {
  const { data } = await apiClient.patch<User>("/auth/me/", payload);
  return data;
}

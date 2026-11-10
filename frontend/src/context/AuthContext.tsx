import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import * as authApi from "@/api/auth";
import { getAccessToken } from "@/api/tokenStorage";
import type { User } from "@/api/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: authApi.RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: Partial<Pick<User, "first_name" | "last_name">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!getAccessToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await authApi.fetchProfile();
        if (isMounted) setUser(profile);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (email, password) => {
        const profile = await authApi.login({ email, password });
        setUser(profile);
      },
      register: async (payload) => {
        await authApi.register(payload);
      },
      logout: async () => {
        await authApi.logout();
        setUser(null);
      },
      updateProfile: async (payload) => {
        const profile = await authApi.updateProfile(payload);
        setUser(profile);
      },
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

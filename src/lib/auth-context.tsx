"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface Tenant {
  id: string;
  email: string;
  fleetName: string;
}

interface AuthContextValue {
  status: "loading" | "authenticated" | "unauthenticated";
  tenant: Tenant | null;
  refresh: () => Promise<void>;
  setTenant: (tenant: Tenant | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  status: "loading",
  tenant: null,
  refresh: async () => {},
  setTenant: () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");
  const [tenant, setTenantState] = useState<Tenant | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (data.authenticated && data.tenant) {
        setTenantState(data.tenant);
        setStatus("authenticated");
      } else {
        setTenantState(null);
        setStatus("unauthenticated");
      }
    } catch {
      setTenantState(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setTenant = useCallback((next: Tenant | null) => {
    setTenantState(next);
    setStatus(next ? "authenticated" : "unauthenticated");
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    setTenantState(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ status, tenant, refresh, setTenant, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

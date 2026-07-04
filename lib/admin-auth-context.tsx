"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import adminApi from "./admin-api";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAdmin: (user: AdminUser) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin]   = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("luxx-admin-user");
    const token  = localStorage.getItem("luxx-admin-token");
    if (stored && token) {
      try { setAdmin(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const { data } = await adminApi.post("/admin/login", { email, password });
    localStorage.setItem("luxx-admin-token", data.token);
    localStorage.setItem("luxx-admin-user", JSON.stringify(data.user));
    setAdmin(data.user);
  }

  async function logout() {
    try { await adminApi.post("/admin/logout"); } catch { /* ignore */ }
    localStorage.removeItem("luxx-admin-token");
    localStorage.removeItem("luxx-admin-user");
    setAdmin(null);
  }

  function updateAdmin(user: AdminUser) {
    localStorage.setItem("luxx-admin-user", JSON.stringify(user));
    setAdmin(user);
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, updateAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}

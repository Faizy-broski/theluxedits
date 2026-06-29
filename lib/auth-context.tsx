"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import api from "./api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser> & { password?: string; password_confirmation?: string }) => Promise<void>;
  autoLogin: (userData: AuthUser, authToken: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("luxx-token");
    const storedUser  = localStorage.getItem("luxx-user");
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  function persist(u: AuthUser, t: string) {
    setUser(u);
    setToken(t);
    localStorage.setItem("luxx-token", t);
    localStorage.setItem("luxx-user", JSON.stringify(u));
  }

  async function syncLocalCartToServer() {
    try {
      const stored = localStorage.getItem("luxx-cart");
      if (!stored) return;
      const items = JSON.parse(stored) as Array<{ id: string; quantity: number }>;
      if (!items.length) return;
      await api.post("/cart/sync", {
        items: items.map((i) => ({ product_id: parseInt(i.id), quantity: i.quantity })),
      });
    } catch { /* best-effort */ }
  }

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    persist(data.user, data.token);
    await syncLocalCartToServer();
  }

  async function register(formData: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) {
    const { data } = await api.post("/auth/register", formData);
    persist(data.user, data.token);
    await syncLocalCartToServer();
  }

  async function logout() {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    setUser(null);
    setToken(null);
    localStorage.removeItem("luxx-token");
    localStorage.removeItem("luxx-user");
  }

  async function updateProfile(formData: Partial<AuthUser> & { password?: string; password_confirmation?: string }) {
    const { data } = await api.put("/auth/profile", formData);
    const updated = data as AuthUser;
    setUser(updated);
    localStorage.setItem("luxx-user", JSON.stringify(updated));
  }

  function autoLogin(userData: AuthUser, authToken: string) {
    persist(userData, authToken);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, autoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

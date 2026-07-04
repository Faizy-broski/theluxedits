"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Globe, Settings,
  LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { cn } from "@/lib/utils";

const nav = [
  {
    section: "Menu",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Products",  href: "/admin/products",  icon: Package },
      { label: "Orders",    href: "/admin/orders",    icon: ShoppingCart },
      { label: "Websites",  href: "/admin/websites",  icon: Globe },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { admin, loading, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !admin) router.replace("/admin/login");
  }, [admin, loading, router]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (loading || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  async function handleLogout() {
    await logout();
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-neutral-100">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-neutral-950 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin/dashboard">
            <Image src="/logo/TheLuxEdits.png" alt="TheLuxEdits" width={130} height={32}
              className="h-6 w-auto object-contain brightness-0 invert" />
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-white/40 hover:text-white lg:hidden">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-5">
          {nav.map((group) => (
            <div key={group.section}>
              <p className="mb-2 px-2 font-jet text-[8px] uppercase tracking-[0.35em] text-white/25">
                {group.section}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link key={href} href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 font-jet text-[11px] uppercase tracking-[0.15em] transition-colors",
                        active
                          ? "bg-white text-black"
                          : "text-white/55 hover:bg-white/8 hover:text-white"
                      )}>
                      <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                      {label}
                      {active && <ChevronRight className="ml-auto h-3 w-3" strokeWidth={1.5} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/10 px-3 py-4">
          <div className="mb-3 px-2">
            <p className="text-[12px] font-medium text-white/80 truncate">{admin.name}</p>
            <p className="font-jet text-[9px] uppercase tracking-[0.15em] text-white/35 truncate">{admin.email}</p>
          </div>
          <button onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-jet text-[11px] uppercase tracking-[0.15em] text-white/40 transition-colors hover:bg-white/8 hover:text-white">
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-black/10 bg-white px-5 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="text-black/40 hover:text-black lg:hidden">
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <span className="hidden font-jet text-[10px] uppercase tracking-[0.2em] text-black/40 sm:block">
              {admin.name}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-[11px] font-medium text-white">
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <div className="h-5 w-px bg-black/10" />
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-black/12 px-3 py-2 font-jet text-[10px] uppercase tracking-[0.15em] text-black/40 hover:border-black/25 hover:text-black transition">
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

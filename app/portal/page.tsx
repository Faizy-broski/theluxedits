"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, User, LogOut, ShoppingBag } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import { useAuth } from "@/lib/auth-context";

export default function PortalPage() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <main>
        <Header />
        <section className="flex min-h-[60vh] items-center justify-center bg-white pt-24">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />
        </section>
        <Footer />
      </main>
    );
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <main>
      <Header />
      <section className="bg-white pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="mx-auto max-w-4xl px-5 lg:px-0">
          <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">— My Account</p>
          <div className="flex items-end justify-between">
            <h1 className="font-fraunces text-4xl font-light leading-none tracking-[-0.045em] sm:text-5xl">
              Welcome, <em className="italic">{user.name.split(" ")[0]}.</em>
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 font-jet text-[10px] uppercase tracking-[0.2em] text-black/40 hover:text-black"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
              Sign Out
            </button>
          </div>

          <p className="mt-2 font-jet text-[10px] uppercase tracking-[0.15em] text-black/40">{user.email}</p>

          <div className="my-8 h-px bg-black/10" />

          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { href: "/portal/orders", icon: Package, label: "My Orders", desc: "Track & manage your orders" },
              { href: "/portal/profile", icon: User, label: "Edit Profile", desc: "Update your details & password" },
              { href: "/products", icon: ShoppingBag, label: "Shop Now", desc: "Browse the full collection" },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="group border border-black/10 p-6 transition-colors hover:border-black"
              >
                <Icon className="mb-4 h-6 w-6 text-black/30 transition-colors group-hover:text-black" strokeWidth={1.2} />
                <p className="font-fraunces text-lg font-light">{label}</p>
                <p className="mt-1 font-jet text-[9px] uppercase tracking-[0.15em] text-black/35">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

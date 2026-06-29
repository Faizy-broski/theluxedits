"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  User,
  ShoppingBag,
  X,
  LogOut,
  ArrowUpRight,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Shop Women", href: "/products" },
  { label: "Shop Men",   href: "/products" },
  { label: "Shop All",   href: "/products" },
];

const megaMenu = {
  categories: [
    { label: "Shoes",       href: "/products?category=Shoes" },
    { label: "Bags",        href: "/products?category=Bags" },
    { label: "Watches",     href: "/products?category=Accessories" },
    { label: "Perfumes",    href: "/products?category=Perfumes" },
    { label: "Electronics", href: "/products?category=Electronics" },
  ],
  brandColumns: [
    {
      heading: "Fashion Houses",
      brands: [
        { label: "Gucci",         href: "/products?brand=Gucci" },
        { label: "Louis Vuitton", href: "/products?brand=Louis+Vuitton" },
        { label: "Prada",         href: "/products?brand=Prada" },
        { label: "Hermès",        href: "/products?brand=Hermes" },
        { label: "Chanel",        href: "/products?brand=Chanel" },
        { label: "Fendi",         href: "/products?brand=Fendi" },
        { label: "Burberry",      href: "/products?brand=Burberry" },
        { label: "Celine",        href: "/products?brand=Celine" },
      ],
    },
    {
      heading: "Watches",
      brands: [
        { label: "Rolex",           href: "/products?brand=Rolex" },
        { label: "Omega",           href: "/products?brand=Omega" },
        { label: "Cartier",         href: "/products?brand=Cartier" },
        { label: "Tag Heuer",       href: "/products?brand=Tag+Heuer" },
        { label: "IWC",             href: "/products?brand=IWC" },
        { label: "Hublot",          href: "/products?brand=Hublot" },
        { label: "Patek Philippe",  href: "/products?brand=Patek+Philippe" },
        { label: "Audemars Piguet", href: "/products?brand=Audemars+Piguet" },
      ],
    },
    {
      heading: "Footwear & Style",
      brands: [
        { label: "Nike",        href: "/products?brand=Nike" },
        { label: "Adidas",      href: "/products?brand=Adidas" },
        { label: "Balenciaga",  href: "/products?brand=Balenciaga" },
        { label: "Off-White",   href: "/products?brand=Off-White" },
        { label: "Jordan",      href: "/products?brand=Jordan" },
        { label: "New Balance", href: "/products?brand=New+Balance" },
        { label: "Versace",     href: "/products?brand=Versace" },
        { label: "Givenchy",    href: "/products?brand=Givenchy" },
      ],
    },
    {
      heading: "Fragrance & Tech",
      brands: [
        { label: "Creed",          href: "/products?brand=Creed" },
        { label: "YSL",            href: "/products?brand=YSL" },
        { label: "Dior",           href: "/products?brand=Dior" },
        { label: "Giorgio Armani", href: "/products?brand=Giorgio+Armani" },
        { label: "Bvlgari",        href: "/products?brand=Bvlgari" },
        { label: "Apple",          href: "/products?brand=Apple" },
        { label: "Bang & Olufsen", href: "/products?brand=Bang+%26+Olufsen" },
        { label: "Bose",           href: "/products?brand=Bose" },
      ],
    },
  ],
};

const searchCategories = [
  { label: "Shoes",       href: "/products?category=Shoes" },
  { label: "Bags",        href: "/products?category=Bags" },
  { label: "Watches",     href: "/products?category=Accessories" },
  { label: "Perfumes",    href: "/products?category=Perfumes" },
  { label: "Electronics", href: "/products?category=Electronics" },
];

const announcements = [
  "Free shipping on orders over $200",
  "Easy 30-day returns on all items",
  "100% authentic, expert-verified products",
];

export default function Header() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [scrolled,       setScrolled]       = useState(false);
  const [megaOpen,       setMegaOpen]       = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openBrand,      setOpenBrand]      = useState<string | null>(null);
  const [searchQuery,    setSearchQuery]    = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const megaTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { cartCount } = useCart();
  const { user, logout } = useAuth();

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when overlays open
  useEffect(() => {
    const locked = searchOpen || mobileMenuOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen, mobileMenuOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
    else setSearchQuery("");
  }, [searchOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  function openMega() {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current);
    setMegaOpen(true);
  }
  function closeMega() {
    megaTimerRef.current = setTimeout(() => setMegaOpen(false), 150);
  }
  function closeMegaNow() {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current);
    setMegaOpen(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  }

  const iconColor = isHome ? "text-white" : "text-black";

  return (
    <>
      {/* ── Fixed wrapper: header + mega dropdown ── */}
      <div className="fixed left-0 right-0 top-0 z-50" onMouseLeave={closeMega}>

        {/* Header bar */}
        <header
          className={cn(
            "transition-all duration-300",
            isHome
              ? scrolled
                ? "bg-black/80 text-white backdrop-blur-md"
                : "bg-transparent text-white"
              : cn("bg-white text-black border-b border-black/10", scrolled && "shadow-sm")
          )}
        >
          {/* Announcement bar */}
          <div
            className={cn(
              "overflow-hidden border-b bg-white transition-all duration-300",
              scrolled
                ? "max-h-0 border-transparent opacity-0"
                : "max-h-12 border-neutral-200 opacity-100"
            )}
          >
            <div className="hidden items-center justify-center gap-6 py-2 md:flex">
              {announcements.map((msg, i) => (
                <span key={msg} className="flex items-center gap-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-black/55">{msg}</span>
                  {i < announcements.length - 1 && <span className="text-black/20">·</span>}
                </span>
              ))}
            </div>
            <p className="py-2 text-center font-mono text-[9px] uppercase tracking-[0.22em] text-black/45 md:hidden">
              {announcements[0]}
            </p>
          </div>

          {/* Main nav row */}
          <div className="flex h-14 items-center justify-between px-5 md:h-20 md:px-10">

            {/* Left side */}
            <div className="flex items-center gap-4 md:gap-7">

              {/* Mobile hamburger — only on small screens */}
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMobileMenuOpen(true)}
                className="flex flex-col items-center justify-center gap-[5px] w-5 h-5 flex-shrink-0 md:hidden"
              >
                <span className={cn("block h-px w-full", isHome ? "bg-white" : "bg-black")} />
                <span className={cn("block h-px w-full", isHome ? "bg-white" : "bg-black")} />
                <span className={cn("block h-px w-full", isHome ? "bg-white" : "bg-black")} />
              </button>

              {/* Desktop hamburger — mega menu trigger */}
              <button
                type="button"
                aria-label="Browse all categories and brands"
                onMouseEnter={openMega}
                onClick={() => megaOpen ? closeMegaNow() : openMega()}
                className="hidden md:flex flex-col items-center justify-center gap-[5px] w-5 h-5 flex-shrink-0 transition-opacity hover:opacity-100 opacity-60"
              >
                <span className={cn("block h-px w-full transition-all duration-200", isHome ? "bg-white" : "bg-black", megaOpen && "translate-y-[7px] rotate-45")} />
                <span className={cn("block h-px w-full transition-all duration-200", isHome ? "bg-white" : "bg-black", megaOpen && "opacity-0")} />
                <span className={cn("block h-px w-full transition-all duration-200", isHome ? "bg-white" : "bg-black", megaOpen && "-translate-y-[7px] -rotate-45")} />
              </button>

              {/* Desktop nav links */}
              <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={closeMegaNow}
                    className={cn(
                      "group relative text-[11px] font-medium uppercase tracking-[0.3em] transition-colors",
                      isHome ? "text-white/75 hover:text-white" : "text-black/55 hover:text-black"
                    )}
                  >
                    {link.label}
                    <span className={cn("absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full", isHome ? "bg-white/60" : "bg-black/60")} />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center: logo */}
            <Link
              href="/"
              aria-label="TheLuxEdits — home"
              className="absolute left-1/2 -translate-x-1/2 transition-opacity hover:opacity-70"
              onClick={closeMegaNow}
            >
              <Image
                src="/logo/TheLuxEdits.png"
                alt="TheLuxEdits"
                width={160}
                height={40}
                className={cn("h-6 w-auto object-contain md:h-8", !isHome && "brightness-0")}
                priority
              />
            </Link>

            {/* Right: icons */}
            <div className="flex items-center gap-3 md:gap-5">
              <button
                type="button"
                aria-label="Search"
                onClick={() => { closeMegaNow(); setSearchOpen(true); }}
                className={cn("transition-opacity hover:opacity-60", iconColor)}
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.4} />
              </button>

              {user ? (
                <>
                  <Link href="/portal" aria-label="My Portal" className={cn("transition-opacity hover:opacity-60", iconColor)}>
                    <User className="h-[18px] w-[18px]" strokeWidth={1.4} />
                  </Link>
                  <button type="button" aria-label="Sign Out" onClick={() => logout()}
                    className={cn("hidden transition-opacity hover:opacity-60 md:block", iconColor)}>
                    <LogOut className="h-[18px] w-[18px]" strokeWidth={1.4} />
                  </button>
                </>
              ) : (
                <Link href="/auth/login" aria-label="Sign In" className={cn("transition-opacity hover:opacity-60", iconColor)}>
                  <User className="h-[18px] w-[18px]" strokeWidth={1.4} />
                </Link>
              )}

              <Link href="/cart" aria-label={`Shopping bag — ${cartCount} items`}
                className={cn("relative transition-opacity hover:opacity-60", iconColor)}>
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.4} />
                {cartCount > 0 && (
                  <span className={cn(
                    "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-medium",
                    isHome ? "bg-white text-black" : "bg-black text-white"
                  )}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              <Link
                href="/products"
                onClick={closeMegaNow}
                className="hidden items-center gap-2 border border-white bg-white px-4 py-2 font-mono text-[9px] uppercase tracking-[0.28em] text-black transition-all hover:bg-transparent hover:text-white md:flex"
              >
                Shop The Edit
                <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </header>

        {/* ── Desktop Mega menu dropdown ── */}
        <div
          className={cn(
            "hidden md:block overflow-hidden bg-white text-black transition-all duration-300 ease-in-out border-b border-black/10",
            megaOpen ? "max-h-[480px] opacity-100 shadow-2xl" : "max-h-0 opacity-0"
          )}
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
        >
          <div className="mx-auto max-w-7xl px-10 py-10">
            <div className="grid grid-cols-[200px_1fr] gap-12">

              {/* Categories */}
              <div>
                <p className="mb-5 font-mono text-[9px] uppercase tracking-[0.35em] text-black/30">Categories</p>
                <div className="space-y-0.5">
                  {megaMenu.categories.map((cat) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      onClick={closeMegaNow}
                      className="group flex items-center justify-between py-1.5 font-fraunces text-[22px] font-light leading-none tracking-[-0.02em] text-black/65 transition-colors hover:text-black"
                    >
                      {cat.label}
                      <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-60" strokeWidth={1.3} />
                    </Link>
                  ))}
                </div>
                <div className="mt-5 border-t border-black/10 pt-4">
                  <Link
                    href="/products"
                    onClick={closeMegaNow}
                    className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-black/40 transition-colors hover:text-black"
                  >
                    View All
                    <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>

              {/* Brands — 4 columns */}
              <div>
                <p className="mb-5 font-mono text-[9px] uppercase tracking-[0.35em] text-black/30">Shop by Brand</p>
                <div className="grid grid-cols-4 gap-8">
                  {megaMenu.brandColumns.map((col) => (
                    <div key={col.heading}>
                      <p className="mb-3 font-mono text-[8px] uppercase tracking-[0.3em] text-black/25">{col.heading}</p>
                      <div className="space-y-2">
                        {col.brands.map((brand) => (
                          <Link
                            key={brand.label}
                            href={brand.href}
                            onClick={closeMegaNow}
                            className="block text-[13px] text-black/55 transition-colors hover:text-black"
                          >
                            {brand.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Desktop mega backdrop */}
      {megaOpen && (
        <div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]" onClick={closeMegaNow} />
      )}

      {/* ══════════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════════ */}
      <div
        className={cn(
          "fixed inset-0 z-[70] md:hidden transition-all duration-300",
          mobileMenuOpen ? "visible" : "invisible"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-300",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-[85vw] max-w-[340px] bg-white flex flex-col transition-transform duration-300 ease-out shadow-2xl",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 flex-shrink-0">
            <Image
              src="/logo/TheLuxEdits.png"
              alt="TheLuxEdits"
              width={130}
              height={32}
              className="h-6 w-auto object-contain brightness-0"
            />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-8 w-8 items-center justify-center text-black/40 hover:text-black"
            >
              <X className="h-5 w-5" strokeWidth={1.4} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">

            {/* Shop quick links */}
            <div className="border-b border-black/8 px-5 py-5">
              <p className="mb-4 font-jet text-[9px] uppercase tracking-[0.35em] text-black/30">Shop</p>
              <div className="space-y-0.5">
                {megaMenu.categories.map((cat) => (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 font-fraunces text-[20px] font-light text-black/70 hover:text-black transition-colors"
                  >
                    {cat.label}
                    <ArrowRight className="h-4 w-4 text-black/25 flex-shrink-0" strokeWidth={1.3} />
                  </Link>
                ))}
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 inline-flex items-center gap-1.5 pt-1 font-jet text-[9px] uppercase tracking-[0.3em] text-black/35 hover:text-black transition-colors"
                >
                  View All Products
                  <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                </Link>
              </div>
            </div>

            {/* Brand accordion columns */}
            <div className="px-5 py-5">
              <p className="mb-4 font-jet text-[9px] uppercase tracking-[0.35em] text-black/30">Shop by Brand</p>
              <div className="space-y-1">
                {megaMenu.brandColumns.map((col) => (
                  <div key={col.heading} className="border-b border-black/6 last:border-0">
                    <button
                      type="button"
                      onClick={() => setOpenBrand(openBrand === col.heading ? null : col.heading)}
                      className="flex w-full items-center justify-between py-3"
                    >
                      <span className="font-jet text-[10px] uppercase tracking-[0.28em] text-black/50">
                        {col.heading}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-black/30 transition-transform duration-200",
                          openBrand === col.heading && "rotate-180"
                        )}
                        strokeWidth={1.5}
                      />
                    </button>

                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-200",
                        openBrand === col.heading ? "max-h-[400px] pb-3" : "max-h-0"
                      )}
                    >
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                        {col.brands.map((brand) => (
                          <Link
                            key={brand.label}
                            href={brand.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-[12px] text-black/55 hover:text-black transition-colors"
                          >
                            {brand.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer footer — account links */}
          <div className="border-t border-black/10 px-5 py-4 flex-shrink-0">
            {user ? (
              <div className="flex items-center gap-5">
                <Link
                  href="/portal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 font-jet text-[10px] uppercase tracking-[0.2em] text-black/55 hover:text-black transition-colors"
                >
                  <User className="h-4 w-4" strokeWidth={1.4} />
                  My Account
                </Link>
                <button
                  type="button"
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 font-jet text-[10px] uppercase tracking-[0.2em] text-black/35 hover:text-black transition-colors"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.4} />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 font-jet text-[10px] uppercase tracking-[0.2em] text-black/55 hover:text-black transition-colors"
              >
                <User className="h-4 w-4" strokeWidth={1.4} />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Search overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div className="bg-white px-5 pb-8 pt-6 md:px-16">
            <form onSubmit={handleSearch} className="flex items-center gap-4 border-b border-black/15 pb-4">
              <Search className="h-5 w-5 shrink-0 text-black/30" strokeWidth={1.4} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 bg-transparent font-sans text-base text-black placeholder-black/30 outline-none md:text-lg"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"
                className="shrink-0 text-black/40 transition-colors hover:text-black">
                <X className="h-5 w-5" strokeWidth={1.4} />
              </button>
            </form>
            <div className="mt-5">
              <p className="mb-3 font-jet text-[9px] uppercase tracking-[0.3em] text-black/35">Browse by category</p>
              <div className="flex flex-wrap gap-2">
                {searchCategories.map((cat) => (
                  <Link key={cat.label} href={cat.href} onClick={() => setSearchOpen(false)}
                    className="border border-black/15 px-4 py-1.5 font-jet text-[10px] uppercase tracking-[0.2em] text-black/60 transition-colors hover:border-black hover:text-black">
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

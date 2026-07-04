import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "Shoes",        href: "/products?category=Shoes" },
    { label: "Bags",         href: "/products?category=Bags" },
    { label: "Watches",      href: "/products?category=Accessories" },
    { label: "Perfumes",     href: "/products?category=Perfumes" },
    { label: "Electronics",  href: "/products?category=Electronics" },
  ],
  Houses: [
    { label: "Gucci",         href: "/products?brand=Gucci" },
    { label: "Prada",         href: "/products?brand=Prada" },
    { label: "Louis Vuitton", href: "/products?brand=Louis+Vuitton" },
    { label: "Nike Lab",      href: "/products?brand=Nike" },
    { label: "Chanel",        href: "/products?brand=Chanel" },
    { label: "All Maisons",   href: "/products" },
  ],
  Support: [
    { label: "Contact Us",  href: "/contact" },
    { label: "My Account",  href: "/portal" },
    { label: "My Orders",   href: "/portal/orders" },
    { label: "Cart",        href: "/cart" },
  ],
  Company: [
    { label: "About",          href: "/about" },
    { label: "Categories",     href: "/categories" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

const socials = [
  { label: "IG", href: "#" },
  { label: "TT", href: "#" },
  { label: "PT", href: "#" },
  { label: "YT", href: "#" },
  { label: "X",  href: "#" },
];

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden text-white"
      style={{
        backgroundImage: "url('/footer/Footer.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Subtle overlay just to boost text readability */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-8 py-14 md:py-16 lg:py-20 lg:px-16">
        {/* Main grid — brand col + 4 link cols */}
        <div className="mb-5 grid gap-x-10 gap-y-12 grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
          {/* Brand section */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-block hover:opacity-70 transition-opacity">
              <Image
                src="/logo/TheLuxEdits.png"
                alt="TheLuxEdits"
                width={180}
                height={45}
                className="h-9 w-auto object-contain brightness-0 invert"
              />
            </Link>

            <p className="mt-6 max-w-[240px] text-[11px] leading-relaxed text-white/50">
              An ultra-modern luxury fashion universe combining maison elegance,
              futuristic editorial design and premium marketplace scale.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {socials.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[10px] tracking-wider text-white/70 transition hover:border-white hover:bg-white hover:text-black"
                >
                  {social.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-5 font-jet text-[9px] uppercase tracking-[0.25em] text-white/40">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Large watermark wordmark */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none overflow-hidden text-center font-fraunces font-light leading-none tracking-[-0.03em] text-white/[0.06] text-[clamp(60px,13vw,280px)]"
        >
          TheLuxEdits
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-8 text-[10px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 TheLuxEdits. All maisons, all rights reserved.</p>
          <p className="font-jet uppercase tracking-[0.2em]">Crafted in Paris · Shipped Globally</p>
        </div>
      </div>
    </footer>
  );
}

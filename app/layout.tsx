import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";

// export const fraunces = Fraunces({
//   subsets: ["latin"],
//   variable: "--font-fraunces",
//   weight: ["300", "300"],
//   style: ["normal", "italic"],
// });

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "TheLuxEdits — Luxury Fashion & Accessories",
    template: "%s | TheLuxEdits",
  },
  description:
    "Shop 100% authentic luxury shoes, bags, watches, perfumes and electronics. Expert-verified products with free shipping on orders over $200.",
  icons: {
    icon: "/logo/Fav%20Icon.png",
    shortcut: "/logo/Fav%20Icon.png",
    apple: "/logo/Fav%20Icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} 
       h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider><AuthProvider>{children}</AuthProvider></CartProvider>
      </body>
    </html>
  );
}
      // ${fraunces.variable}


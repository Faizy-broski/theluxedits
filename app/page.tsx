import Header from "@/components/shared/Header";
import LuxuryHero from "@/components/homePage/Hero";
import BrandTicker from "@/components/homePage/BrandTicker";
import Houses from "@/components/homePage/Houses";
import ProductSection from "@/components/homePage/ProductSection";
import ShopByBrand from "@/components/homePage/ShopByBrand";
import WearCollections from "@/components/homePage/WearCollection";
import Membership from "@/components/homePage/Membership";
import Footer from "@/components/homePage/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <LuxuryHero />
      <BrandTicker />
      <Houses />

      {/* 1 — Shoes */}
      <ProductSection
        sectionLabel="Footwear"
        heading="Shop"
        headingItalic="Shoes."
        badge="Shoes"
        filters={[
          { label: "All Shoes", category: "Shoes" },
          { label: "Sneakers",  category: "Shoes" },
          { label: "Formal",    category: "Shoes" },
          { label: "Boots",     category: "Shoes" },
        ]}
      />

      <div className="border-t border-black/8" />

      {/* 2 — Bags */}
      <ProductSection
        sectionLabel="Handbags & Accessories"
        heading="Shop"
        headingItalic="Bags."
        badge="Bags"
        filters={[
          { label: "All Bags",  category: "Bags" },
          { label: "Totes",     category: "Bags" },
          { label: "Clutches",  category: "Bags" },
          { label: "Crossbody", category: "Bags" },
        ]}
      />

      <div className="border-t border-black/8" />

      {/* 3 — Watches */}
      <ProductSection
        sectionLabel="Fine Timepieces"
        heading="Shop"
        headingItalic="Watches."
        badge="Watches"
        filters={[
          { label: "All Watches", category: "Accessories" },
          { label: "Luxury",      category: "Accessories" },
          { label: "Sport",       category: "Accessories" },
          { label: "Classic",     category: "Accessories" },
        ]}
      />

      <div className="border-t border-black/8" />

      {/* 4 — Perfumes */}
      <ProductSection
        sectionLabel="Fine Fragrances"
        heading="Shop"
        headingItalic="Perfumes."
        badge="Perfumes"
        filters={[
          { label: "All Perfumes", category: "Perfumes" },
          { label: "Floral",       category: "Perfumes" },
          { label: "Woody",        category: "Perfumes" },
          { label: "Oriental",     category: "Perfumes" },
        ]}
      />

      <div className="border-t border-black/8" />

      {/* 5 — Electronics */}
      <ProductSection
        sectionLabel="Tech & Gadgets"
        heading="Shop"
        headingItalic="Electronics."
        badge="Tech"
        filters={[
          { label: "All Electronics", category: "Electronics" },
          { label: "Audio",           category: "Electronics" },
          { label: "Wearables",       category: "Electronics" },
          { label: "Accessories",     category: "Electronics" },
        ]}
      />

      <ShopByBrand />
      <WearCollections />
      <Membership />
      <Footer />
    </main>
  );
}

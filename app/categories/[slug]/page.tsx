"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import CategoryClient from "./CategoryClient";

const SLUG_MAP: Record<string, { category: string; label: string }> = {
  shoes:       { category: "Shoes",       label: "Shoes" },
  footwear:    { category: "Shoes",       label: "Footwear" },
  sneakers:    { category: "Shoes",       label: "Sneakers" },
  bags:        { category: "Bags",        label: "Bags" },
  handbags:    { category: "Bags",        label: "Handbags" },
  watches:     { category: "Accessories", label: "Watches" },
  accessories: { category: "Accessories", label: "Accessories" },
  timepieces:  { category: "Accessories", label: "Timepieces" },
  perfumes:    { category: "Perfumes",    label: "Perfumes" },
  fragrance:   { category: "Perfumes",    label: "Fragrance" },
  electronics: { category: "Electronics", label: "Electronics" },
  tech:        { category: "Electronics", label: "Tech" },
};

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const mapping = SLUG_MAP[slug.toLowerCase()];

  if (!mapping) notFound();

  return <CategoryClient slug={slug} label={mapping.label} category={mapping.category} />;
}

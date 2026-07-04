export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  image: string;
  description: string;
  shortDescription: string;
  stock: number;
  sizes?: string[];
  badge?: string;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Atelier Moto Jacket",
    slug: "atelier-moto-jacket",
    category: "Women",
    brand: "Maison Lyon",
    price: 3420,
    image: "/jacket.svg",
    shortDescription: "Hand-stitched lambskin with aged brass hardware.",
    description:
      "A meticulously crafted lambskin jacket from the Maison Lyon atelier. Each piece is individually hand-stitched by master craftspeople in Lyon, featuring aged brass hardware and a silk-lined interior. The silhouette balances structured shoulders with a relaxed body, making it equally at home on a motorcycle or at a gallery opening.",
    stock: 4,
    sizes: ["XS", "S", "M", "L", "XL"],
    badge: "New",
  },
  {
    id: "2",
    name: "Court Low — Pure",
    slug: "court-low-pure",
    category: "Men",
    brand: "Nike Lab",
    price: 640,
    image: "/pure.svg",
    shortDescription: "Archive-inspired court sneaker in premium leather.",
    description:
      "Revisiting archival tennis court silhouettes with modern construction, the Court Low Pure features a full-grain vegetable-tanned leather upper and a hand-finished edge. Developed in collaboration with Nike's advanced materials lab and crafted in limited quantities.",
    stock: 12,
    sizes: ["40", "41", "42", "43", "44", "45"],
    badge: "Restock",
  },
  {
    id: "3",
    name: "Ribbed Cashmere Rollneck",
    slug: "ribbed-cashmere-rollneck",
    category: "Men",
    brand: "Brunello",
    price: 1180,
    image: "/cashmere.svg",
    shortDescription: "12-gauge Mongolian cashmere in midnight blue.",
    description:
      "Woven from the finest 12-gauge Mongolian cashmere, this rollneck exemplifies quiet luxury. The ribbed construction provides natural stretch and body-conforming warmth, while the refined collar folds into a precise double layer. Available in an edited palette of seasonless tones.",
    stock: 7,
    sizes: ["S", "M", "L", "XL"],
    badge: "Member",
  },
  {
    id: "4",
    name: "Silk Wrap Dress",
    slug: "silk-wrap-dress",
    category: "Women",
    brand: "Hôtel Riviera",
    price: 2260,
    image: "/dress.svg",
    shortDescription: "Bias-cut silk habotai with hand-rolled hem.",
    description:
      "Cut on the bias from weightless silk habotai, this wrap dress moves with effortless fluidity. The hand-rolled hem and self-tie waist are finishing details that elevate the piece beyond seasonal trend. Designed to be worn from aperitivo to après.",
    stock: 3,
    sizes: ["XS", "S", "M", "L"],
    badge: "Exclusive",
  },
  {
    id: "5",
    name: "Tailored Wool Overcoat",
    slug: "tailored-wool-overcoat",
    category: "Women",
    brand: "Maison Lyon",
    price: 4850,
    image: "/jacket.svg",
    shortDescription: "Camel wool with full canvas interlining.",
    description:
      "A statement overcoat that wears with the weight of a bespoke commission. The double-faced camel wool is sourced from a family-run mill in the English countryside, and the full canvas interlining ensures the coat drapes and improves with every wear. Finished with hand-stitched lapels and mother-of-pearl buttons.",
    stock: 5,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "6",
    name: "Suede Chelsea Boot",
    slug: "suede-chelsea-boot",
    category: "Men",
    brand: "Brunello",
    price: 1640,
    image: "/pure.svg",
    shortDescription: "Reverse suede with leather-covered elastic gusset.",
    description:
      "The definitive Chelsea boot, revisited for the modern wardrobe. Crafted in Italy from reverse suede with a leather-covered elastic gusset and a Blake-stitched leather sole. The elongated toe and stacked heel give this classic form a contemporary edge.",
    stock: 9,
    sizes: ["40", "41", "42", "43", "44", "45"],
  },
  {
    id: "7",
    name: "Structured Leather Tote",
    slug: "structured-leather-tote",
    category: "Accessories",
    brand: "Hôtel Riviera",
    price: 3100,
    image: "/dress.svg",
    shortDescription: "Vegetable-tanned calfskin with brass-ring hardware.",
    description:
      "A tote that functions with the efficiency of a briefcase and the elegance of a handbag. The rigid base structure in vegetable-tanned calfskin holds its shape through daily use, while the open top and internal suede-lined pockets offer intuitive organization. The brass-ring hardware ages to a rich patina.",
    stock: 6,
    badge: "New",
  },
  {
    id: "8",
    name: "Merino Knit Trousers",
    slug: "merino-knit-trousers",
    category: "Women",
    brand: "Maison Lyon",
    price: 890,
    image: "/cashmere.svg",
    shortDescription: "Fine-gauge merino in a tailored straight leg.",
    description:
      "Where knitwear meets tailoring — these merino trousers are knitted in a single piece on fine-gauge machines, resulting in a seamless drape that moves like a woven. The tailored waistband and straight leg are finished with a pressed crease, making them appropriate from boardroom to weekend.",
    stock: 11,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "9",
    name: "Ceramic Espresso Set",
    slug: "ceramic-espresso-set",
    category: "Objects",
    brand: "Hôtel Riviera",
    price: 420,
    image: "/dress.svg",
    shortDescription: "Hand-thrown stoneware, service for two.",
    description:
      "A set of two espresso cups and saucers, hand-thrown by ceramicist Léa Moreau in her Paris studio. Each piece bears the subtle marks of the hand and the kiln — intentional variations in the matte glaze that make each set entirely unique. Dishwasher safe, but too beautiful to hide away.",
    stock: 8,
    badge: "New",
  },
  {
    id: "10",
    name: "Linen Suit — Ivory",
    slug: "linen-suit-ivory",
    category: "Men",
    brand: "Maison Lyon",
    price: 2980,
    image: "/jacket.svg",
    shortDescription: "Unlined Irish linen in a relaxed two-button cut.",
    description:
      "Cut from unlined Irish linen in a relaxed two-button silhouette, this suit embodies effortless elegance that can only be achieved through quality material. The natural crease that linen develops through wear is part of the intention — this is a suit that gets better with every outing.",
    stock: 4,
    sizes: ["46", "48", "50", "52", "54"],
    badge: "Exclusive",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

export function formatPrice(price: number): string {
  return `€${price.toLocaleString("en-US")}`;
}

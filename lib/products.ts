import catalog from "../data/products.json";

export type ProductSize = {
  size: string;
  usd: number;
  gbp: number;
};

export type Product = {
  name: string;
  slug: string;
  gender: "womens" | "unisex";
  sizes: ProductSize[];
};

function toProduct(raw: (typeof catalog.products)[number]): Product {
  if (raw.gender !== "womens" && raw.gender !== "unisex") {
    throw new Error(`Unknown gender for ${raw.slug}`);
  }

  return {
    name: raw.name,
    slug: raw.slug,
    gender: raw.gender,
    sizes: [...raw.sizes].sort((a, b) => parseFloat(a.size) - parseFloat(b.size)),
  };
}

const products: Product[] = catalog.products.map(toProduct);

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getLowestPrice(p: Product): number {
  return Math.min(...p.sizes.map((size) => size.gbp));
}

const gbpFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function formatGbp(n: number): string {
  return gbpFormat.format(Math.round(n));
}

export function getProductImage(slug: string): string {
  return `/products/${slug}.webp`;
}

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

export type BrandKey = "jordan" | "nike" | "adidas" | "asics" | "more";

export function getBrandKey(p: Product): BrandKey {
  const name = p.name.toLowerCase();
  if (name.startsWith("jordan")) return "jordan";
  if (name.startsWith("nike")) return "nike";
  if (name.startsWith("adidas")) return "adidas";
  if (name.startsWith("asics")) return "asics";
  return "more";
}

export const BRANDS: Array<{ key: BrandKey; label: string; heroSlug: string }> = [
  { key: "jordan", label: "Jordan", heroSlug: "jordan-4-retro-thunder-2023" },
  { key: "nike", label: "Nike", heroSlug: "nike-air-more-uptempo-96-black-white-2023-2026" },
  { key: "adidas", label: "adidas", heroSlug: "adidas-yeezy-boost-350-v2-mx-dark-salt" },
  { key: "asics", label: "ASICS", heroSlug: "asics-gel-kayano-14-cream-black-metallic-plum" },
  { key: "more", label: "More brands", heroSlug: "salomon-xt-6-vanilla-ice-black-silver-cloud" },
];

export function getProductsByBrand(key: BrandKey): Product[] {
  return products.filter((product) => getBrandKey(product) === key);
}

export function getBrandSummaries(): Array<{
  key: BrandKey;
  label: string;
  count: number;
  heroSlug: string;
  heroImage: string;
}> {
  return BRANDS.flatMap((brand) => {
    const count = getProductsByBrand(brand.key).length;
    if (count === 0) return [];
    return [
      {
        key: brand.key,
        label: brand.label,
        count,
        heroSlug: brand.heroSlug,
        heroImage: getProductImage(brand.heroSlug),
      },
    ];
  });
}

if (process.env.NODE_ENV !== "production") {
  for (const brand of BRANDS) {
    if (!getProductBySlug(brand.heroSlug)) {
      console.warn(`Missing hero product for brand "${brand.key}": ${brand.heroSlug}`);
    }
  }
}

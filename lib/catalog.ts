import apparelCatalog from "../data/stockx-catalog.json";
import lacesCatalog from "../data/laces-catalog.json";
import sizePrices from "../data/size-prices.json";
import productDetailsFile from "../data/product-details.json";
import sneakerDetailsFile from "../data/sneaker-details.json";
import { getAllProducts } from "./products";

export type CatalogCategory = "t-shirts" | "hoodies" | "pants" | "shoe-laces";

export type SizeLabel = "S" | "M" | "L" | "XL";

export const SIZE_LABELS: SizeLabel[] = ["S", "M", "L", "XL"];

export type CatalogItem = {
  id: string;
  category: CatalogCategory;
  rank: number;
  name: string;
  priceUsd: number;
  priceInclFeesUsd?: number;
  sold?: number;
  image: string;
  slug: string;
  colors?: string[];
  lengthsInches?: number[];
  sourceUrl?: string;
  sizePricesUsd?: Record<SizeLabel, number | null>;
  waistPricesUsd?: Record<string, number>;
};

export const CATEGORY_LABELS: Record<CatalogCategory, string> = {
  "t-shirts": "T-Shirts",
  hoodies: "Hoodies",
  pants: "Pants",
  "shoe-laces": "Shoe Laces",
};

const APPAREL_CATEGORIES = new Set<CatalogCategory>(["t-shirts", "hoodies", "pants"]);

const COMMON_FIELDS = ["id", "category", "rank", "name", "priceUsd", "image"] as const;

type RawCatalogItem = {
  id: string;
  category: string;
  rank: number;
  name: string;
  priceUsd: number;
  priceInclFeesUsd?: number;
  sold?: number;
  image: string;
  colors?: string[];
  lengthsInches?: number[];
  sourceUrl?: string;
};

function isCatalogCategory(value: unknown): value is CatalogCategory {
  return typeof value === "string" && value in CATEGORY_LABELS;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateItems(items: unknown[]): void {
  const seen = new Set<string>();

  items.forEach((entry, index) => {
    if (entry === null || typeof entry !== "object") {
      throw new Error(`Catalog item at index ${index} is missing required fields`);
    }

    const item = entry as Record<string, unknown>;
    const id = typeof item.id === "string" && item.id ? item.id : `index ${index}`;

    for (const field of COMMON_FIELDS) {
      const value = item[field];
      if (value === undefined || value === null || value === "") {
        throw new Error(`Catalog item ${id} is missing ${field}`);
      }
    }

    if (!isCatalogCategory(item.category)) {
      throw new Error(`Catalog item ${id} has unknown category "${String(item.category)}"`);
    }

    if (item.category === "shoe-laces") {
      if (!Array.isArray(item.colors)) {
        throw new Error(`Catalog item ${id} is missing colors`);
      }
      if (!Array.isArray(item.lengthsInches)) {
        throw new Error(`Catalog item ${id} is missing lengthsInches`);
      }
    } else if (APPAREL_CATEGORIES.has(item.category)) {
      if (typeof item.sold !== "number") {
        throw new Error(`Catalog item ${id} is missing sold`);
      }
      if (typeof item.priceInclFeesUsd !== "number") {
        throw new Error(`Catalog item ${id} is missing priceInclFeesUsd`);
      }
    }

    if (seen.has(id)) {
      throw new Error(`Duplicate catalog id "${id}"`);
    }
    seen.add(id);
  });
}

const letterPrices = sizePrices.letter as Record<string, Array<number | null>>;
const waistPrices = sizePrices.waist as Record<string, Record<string, number>>;

const rawItems: RawCatalogItem[] = [
  ...(apparelCatalog.items as RawCatalogItem[]),
  ...(lacesCatalog.items as RawCatalogItem[]),
];

function letterSizePrices(values: Array<number | null>): Record<SizeLabel, number | null> {
  return {
    S: values[0] ?? null,
    M: values[1] ?? null,
    L: values[2] ?? null,
    XL: values[3] ?? null,
  };
}

function orderedWaistPrices(values: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(values).sort(([a], [b]) => Number(a) - Number(b)));
}

function validateSizePrices(built: CatalogItem[]): void {
  const catalogIds = new Set(built.map((item) => item.id));

  for (const id of [...Object.keys(letterPrices), ...Object.keys(waistPrices)]) {
    if (!catalogIds.has(id)) {
      throw new Error(`Size price id "${id}" does not exist in the catalog`);
    }
  }

  for (const item of built) {
    if (!APPAREL_CATEGORIES.has(item.category)) continue;
    const hasLetter = item.sizePricesUsd !== undefined;
    const hasWaist = item.waistPricesUsd !== undefined;
    if (hasLetter === hasWaist) {
      throw new Error(`Catalog item ${item.id} must have sizePricesUsd or waistPricesUsd, not both`);
    }
  }
}

if (process.env.NODE_ENV !== "production") {
  validateItems(rawItems);
}

function toItems(entries: RawCatalogItem[]): CatalogItem[] {
  const used = new Set<string>();

  return entries.map((raw) => {
    const base = slugify(raw.name) || raw.id;
    const slug = used.has(base) ? `${base}-${raw.id}` : base;
    used.add(slug);

    const letter = letterPrices[raw.id];
    const waist = waistPrices[raw.id];

    return {
      id: raw.id,
      category: raw.category as CatalogCategory,
      rank: raw.rank,
      name: raw.name,
      priceUsd: raw.priceUsd,
      priceInclFeesUsd: raw.priceInclFeesUsd,
      sold: raw.sold,
      image: raw.image,
      colors: raw.colors,
      lengthsInches: raw.lengthsInches,
      sourceUrl: raw.sourceUrl,
      slug,
      ...(letter ? { sizePricesUsd: letterSizePrices(letter) } : {}),
      ...(waist ? { waistPricesUsd: orderedWaistPrices(waist) } : {}),
    };
  });
}

const items: CatalogItem[] = toItems(rawItems);

export type ProductDetails = {
  description: string;
  season?: string;
  colour?: string;
  releaseDate?: string;
  styleCode?: string;
  retailPriceUsd?: number;
};

const productDetails = productDetailsFile.items as Record<string, ProductDetails>;

type SneakerDetail = {
  name: string;
  description: string;
  styleCode?: string;
  colour?: string;
  retailPriceUsd?: number;
  releaseDate?: string;
};

const sneakerDetails = sneakerDetailsFile.items as Record<string, SneakerDetail>;

function normaliseName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\bmen's\b/g, " ")
    .replace(/[^a-z0-9\s]+/g, "")
    .replace(/\bwomens\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toProductDetails(entry: SneakerDetail): ProductDetails {
  return {
    description: entry.description,
    colour: entry.colour,
    styleCode: entry.styleCode,
    releaseDate: entry.releaseDate,
    retailPriceUsd: entry.retailPriceUsd,
  };
}

function sneakerDetailsByName(name: string): { key: string; entry: SneakerDetail } | null {
  const target = normaliseName(name);
  const matches = Object.entries(sneakerDetails).filter(([, entry]) => normaliseName(entry.name) === target);
  if (matches.length !== 1) return null;
  const [key, entry] = matches[0];
  return { key, entry };
}

function matchedSneakerDetail(id: string, name?: string): { key: string; entry: SneakerDetail } | null {
  const bySlug = sneakerDetails[id];
  if (bySlug) return { key: id, entry: bySlug };
  if (!name) return null;
  const byName = sneakerDetailsByName(name);
  if (!byName) return null;
  const claimants = getAllProducts().filter(
    (product) => product.slug !== id && !sneakerDetails[product.slug] && normaliseName(product.name) === normaliseName(name),
  );
  if (claimants.length > 0) return null;
  return byName;
}

export function getProductDetails(id: string, name?: string): ProductDetails | null {
  const apparel = productDetails[id];
  if (apparel) return apparel;
  const sneaker = matchedSneakerDetail(id, name);
  return sneaker ? toProductDetails(sneaker.entry) : null;
}

if (process.env.NODE_ENV !== "production") {
  validateSizePrices(items);

  const catalogIds = new Set(items.map((item) => item.id));
  const missingDetails = items
    .filter((item) => APPAREL_CATEGORIES.has(item.category) && getProductDetails(item.id) === null)
    .map((item) => item.id);
  const unknownDetails = Object.keys(productDetails).filter((id) => !catalogIds.has(id));

  if (missingDetails.length > 0) {
    console.warn(`Apparel catalog ids with no product details: ${missingDetails.join(", ")}`);
  }
  if (unknownDetails.length > 0) {
    console.warn(`Product detail ids with no catalog item: ${unknownDetails.join(", ")}`);
  }

  const matchedSneakerKeys = new Set<string>();
  const sneakersWithoutDetails: string[] = [];
  for (const product of getAllProducts()) {
    const match = matchedSneakerDetail(product.slug, product.name);
    if (!match) {
      sneakersWithoutDetails.push(product.slug);
      continue;
    }
    matchedSneakerKeys.add(match.key);
  }
  const unmatchedSneakerKeys = Object.keys(sneakerDetails).filter((key) => !matchedSneakerKeys.has(key));
  if (unmatchedSneakerKeys.length > 0) {
    console.warn(`Sneaker detail keys with no catalog item: ${unmatchedSneakerKeys.join(", ")}`);
  }
  if (sneakersWithoutDetails.length > 0) {
    console.warn(`Sneaker catalog items with no details: ${sneakersWithoutDetails.join(", ")}`);
  }
}

export function getLowestSizePriceUsd(item: CatalogItem): number | null {
  if (item.sizePricesUsd) {
    const values = SIZE_LABELS.map((label) => item.sizePricesUsd?.[label]).filter(
      (value): value is number => typeof value === "number",
    );
    return values.length > 0 ? Math.min(...values) : null;
  }

  if (item.waistPricesUsd) {
    const values = Object.values(item.waistPricesUsd);
    return values.length > 0 ? Math.min(...values) : null;
  }

  return item.priceUsd;
}

export function getAllItems(): CatalogItem[] {
  return items;
}

export function getItemBySlug(slug: string): CatalogItem | undefined {
  return items.find((item) => item.slug === slug);
}

export function getItemsByCategory(category: CatalogCategory): CatalogItem[] {
  return items.filter((item) => item.category === category);
}

export function getTopSellers(limit: number): CatalogItem[] {
  return items
    .filter((item): item is CatalogItem & { sold: number } => typeof item.sold === "number")
    .sort((a, b) => b.sold - a.sold || a.rank - b.rank)
    .slice(0, limit);
}

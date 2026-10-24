import Link from "next/link";
import { ProductGrid } from "@/components/shop";
import {
  CATEGORY_LABELS,
  getAllItems,
  getItemsByCategory,
  getLowestSizePriceUsd,
  type CatalogItem,
} from "../../../lib/catalog";
import styles from "./page.module.css";

export const SHOP_CATEGORIES = ["all", "t-shirts", "hoodies", "pants", "shoe-laces"] as const;
export const SHOP_SORTS = ["popular", "price-asc", "price-desc"] as const;

export type ShopCategory = (typeof SHOP_CATEGORIES)[number];
export type ShopSort = (typeof SHOP_SORTS)[number];

const TABS: Array<{ key: ShopCategory; label: string }> = [
  { key: "all", label: "All" },
  { key: "t-shirts", label: CATEGORY_LABELS["t-shirts"] },
  { key: "hoodies", label: CATEGORY_LABELS.hoodies },
  { key: "pants", label: CATEGORY_LABELS.pants },
  { key: "shoe-laces", label: CATEGORY_LABELS["shoe-laces"] },
];

const SORTS: Array<{ value: ShopSort; label: string }> = [
  { value: "popular", label: "Popular" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function isShopCategory(value: string): value is ShopCategory {
  return (SHOP_CATEGORIES as readonly string[]).includes(value);
}

export function isShopSort(value: string): value is ShopSort {
  return (SHOP_SORTS as readonly string[]).includes(value);
}

export function shopFilterParams(): Array<{ category: ShopCategory; sort: ShopSort }> {
  return SHOP_CATEGORIES.flatMap((category) =>
    SHOP_SORTS.filter((sort) => !(category === "all" && sort === "popular")).map((sort) => ({
      category,
      sort,
    })),
  );
}

export function shopHref(category: ShopCategory, sort: ShopSort): string {
  const params = new URLSearchParams();
  if (category !== "all") params.set("category", category);
  if (sort !== "popular") params.set("sort", sort);
  const query = params.toString();
  return query ? `/shop/?${query}` : "/shop/";
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function readShopQuery(params?: {
  category?: string | string[];
  sort?: string | string[];
}): { category: ShopCategory; sort: ShopSort } {
  const categoryValue = firstParam(params?.category);
  const sortValue = firstParam(params?.sort);
  return {
    category: categoryValue && isShopCategory(categoryValue) ? categoryValue : "all",
    sort: sortValue && isShopSort(sortValue) ? sortValue : "popular",
  };
}

function compareByLowestPrice(a: CatalogItem, b: CatalogItem, direction: 1 | -1): number {
  const aPrice = getLowestSizePriceUsd(a);
  const bPrice = getLowestSizePriceUsd(b);
  if (aPrice === null && bPrice === null) return 0;
  if (aPrice === null) return 1;
  if (bPrice === null) return -1;
  return (aPrice - bPrice) * direction;
}

function sortItems(items: CatalogItem[], sort: ShopSort): CatalogItem[] {
  const next = [...items];
  if (sort === "price-asc") next.sort((a, b) => compareByLowestPrice(a, b, 1));
  else if (sort === "price-desc") next.sort((a, b) => compareByLowestPrice(a, b, -1));
  else {
    next.sort((a, b) => {
      if (typeof a.sold === "number" && typeof b.sold === "number") return b.sold - a.sold || a.rank - b.rank;
      if (typeof a.sold === "number") return -1;
      if (typeof b.sold === "number") return 1;
      return a.rank - b.rank;
    });
  }
  return next;
}

export function ShopListing({ category, sort }: { category: ShopCategory; sort: ShopSort }) {
  const source = category === "all" ? getAllItems() : getItemsByCategory(category);
  const items = sortItems(source, sort);
  const countLabel = items.length === 1 ? "1 item" : `${items.length} items`;

  return (
    <main className={styles.page}>
      <h1>Shop</h1>
      <p className={styles.count}>{countLabel}</p>
      <div className={styles.controls}>
        <nav className={styles.tabs} aria-label="Categories">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={shopHref(tab.key, sort)}
              className={styles.tab}
              aria-current={tab.key === category ? "page" : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <nav className={styles.sort} aria-label="Sort">
          {SORTS.map((option) => (
            <Link
              key={option.value}
              href={shopHref(category, option.value)}
              className={styles.sortLink}
              aria-current={option.value === sort ? "true" : undefined}
            >
              {option.label}
            </Link>
          ))}
        </nav>
      </div>
      <ProductGrid items={items} />
    </main>
  );
}

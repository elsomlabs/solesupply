"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import catalog from "@/components/catalog/Catalog.module.css";
import card from "@/components/product/product.module.css";
import styles from "./ShopBrowser.module.css";

export type ShopSize = {
  size: string;
  price: number;
  priceLabel: string;
};

export type ShopItem = {
  slug: string;
  name: string;
  price: number;
  priceLabel: string;
  sizeLabel: string;
  sizes: ShopSize[];
  image: string | null;
};

const SORTS = [
  { value: "name", label: "Name A–Z" },
  { value: "price-asc", label: "Price low→high" },
  { value: "price-desc", label: "Price high→low" },
] as const;

type Sort = (typeof SORTS)[number]["value"];

function ProductPhoto({ item, priority }: { item: ShopItem; priority: boolean }) {
  const [failed, setFailed] = useState(false);

  if (!item.image || failed) {
    return (
      <div className={styles.media}>
        <span className={styles.placeholder}>{item.name}</span>
      </div>
    );
  }

  return (
    <div className={styles.media}>
      <div className={styles.frame}>
        <Image
          src={item.image}
          alt={item.name}
          fill
          priority={priority}
          sizes="(max-width: 899px) 50vw, (max-width: 1100px) 33vw, 25vw"
          className={styles.photo}
          onError={() => setFailed(true)}
        />
      </div>
    </div>
  );
}

function priceFor(product: ShopItem, size: string) {
  if (!size) return product.price;
  return product.sizes.find((entry) => entry.size === size)?.price ?? product.price;
}

export function ShopBrowser({ products, title = "Shop" }: { products: ShopItem[]; title?: string }) {
  const [query, setQuery] = useState("");
  const [size, setSize] = useState("");
  const [sort, setSort] = useState<Sort>("name");

  const sizes = useMemo(() => {
    const seen = new Set<string>();
    for (const product of products) {
      for (const entry of product.sizes) seen.add(entry.size);
    }
    return Array.from(seen).sort((a, b) => parseFloat(a) - parseFloat(b) || a.localeCompare(b, "en"));
  }, [products]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = products.filter((product) => {
      if (needle && !product.name.toLowerCase().includes(needle)) return false;
      if (size && !product.sizes.some((entry) => entry.size === size)) return false;
      return true;
    });
    const sorted = matched.slice();
    if (sort === "price-asc") {
      sorted.sort((a, b) => priceFor(a, size) - priceFor(b, size) || a.name.localeCompare(b.name, "en"));
    } else if (sort === "price-desc") {
      sorted.sort((a, b) => priceFor(b, size) - priceFor(a, size) || a.name.localeCompare(b.name, "en"));
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name, "en"));
    }
    return sorted;
  }, [products, query, size, sort]);

  return (
    <main className={catalog.page}>
      <h1>{title}</h1>
      <div className={`${catalog.filters} ${styles.filters}`}>
        <label>
          Search
          <input
            type="search"
            value={query}
            placeholder="Search"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          Size
          <select value={size} onChange={(event) => setSize(event.target.value)}>
            <option value="">All sizes</option>
            {sizes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {visible.length === 0 ? (
        <p className={`${catalog.empty} ${styles.results}`}>No matches.</p>
      ) : (
        <div className={`${catalog.grid} ${styles.results}`}>
          {visible.map((product, index) => {
            const selected = size ? product.sizes.find((entry) => entry.size === size) : undefined;
            return (
              <Link key={product.slug} href={`/shop/${product.slug}/`} className={`${card.card} ${styles.card}`}>
                <ProductPhoto item={product} priority={index < 4} />
                <p className={card.cardName}>{product.name}</p>
                <div className={card.price}>
                  {selected ? null : <small>From</small>}
                  {selected ? selected.priceLabel : product.priceLabel}
                </div>
                <p className={`${card.price} ${styles.sizes}`}>{product.sizeLabel}</p>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

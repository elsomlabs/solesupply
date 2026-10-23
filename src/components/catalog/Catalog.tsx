"use client";

import { useMemo, useState } from "react";
import { PlainCard } from "@/components/product/PlainCard";
import { ProductCard } from "@/components/product/ProductCard";
import { productSizes, type Product } from "@/lib/products";
import styles from "./Catalog.module.css";

export type CatalogSection = {
  title: string;
  products: Product[];
  link?: "sneaker";
};

const SIZE_ORDER = [
  "7",
  "7.5",
  "8",
  "8.5",
  "9",
  "9.5",
  "10",
  "10.5",
  "11",
  "11.5",
  "12",
  "13",
  "14",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "110cm",
  "160cm",
];

function ordered(values: string[], rank: string[]) {
  return values.slice().sort((a, b) => {
    const ai = rank.indexOf(a);
    const bi = rank.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export function Catalog({ title, sections }: { title: string; sections: CatalogSection[] }) {
  const [size, setSize] = useState("All");
  const [color, setColor] = useState("All");
  const [brand, setBrand] = useState("All");
  const products = sections.flatMap((section) => section.products);

  const sizes = useMemo(
    () => ordered(Array.from(new Set(products.flatMap((product) => Array.from(productSizes(product))))), SIZE_ORDER),
    [products],
  );
  const colors = useMemo(
    () => Array.from(new Set(products.map((product) => product.color))).sort((a, b) => a.localeCompare(b)),
    [products],
  );
  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand))).sort((a, b) => a.localeCompare(b)),
    [products],
  );
  const filtering = size !== "All" || color !== "All" || brand !== "All";

  function matches(product: Product) {
    if (size !== "All" && !productSizes(product).includes(size)) return false;
    if (color !== "All" && product.color !== color) return false;
    if (brand !== "All" && product.brand !== brand) return false;
    return true;
  }

  return (
    <main className={styles.page}>
      <h1>{title}</h1>
      <div className={styles.filters}>
        <label>
          Size
          <select value={size} onChange={(event) => setSize(event.target.value)}>
            <option>All</option>
            {sizes.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Color
          <select value={color} onChange={(event) => setColor(event.target.value)}>
            <option>All</option>
            {colors.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Brand
          <select value={brand} onChange={(event) => setBrand(event.target.value)}>
            <option>All</option>
            {brands.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        {filtering ? (
          <button
            type="button"
            onClick={() => {
              setSize("All");
              setColor("All");
              setBrand("All");
            }}
          >
            Clear
          </button>
        ) : null}
      </div>
      {sections.map((section) => {
        const visible = section.products.filter(matches);
        return (
          <section
            key={section.title}
            aria-labelledby={sections.length > 1 ? `catalog-${section.title}` : undefined}
          >
            {sections.length > 1 ? <h2 id={`catalog-${section.title}`}>{section.title}</h2> : null}
            {visible.length === 0 ? (
              <p className={styles.empty}>No matches.</p>
            ) : (
              <div className={styles.grid}>
                {visible.map((product) =>
                  section.link === "sneaker" ? (
                    <ProductCard key={product.id} product={product} href={`/sneakers/${product.id}/`} />
                  ) : (
                    <PlainCard key={product.id} product={product} />
                  ),
                )}
              </div>
            )}
          </section>
        );
      })}
    </main>
  );
}

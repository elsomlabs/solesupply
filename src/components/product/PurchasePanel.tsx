"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice, SNEAKER_SIZES, type Sneaker, type SneakerSize } from "@/lib/products";
import styles from "./PurchasePanel.module.css";

const FOLDS = [
  {
    id: "details",
    title: "Product details",
    body: (product: Sneaker) =>
      `${product.name}. US men's sizing. Each pair is the size you select, checked before it ships.`,
  },
  {
    id: "authenticity",
    title: "Authenticity guaranteed",
    body: () => "Every pair is checked by hand. If it is not right, it does not ship.",
  },
  {
    id: "delivery",
    title: "Delivery & return information",
    body: () => "Ships within 48 hours. Unworn pairs can be returned within 14 days.",
  },
] as const;

export function PurchasePanel({ product }: { product: Sneaker }) {
  const available = product.stock.slice(0, 2);
  const inStock = new Set<SneakerSize>(available);
  const [size, setSize] = useState<SneakerSize>(available[0]);
  const { add, has } = useCart();
  const inBag = has(product.id, size);
  const canAdd = inStock.has(size) && !inBag;

  return (
    <div className={styles.buy}>
      <h1>{product.name}</h1>
      <p className={styles.price}>
        {product.was != null ? (
          <>
            <span className={styles.now}>{formatPrice(product.price)}</span>
            <span className={styles.sr}>Was </span>
            <s>{formatPrice(product.was)}</s>
          </>
        ) : (
          formatPrice(product.price)
        )}
      </p>

      <p className={styles.sizeLabel} id={`${product.id}-size`}>
        Size
      </p>
      <div className={styles.sizes} role="group" aria-labelledby={`${product.id}-size`}>
        {SNEAKER_SIZES.map((option) => {
          const stocked = inStock.has(option);
          const selected = option === size;
          return (
            <button
              key={option}
              type="button"
              className={stocked ? styles.size : `${styles.size} ${styles.out}`}
              aria-pressed={selected}
              disabled={!stocked}
              onClick={() => setSize(option)}
            >
              {option}
              {stocked ? null : <span className={styles.sr}> out of stock</span>}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.cart}
        disabled={!canAdd}
        onClick={() =>
          add({ id: product.id, name: product.name, size, price: product.price, image: product.image })
        }
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M5 8h14l-1 12H6L5 8z" />
          <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
        </svg>
        {inBag ? "Added to bag" : "Add to cart"}
      </button>

      <div className={styles.folds}>
        {FOLDS.map((fold) => (
          <details key={fold.id} className={styles.fold}>
            <summary>{fold.title}</summary>
            <p>{fold.body(product)}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

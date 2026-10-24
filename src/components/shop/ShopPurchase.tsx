"use client";

import { useState, type KeyboardEvent } from "react";
import { useCart } from "@/lib/cart";
import panel from "@/components/product/PurchasePanel.module.css";
import styles from "./ShopPurchase.module.css";

export type ShopSizeOption = {
  size: string;
  gbp: number;
  label: string;
};

export function ShopPurchase({
  slug,
  name,
  gender,
  image,
  fromLabel,
  sizes,
}: {
  slug: string;
  name: string;
  gender: "womens" | "unisex";
  image: string;
  fromLabel: string;
  sizes: ShopSizeOption[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const { add, has } = useCart();
  const current = sizes.find((option) => option.size === selected);
  const inBag = current ? has(slug, current.size) : false;

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const backward = event.key === "ArrowLeft" || event.key === "ArrowUp";
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    if (!backward && !forward) return;
    event.preventDefault();
    const index = sizes.findIndex((option) => option.size === selected);
    const next =
      index === -1
        ? backward
          ? sizes.length - 1
          : 0
        : (index + (backward ? -1 : 1) + sizes.length) % sizes.length;
    setSelected(sizes[next].size);
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  }

  return (
    <div className={panel.buy}>
      <h1>{name}</h1>
      <p className={styles.note}>{gender === "womens" ? "Women's sizing (US)" : "US sizing"}</p>
      <p className={panel.price} aria-live="polite">
        {current ? current.label : fromLabel}
      </p>
      <div
        className={`${panel.sizes} ${styles.picker}`}
        role="radiogroup"
        aria-label="Size"
        onKeyDown={move}
      >
        {sizes.map((option, index) => {
          const checked = option.size === selected;
          return (
            <button
              key={option.size}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked || (selected === null && index === 0) ? 0 : -1}
              className={`${panel.size} ${styles.option}`}
              onClick={() => setSelected(option.size)}
            >
              {option.size}
              <small>{option.label}</small>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className={panel.cart}
        disabled={!current || inBag}
        onClick={() => {
          if (!current) return;
          add({ id: slug, name, size: current.size, price: current.gbp, image });
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M5 8h14l-1 12H6L5 8z" />
          <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
        </svg>
        {inBag ? "Added to bag" : "Add to bag"}
      </button>
      <p className={styles.delivery}>UK delivery only</p>
    </div>
  );
}

"use client";

import { useCart } from "@/lib/cart";
import panel from "@/components/product/PurchasePanel.module.css";
import styles from "./ShopPurchase.module.css";

export function ApparelPurchase({
  slug,
  name,
  image,
  price,
  priceLabel,
}: {
  slug: string;
  name: string;
  image: string;
  price: number;
  priceLabel: string;
}) {
  const { add, has } = useCart();
  const inBag = has(slug, "One size");

  return (
    <div className={panel.buy}>
      <h1>{name}</h1>
      <p className={panel.price}>{priceLabel}</p>
      <button
        type="button"
        className={panel.cart}
        disabled={inBag}
        onClick={() => add({ id: slug, name, size: "One size", price, image })}
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

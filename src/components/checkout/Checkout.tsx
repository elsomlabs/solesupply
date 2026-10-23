"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UnionJack } from "@/components/UnionJack";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import styles from "./Checkout.module.css";

export function Checkout() {
  const { lines } = useCart();
  const total = lines.reduce((sum, line) => sum + line.price, 0);
  const [notice, setNotice] = useState(lines.length > 0);

  useEffect(() => {
    if (!notice) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotice(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [notice]);

  return (
    <main className={styles.page}>
      <h1>Checkout</h1>
      {notice ? (
        <div className={styles.notice} role="dialog" aria-modal="true" aria-labelledby="ship-notice">
          <button type="button" className={styles.scrim} aria-label="Close" onClick={() => setNotice(false)} />
          <div className={styles.noticeCard}>
            <UnionJack className={styles.noticeFlag} />
            <p id="ship-notice">
              We&apos;re sorry, we currently only ship within the United Kingdom, so we can&apos;t complete this
              order. We&apos;re working on expanding, and we&apos;d love to have you with us when we do.
            </p>
            <button type="button" onClick={() => setNotice(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
      {lines.length === 0 ? (
        <p className={styles.empty}>
          Your bag is empty. <Link href="/">Continue shopping</Link>
        </p>
      ) : (
        <>
          <ul className={styles.list}>
            {lines.map((line) => (
              <li key={`${line.id}-${line.size}`}>
                <img src={line.image} alt="" />
                <div>
                  <p className={styles.name}>{line.name}</p>
                  <p>Size {line.size}</p>
                </div>
                <p className={styles.price}>{formatPrice(line.price)}</p>
              </li>
            ))}
          </ul>
          <div className={styles.total}>
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </>
      )}
    </main>
  );
}

"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import styles from "./product.module.css";

export type RowVariant = "5" | "laces" | "4";

export type RowScroll = {
  atStart: boolean;
  atEnd: boolean;
  by: (direction: -1 | 1) => void;
};

const variantClass: Record<RowVariant, string> = {
  "5": styles.row5,
  laces: styles.rowLaces,
  "4": styles.row4,
};

export function ProductRow({
  variant,
  header,
  children,
}: {
  variant: RowVariant;
  header?: (scroll: RowScroll) => ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useLayoutEffect(() => {
    const row = ref.current;
    if (!row) return;

    const update = () => {
      setAtStart(row.scrollLeft < 4);
      setAtEnd(row.scrollLeft + row.clientWidth >= row.scrollWidth - 4);
    };

    update();
    row.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(row);
    return () => {
      row.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const scroll: RowScroll = {
    atStart,
    atEnd,
    by(direction) {
      const row = ref.current;
      if (!row) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      row.scrollBy({
        left: direction * row.clientWidth,
        behavior: reduce ? "auto" : "smooth",
      });
    },
  };

  return (
    <>
      {header?.(scroll)}
      <div ref={ref} className={`${styles.row} ${variantClass[variant]}`}>
        {children}
      </div>
    </>
  );
}

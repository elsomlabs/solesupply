"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type CartLine = {
  id: string;
  name: string;
  size: string;
  price: number;
  image: string;
};

type CartValue = {
  lines: CartLine[];
  count: number;
  reveal: number;
  has: (id: string, size: string) => boolean;
  add: (line: CartLine) => void;
  remove: (id: string, size: string) => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [reveal, setReveal] = useState(0);

  const value = useMemo<CartValue>(
    () => ({
      lines,
      count: lines.length,
      reveal,
      has: (id, size) => lines.some((line) => line.id === id && line.size === size),
      add: (line) => {
        setLines((current) => {
          if (current.some((item) => item.id === line.id && item.size === line.size)) return current;
          return [...current, line];
        });
        setReveal((current) => current + 1);
      },
      remove: (id, size) => {
        setLines((current) => current.filter((item) => item.id !== id || item.size !== size));
      },
    }),
    [lines, reveal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}

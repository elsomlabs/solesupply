import type { Metadata } from "next";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { getItemsByCategory } from "../../../lib/catalog";
import styles from "../shop/page.module.css";

export const metadata: Metadata = {
  title: "Apparel · SoleSupply",
  description: "T-shirts, hoodies and pants, priced in pounds.",
};

export default function ApparelPage() {
  const items = [
    ...getItemsByCategory("t-shirts"),
    ...getItemsByCategory("hoodies"),
    ...getItemsByCategory("pants"),
  ].sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, "en"));

  return (
    <main className={styles.page}>
      <h1>Apparel</h1>
      <p className={styles.count}>{items.length === 1 ? "1 item" : `${items.length} items`}</p>
      <ProductGrid items={items} />
    </main>
  );
}

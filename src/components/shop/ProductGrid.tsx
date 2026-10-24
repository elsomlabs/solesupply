import type { CatalogItem } from "../../../lib/catalog";
import { ProductCard } from "./ProductCard";
import styles from "./ProductGrid.module.css";

export function ProductGrid({ items }: { items: CatalogItem[] }) {
  if (items.length === 0) {
    return <p className={styles.empty}>Nothing here yet.</p>;
  }

  return (
    <div className={styles.grid}>
      {items.map((item, index) => (
        <ProductCard key={item.id} item={item} priority={index < 4} />
      ))}
    </div>
  );
}

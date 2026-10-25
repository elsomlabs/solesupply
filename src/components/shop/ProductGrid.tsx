import type { CatalogItem } from "../../../lib/catalog";
import { ProductCard } from "./ProductCard";
import { SneakerCard, type SneakerCardItem } from "./SneakerCard";
import styles from "./ProductGrid.module.css";

export type ShopGridEntry =
  | { kind: "catalog"; item: CatalogItem }
  | { kind: "sneaker"; item: SneakerCardItem };

export function ProductGrid({
  items,
  entries,
}: {
  items?: CatalogItem[];
  entries?: ShopGridEntry[];
}) {
  const list: ShopGridEntry[] =
    entries ??
    (items ?? []).map((item) => ({ kind: "catalog" as const, item }));

  if (list.length === 0) {
    return <p className={styles.empty}>Nothing here yet.</p>;
  }

  return (
    <div className={styles.grid}>
      {list.map((entry, index) =>
        entry.kind === "catalog" ? (
          <ProductCard key={entry.item.id} item={entry.item} priority={index < 4} />
        ) : (
          <SneakerCard key={entry.item.slug} item={entry.item} priority={index < 4} />
        ),
      )}
    </div>
  );
}

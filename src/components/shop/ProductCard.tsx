import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS, SIZE_LABELS, getLowestSizePriceUsd, type CatalogItem } from "../../../lib/catalog";
import { formatGbp } from "../../../lib/currency";
import styles from "./ProductCard.module.css";

const IMAGE_SIZES = "(max-width: 899px) 50vw, (max-width: 1100px) 33vw, 25vw";

type SizeCell = { key: string; label: string; usd: number | null };

function priceCells(item: CatalogItem): SizeCell[] | null {
  if (item.sizePricesUsd) {
    return SIZE_LABELS.map((label) => ({
      key: label,
      label,
      usd: item.sizePricesUsd?.[label] ?? null,
    }));
  }

  if (item.waistPricesUsd) {
    return Object.entries(item.waistPricesUsd)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([label, usd]) => ({ key: label, label, usd }));
  }

  return null;
}

export function ProductCard({
  item,
  priority = false,
}: {
  item: CatalogItem;
  priority?: boolean;
}) {
  const colorCount = item.colors?.length ?? 0;
  const cells = priceCells(item);
  const lowest = getLowestSizePriceUsd(item);

  return (
    <Link className={styles.card} href={`/shop/${item.slug}/`}>
      <div className={styles.media}>
        {priority ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes={IMAGE_SIZES}
            className={styles.image}
            priority
          />
        ) : (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes={IMAGE_SIZES}
            className={styles.image}
            loading="lazy"
          />
        )}
      </div>
      <div className={styles.body}>
        <p className={styles.category}>{CATEGORY_LABELS[item.category]}</p>
        <p className={styles.name}>{item.name}</p>
        <p className={styles.price}>
          {cells ? `From ${lowest === null ? "—" : formatGbp(lowest)}` : formatGbp(item.priceUsd)}
        </p>
        {cells ? (
          <div className={styles.sizes} role="group" aria-label="Prices by size">
            {cells.map((cell) => {
              const unavailable = cell.usd === null;
              const isLowest = cell.usd !== null && cell.usd === lowest;
              return (
                <span
                  key={cell.key}
                  className={`${styles.size}${unavailable ? ` ${styles.unavailable}` : ""}${isLowest ? ` ${styles.lowest}` : ""}`}
                  aria-label={unavailable ? `${cell.label}: no price available` : undefined}
                >
                  <span className={styles.sizeLabel}>{cell.label}</span>
                  <span className={styles.sizePrice}>{cell.usd === null ? "—" : formatGbp(cell.usd)}</span>
                </span>
              );
            })}
          </div>
        ) : null}
        {colorCount > 0 ? (
          <p className={styles.colors}>{colorCount === 1 ? "1 color" : `${colorCount} colors`}</p>
        ) : null}
        {typeof item.sold === "number" ? <p className={styles.sold}>{item.sold} sold</p> : null}
      </div>
    </Link>
  );
}

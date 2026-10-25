import Image from "next/image";
import Link from "next/link";
import styles from "./ProductCard.module.css";

const IMAGE_SIZES = "(max-width: 899px) 50vw, (max-width: 1100px) 33vw, 25vw";

export type SneakerCardItem = {
  slug: string;
  name: string;
  price: number;
  priceLabel: string;
  sizeLabel: string;
  image: string | null;
};

export function SneakerCard({
  item,
  priority = false,
}: {
  item: SneakerCardItem;
  priority?: boolean;
}) {
  return (
    <Link className={styles.card} href={`/shop/${item.slug}/`}>
      <div className={styles.media}>
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes={IMAGE_SIZES}
            className={styles.image}
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        ) : (
          <span className={styles.name}>{item.name}</span>
        )}
      </div>
      <div className={styles.body}>
        <p className={styles.category}>Sneakers</p>
        <p className={styles.name}>{item.name}</p>
        <p className={styles.price}>From {item.priceLabel}</p>
        <p className={styles.colors}>{item.sizeLabel}</p>
      </div>
    </Link>
  );
}

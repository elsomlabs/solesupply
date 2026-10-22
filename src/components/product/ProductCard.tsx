import Link from "next/link";
import { formatPrice, type Product } from "@/lib/products";
import styles from "./product.module.css";

function badgeClass(label: string) {
  if (label === "New arrival") return styles.bdgNew;
  if (label === "Sale") return styles.bdgSale;
  return styles.bdgStock;
}

function ProductPrice({ product }: { product: Product }) {
  if (product.was != null) {
    return (
      <div className={styles.price}>
        <span className={styles.now}>{formatPrice(product.price)}</span>
        <span className={styles.sr}>Was </span>
        <s>{formatPrice(product.was)}</s>
      </div>
    );
  }

  return (
    <div className={styles.price}>
      {product.from ? <small>From</small> : null}
      {formatPrice(product.price)}
    </div>
  );
}

export function ProductCard({ product, href = "#" }: { product: Product; href?: string }) {
  const badges = product.badges?.slice(0, 2) ?? [];

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.cardMedia}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {badges.length > 0 ? (
          <div className={styles.badges}>
            {badges.map((badge) => (
              <span key={badge} className={`${styles.bdg} ${badgeClass(badge)}`}>
                {badge}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <p className={styles.cardName}>{product.name}</p>
      <ProductPrice product={product} />
    </Link>
  );
}

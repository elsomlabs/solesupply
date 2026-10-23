import Link from "next/link";
import { formatPrice, type Product } from "@/lib/products";
import styles from "./product.module.css";

export function PlainCard({ product, href }: { product: Product; href?: string }) {
  const body = (
    <>
      <div className={styles.pcardMedia}>
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <p className={styles.pcardName}>{product.name}</p>
      <div className={styles.price}>
        {product.from ? <small>From</small> : null}
        {product.was != null ? (
          <>
            <span className={styles.now}>{formatPrice(product.price)}</span>
            <span className={styles.sr}>Was </span>
            <s>{formatPrice(product.was)}</s>
          </>
        ) : (
          formatPrice(product.price)
        )}
      </div>
    </>
  );

  if (!href) return <article className={styles.pcard}>{body}</article>;
  return (
    <Link href={href} className={styles.pcard}>
      {body}
    </Link>
  );
}

import Link from "next/link";
import { getTopSellers } from "../../../lib/catalog";
import { ProductGrid } from "./ProductGrid";
import styles from "./TopSellers.module.css";

export function TopSellers() {
  const items = getTopSellers(8);

  return (
    <section className={styles.section} aria-labelledby="top-sellers">
      <div className={styles.head}>
        <h2 id="top-sellers">Top Sellers</h2>
        <Link className={styles.shopAll} href="/shop/">
          Shop all
        </Link>
      </div>
      <ProductGrid items={items} />
    </section>
  );
}

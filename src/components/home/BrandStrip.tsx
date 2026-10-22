import styles from "./BrandStrip.module.css";

export type BrandStripProps = {
  brands: readonly string[];
};

export function BrandStrip({ brands }: BrandStripProps) {
  return (
    <section className={styles.brands} aria-label="Brands we stock">
      <ul className={styles.list}>
        {brands.map((brand) => (
          <li key={brand}>{brand}</li>
        ))}
      </ul>
    </section>
  );
}

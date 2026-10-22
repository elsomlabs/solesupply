import styles from "./BrandStrip.module.css";

export type BrandLogo = {
  name: string;
  src: string;
  height: number;
  color?: boolean;
};

export type BrandStripProps = {
  brands: readonly BrandLogo[];
};

export function BrandStrip({ brands }: BrandStripProps) {
  return (
    <section className={styles.brands} aria-label="Brands we stock">
      <ul className={styles.list}>
        {brands.map((brand) => (
          <li key={brand.name}>
            <img
              src={brand.src}
              alt={brand.name}
              className={brand.color ? styles.color : undefined}
              style={{ height: brand.height }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

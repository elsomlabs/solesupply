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

function Logo({ brand, labelled }: { brand: BrandLogo; labelled: boolean }) {
  return (
    <li aria-hidden={labelled ? undefined : true}>
      <img
        src={brand.src}
        alt={labelled ? brand.name : ""}
        className={brand.color ? styles.color : undefined}
        style={{ height: brand.height }}
      />
    </li>
  );
}

function Row({
  brands,
  labelled,
}: {
  brands: readonly BrandLogo[];
  labelled?: boolean;
}) {
  return (
    <ul className={styles.list} aria-hidden={labelled ? undefined : true}>
      {brands.map((brand) => (
        <Logo key={brand.name} brand={brand} labelled={Boolean(labelled)} />
      ))}
      {brands.map((brand) => (
        <Logo key={`${brand.name}-repeat`} brand={brand} labelled={false} />
      ))}
    </ul>
  );
}

export function BrandStrip({ brands }: BrandStripProps) {
  return (
    <section className={styles.brands} aria-label="Brands we stock">
      <div className={styles.track}>
        <Row brands={brands} labelled />
        <Row brands={brands} />
      </div>
    </section>
  );
}

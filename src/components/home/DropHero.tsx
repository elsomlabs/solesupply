import Link from "next/link";
import ShoeDitherVeil from "@/components/ShoeDitherVeil.jsx";
import styles from "./DropHero.module.css";

export type DropHeroProps = {
  href: string;
  ctaLabel: string;
};

export function DropHero({ href, ctaLabel }: DropHeroProps) {
  return (
    <Link href={href} className={styles.hero} aria-label="Shop the Friday drop">
      <div className={styles.veil} aria-hidden="true">
        <ShoeDitherVeil
          dotColor="#ffffff"
          ariaLabel="Rotating sneaker"
          pixelSize={2}
          pattern="noise"
          palette="duotone"
          levels={2}
        />
      </div>
      <span className={styles.logo}>
        Sole
        <br />
        Supply
      </span>
      <span className={styles.cta}>{ctaLabel}</span>
      <span className={styles.pay} aria-hidden="true">
        Pay in 4 · Afterpay
      </span>
    </Link>
  );
}

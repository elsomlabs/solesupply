import Image from "next/image";
import Link from "next/link";
import styles from "./DropHero.module.css";

const SHOE_DIMENSIONS = [
  { width: 700, height: 423 },
  { width: 700, height: 429 },
] as const;

export type DropHeroProps = {
  href: string;
  artSrc: string;
  shoes: readonly [string, string];
  ctaLabel: string;
};

export function DropHero({ href, artSrc, shoes, ctaLabel }: DropHeroProps) {
  return (
    <Link
      href={href}
      className={styles.hero}
      style={{ backgroundImage: `url("${artSrc}")` }}
      aria-label="Shop the Friday drop"
    >
      <div className={styles.shoes} aria-hidden="true">
        {shoes.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={SHOE_DIMENSIONS[index].width}
            height={SHOE_DIMENSIONS[index].height}
            priority
            sizes="(max-width: 899px) 52vw, 36vw"
            className={index === 0 ? styles.s1 : styles.s2}
          />
        ))}
      </div>
      <span className={styles.cta}>{ctaLabel}</span>
      <span className={styles.pay} aria-hidden="true">
        Pay in 4 · Afterpay
      </span>
    </Link>
  );
}

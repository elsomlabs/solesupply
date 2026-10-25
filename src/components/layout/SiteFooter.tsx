import Image from "next/image";
import Link from "next/link";
import { SoleMark } from "@/components/SoleMark";
import styles from "./SiteFooter.module.css";

const SHOP_LINKS = [
  { label: "Sneakers", href: "/sneakers/" },
  { label: "Apparel", href: "/apparel/" },
  { label: "Laces", href: "/shop/?category=shoe-laces" },
  { label: "Sell with us", href: "/contact/" },
] as const;

const HELP_LINKS = [
  { label: "Shipping", href: "/shipping/" },
  { label: "Returns", href: "/returns/" },
  { label: "Authenticity", href: "/authenticity/" },
  { label: "Contact", href: "/contact/" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.foot}>
      <div className={styles.footIn}>
        <div>
          <Link className={styles.mark} href="/">
            <SoleMark align="left" />
          </Link>
          <p>Streetwear and sneakers, checked by hand.</p>
          <p>
            12 Hulverston Cl
            <br />
            London SM2 6TY, UK
          </p>
          <p>Shipping only within the United Kingdom.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            {SHOP_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Help</h4>
          <ul>
            {HELP_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.aside}>
          <Image
            className={styles.storefront}
            src="/images/storefront.jpg"
            alt="Sole Supply storefront"
            width={541}
            height={320}
          />
        </div>
      </div>
      <div className={styles.note}>
        <p>
          © {year} Sole Supply. All rights reserved. Prices and availability may change without notice. Product images
          are for illustration; colour and detail may vary. Sole Supply is not affiliated with the brands shown unless
          stated.
        </p>
        <p className={styles.credit}>
          Created by{" "}
          <a href="https://elsomlabs.com" target="_blank" rel="noopener noreferrer">
            <span className={styles.creditBrand}>elsom</span>labs
          </a>
        </p>
      </div>
    </footer>
  );
}

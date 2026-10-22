import Link from "next/link";
import styles from "./SiteFooter.module.css";

const COLUMNS = [
  {
    title: "Shop",
    links: ["Sneakers", "Apparel", "Laces", "All brands"],
  },
  {
    title: "Help",
    links: ["Shipping", "Returns", "Authenticity", "Contact"],
  },
  {
    title: "Sell",
    links: ["Sell with us", "Consignment"],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className={styles.foot}>
      <div className={styles.footIn}>
        <div>
          <Link className={styles.mark} href="#">
            Sole
            <br />
            Supply
          </Link>
          <p>Streetwear and sneakers, checked by hand and shipped in 48 hours.</p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h4>{column.title}</h4>
            <ul>
              {column.links.map((label) => (
                <li key={label}>
                  <Link href="#">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={styles.note}>
        Preview build. Product and editorial photos are stand-ins cropped from your reference screenshots; replace
        them with SoleSupply&apos;s own before launch.
      </div>
    </footer>
  );
}

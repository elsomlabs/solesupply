import Link from "next/link";
import { SoleMark } from "@/components/SoleMark";
import styles from "./SiteFooter.module.css";

const COLUMNS = [
  {
    title: "Shop",
    links: ["Sneakers", "Apparel", "Laces"],
  },
  {
    title: "Help",
    links: ["Shipping", "Returns", "Authenticity", "Contact"],
  },
  {
    title: "Sell",
    links: ["Sell with us"],
  },
] as const;

const HREFS: Record<string, string> = {
  Sneakers: "/sneakers/",
  Apparel: "/apparel/",
  Laces: "/shop/",
  Shipping: "/shipping/",
  Returns: "/returns/",
  Authenticity: "/authenticity/",
  Contact: "/contact/",
  "Sell with us": "/contact/",
};

export function SiteFooter() {
  return (
    <footer className={styles.foot}>
      <div className={styles.footIn}>
        <div>
          <Link className={styles.mark} href="#">
            <SoleMark align="left" />
          </Link>
          <p>Streetwear and sneakers, checked by hand.</p>
          <p>London, UK</p>
          <p>Shipping only within the United Kingdom.</p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h4>{column.title}</h4>
            <ul>
              {column.links.map((label) => (
                <li key={label}>
                  <Link href={HREFS[label] ?? "#"}>
                    {label}
                  </Link>
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

import Link from "next/link";
import styles from "./product.module.css";

export type LeftHeaderProps = {
  id: string;
  title: string;
  viewAllHref: string;
};

export function LeftHeader({ id, title, viewAllHref }: LeftHeaderProps) {
  return (
    <div className={styles.lhead}>
      <h2 id={id}>{title}</h2>
      <Link href={viewAllHref}>View all</Link>
    </div>
  );
}

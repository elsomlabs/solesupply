import Link from "next/link";
import styles from "./product.module.css";

export type CenteredHeaderProps = {
  id: string;
  title: string;
  viewAllHref: string;
  viewAllLabel?: string;
  previousDisabled: boolean;
  nextDisabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function CenteredHeader({
  id,
  title,
  viewAllHref,
  viewAllLabel = "View all",
  previousDisabled,
  nextDisabled,
  onPrevious,
  onNext,
}: CenteredHeaderProps) {
  return (
    <div className={styles.shead}>
      <div className={styles.sheadRow}>
        <button
          className={styles.ib}
          type="button"
          aria-label="Previous"
          disabled={previousDisabled}
          onClick={onPrevious}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
            <path d="M14.5 6l-6 6 6 6" />
          </svg>
        </button>
        <h2 id={id}>{title}</h2>
        <button className={styles.ib} type="button" aria-label="Next" disabled={nextDisabled} onClick={onNext}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
            <path d="M9.5 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      <div>
        <Link className={styles.viewAll} href={viewAllHref}>
          {viewAllLabel}
        </Link>
      </div>
    </div>
  );
}

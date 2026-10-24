import { getProductDetails } from "../../../lib/catalog";
import { formatGbp } from "../../../lib/currency";
import styles from "./ProductDetails.module.css";

function formatReleaseDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function ProductDetails({ id, name }: { id: string; name: string }) {
  const details = getProductDetails(id, name);
  if (!details) return null;

  const rows = [
    details.season ? { label: "Season", value: details.season } : null,
    details.colour ? { label: "Colour", value: details.colour } : null,
    details.releaseDate ? { label: "Release date", value: formatReleaseDate(details.releaseDate) } : null,
    details.styleCode ? { label: "Style code", value: details.styleCode } : null,
    typeof details.retailPriceUsd === "number"
      ? { label: "Original retail", value: formatGbp(details.retailPriceUsd) }
      : null,
  ].filter((row): row is { label: string; value: string } => row !== null);

  return (
    <section className={styles.details} aria-labelledby={`details-${id}`}>
      <h2 id={`details-${id}`} className={styles.heading}>
        Details
      </h2>
      <p>{details.description}</p>
      {rows.length > 0 ? (
        <dl>
          {rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

import styles from "./SoleMark.module.css";

export type SoleMarkProps = {
  size?: "nav" | "hero";
  tone?: "ink" | "onDrop";
  align?: "left" | "center";
  accent?: boolean;
  className?: string;
};

export function SoleMark({
  size = "nav",
  tone = "ink",
  align = "center",
  accent = false,
  className,
}: SoleMarkProps) {
  return (
    <span
      className={[styles.mark, styles[size], styles[tone], styles[align], className]
        .filter(Boolean)
        .join(" ")}
    >
      {accent ? <span className={styles.accent}>Sole</span> : "Sole"}
      <br />
      Supply
      {size === "hero" ? (
        <span className={styles.period} aria-hidden="true">
          <svg viewBox="0 0 12 14" focusable="false">
            <polygon points="6,0.4 11.6,3.6 11.6,10.4 6,13.6 0.4,10.4 0.4,3.6" />
          </svg>
        </span>
      ) : null}
    </span>
  );
}

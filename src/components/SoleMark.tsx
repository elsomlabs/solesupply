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
    </span>
  );
}

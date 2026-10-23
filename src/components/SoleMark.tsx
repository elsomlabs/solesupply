import styles from "./SoleMark.module.css";

export type SoleMarkProps = {
  size?: "nav" | "hero";
  tone?: "ink" | "onDrop";
  align?: "left" | "center";
  className?: string;
};

export function SoleMark({
  size = "nav",
  tone = "ink",
  align = "center",
  className,
}: SoleMarkProps) {
  return (
    <span
      className={[styles.mark, styles[size], styles[tone], styles[align], className]
        .filter(Boolean)
        .join(" ")}
    >
      Sole
      <br />
      Supply
    </span>
  );
}

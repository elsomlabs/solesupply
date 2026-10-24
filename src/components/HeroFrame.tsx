import styles from "./HeroFrame.module.css";

const FRAME_COUNTER = "01 / 01";

export function HeroFrame() {
  return (
    <div className={styles.frame}>
      <div className={styles.box}>
        <span className={`${styles.bracket} ${styles.tl}`} aria-hidden="true" />
        <span className={`${styles.bracket} ${styles.tr}`} aria-hidden="true" />
        <span className={`${styles.bracket} ${styles.bl}`} aria-hidden="true" />
        <span className={`${styles.bracket} ${styles.br}`} aria-hidden="true" />
        <span className={styles.caption} aria-hidden="true">
          ( HOVER TO REVEAL )
        </span>
        <span className={styles.counter} aria-hidden="true">
          {FRAME_COUNTER}
        </span>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./EditorialFeature.module.css";

export type EditorialImage = {
  src: string;
  alt: string;
};

export type EditorialFeatureProps = {
  title: string;
  weight: "heavy" | "light";
  body: string;
  ctaHref: string;
  images: readonly [EditorialImage, EditorialImage, EditorialImage];
};

export function EditorialFeature({ title, weight, body, ctaHref, images }: EditorialFeatureProps) {
  const headingId = useId();
  const [slots, setSlots] = useState<readonly EditorialImage[]>(() => images);
  const [fading, setFading] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current != null) window.clearTimeout(timer.current);
    };
  }, []);

  function rotate(step: -1 | 1) {
    const next = slots.map((_, index) => slots[(index + step + slots.length) % slots.length]);
    setFading(true);
    if (timer.current != null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setSlots(next);
      setFading(false);
      timer.current = null;
    }, 150);
  }

  return (
    <section
      className={`${styles.ed} ${weight === "heavy" ? styles.heavy : styles.light}`}
      aria-labelledby={headingId}
    >
      <div className={styles.edIn}>
        <div className={styles.edCopy}>
          <h3 id={headingId}>{title}</h3>
          <p>{body}</p>
          <Link className={styles.btn} href={ctaHref}>
            Shop now
          </Link>
        </div>
        <div className={styles.edRight}>
          <div className={styles.stage}>
            {slots.map((image, index) => (
              <div
                key={index}
                className={`${styles.stageCard} ${index === 1 ? styles.main : styles.side}`}
              >
                {image.src ? (
                  <img src={image.src} alt={image.alt} style={{ opacity: fading ? 0 : 1 }} />
                ) : null}
              </div>
            ))}
          </div>
          <div className={styles.stageNavWrap}>
            <div className={styles.stageNav}>
              <button
                className={styles.round}
                type="button"
                aria-label="Previous look"
                onClick={() => rotate(-1)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M14.5 6l-6 6 6 6" />
                </svg>
              </button>
              <button
                className={styles.round}
                type="button"
                aria-label="Next look"
                onClick={() => rotate(1)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M9.5 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useRef } from "react";
import { HeroFrame } from "@/components/HeroFrame";
import ShoeDitherVeil from "@/components/ShoeDitherVeil.jsx";
import { SoleMark } from "@/components/SoleMark";
import styles from "./DropHero.module.css";

const TRUST = ["UK delivery only", "Authenticity checked", "New and deadstock"] as const;

export type DropHeroProps = {
  href: string;
  ctaLabel: string;
};

function TrustRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className={styles.trustRow} aria-hidden={hidden || undefined}>
      {TRUST.map((item, index) => (
        <li key={item}>
          {index > 0 ? <span className={styles.trustRule} /> : null}
          {item}
        </li>
      ))}
    </ul>
  );
}

export function DropHero({ href, ctaLabel }: DropHeroProps) {
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <section className={styles.hero}>
      {/* Row 1: shoe at its original size, centered on the hero */}
      <div className={styles.veil} aria-hidden="true">
        <canvas ref={maskCanvasRef} className="shoe-mask-canvas" aria-hidden="true" />
        <ShoeDitherVeil
          maskCanvasRef={maskCanvasRef}
          ariaLabel="Rotating sneaker"
          pixelSize={2}
          pattern="noise"
          palette="duotone"
          levels={2}
        />
      </div>
      <HeroFrame />
      <div className={styles.stage}>
        <span className={styles.pay}>
          <span className={styles.payLabel}>Scroll</span>
          <span className={styles.payLine} />
        </span>
      </div>
      {/* Row 2: shop button, pinned to the bottom-right corner */}
      <div className={styles.identity}>
        <Link href={href} className={styles.cta}>
          {ctaLabel}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
      <h1 className={styles.logo}>
        <SoleMark size="hero" tone="onDrop" align="left" accent />
      </h1>
      {/* Row 3: trust strip */}
      <div className={styles.trust}>
        <div className={styles.trustTrack}>
          <TrustRow />
          <TrustRow hidden />
        </div>
      </div>
    </section>
  );
}

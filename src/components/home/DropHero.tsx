"use client";

import Link from "next/link";
import { useRef } from "react";
import ShoeDitherVeil from "@/components/ShoeDitherVeil.jsx";
import { SoleMark } from "@/components/SoleMark";
import { HeroVideo } from "@/components/home/HeroVideo";
import styles from "./DropHero.module.css";

export type DropHeroProps = {
  href: string;
  ctaLabel: string;
};

export function DropHero({ href, ctaLabel }: DropHeroProps) {
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <Link href={href} className={styles.hero} aria-label="Shop the Friday drop">
      <HeroVideo />
      <div className={styles.veil} aria-hidden="true">
        <canvas ref={maskCanvasRef} className="shoe-mask-canvas" aria-hidden="true" />
        <ShoeDitherVeil
          maskCanvasRef={maskCanvasRef}
          dotColor="#ffffff"
          ariaLabel="Rotating sneaker"
          pixelSize={2}
          pattern="noise"
          palette="duotone"
          levels={2}
        />
      </div>
      <SoleMark size="hero" tone="onDrop" align="left" className={styles.logo} />
      <span className={styles.cta}>{ctaLabel}</span>
      <span className={styles.pay} aria-hidden="true">
        step correct
      </span>
    </Link>
  );
}

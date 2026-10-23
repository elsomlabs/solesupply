"use client";

import { BrandStrip } from "@/components/home/BrandStrip";
import { DropHero } from "@/components/home/DropHero";
import { EditorialFeature } from "@/components/home/EditorialFeature";
import { CenteredHeader } from "@/components/product/CenteredHeader";
import { LeftHeader } from "@/components/product/LeftHeader";
import { PlainCard } from "@/components/product/PlainCard";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductRow } from "@/components/product/ProductRow";
import { apparel, laces, sneakers } from "@/lib/products";
import styles from "@/components/product/product.module.css";

const BRANDS = [
  { name: "Supreme", src: "/logos/supreme.svg", height: 42 },
  { name: "Bape", src: "/logos/bape.webp", height: 66, color: true },
  { name: "New Era", src: "/logos/new-era.jpg", height: 54, color: true },
  { name: "Nike", src: "/logos/nike.svg", height: 30 },
  { name: "Hoka", src: "/logos/hoka.svg", height: 33 },
  { name: "Stance", src: "/logos/stance.webp", height: 39 },
  { name: "Jordan", src: "/logos/jordan.svg", height: 60 },
  { name: "New Balance", src: "/logos/new-balance.svg", height: 42 },
  { name: "Stüssy", src: "/logos/stussy.svg", height: 72 },
];

export default function Home() {
  return (
    <main>
      <DropHero href="#" ctaLabel="Shop now" />
      <BrandStrip brands={BRANDS} />
      <section className={`${styles.sec} ${styles.wrap}`} aria-labelledby="h-sneakers">
        <ProductRow
          variant="5"
          header={(scroll) => (
            <CenteredHeader
              id="h-sneakers"
              title="Latest sneakers"
              viewAllHref="/sneakers/"
              previousDisabled={scroll.atStart}
              nextDisabled={scroll.atEnd}
              onPrevious={() => scroll.by(-1)}
              onNext={() => scroll.by(1)}
            />
          )}
        >
          {sneakers.map((product) => (
            <ProductCard key={product.id} product={product} href={`/sneakers/${product.id}/`} />
          ))}
        </ProductRow>
      </section>
      <EditorialFeature
        title="The Denim Edit"
        weight="heavy"
        body="Raw and washed denim, trucker jackets and the tees that go under them. Straight cuts and everyday staples, built to fade your way."
        ctaHref="#"
        images={[
          { src: "/images/denim-1.webp", alt: "Light-wash denim trucker jacket" },
          { src: "/images/denim-2.webp", alt: "Model in white tee and loose light-wash jeans" },
          { src: "/images/denim-3.webp", alt: "Model in olive work jacket and cap" },
        ]}
      />
      <EditorialFeature
        title="Night Shift Capsule"
        weight="light"
        body="A small run of premium streetwear essentials, in store and online now. Elevated design you can wear every day. Get yours before your size is gone."
        ctaHref="#"
        images={[
          { src: "/images/capsule-1.webp", alt: "Model in black crochet bucket hat" },
          { src: "/images/capsule-2.webp", alt: "Back of a pinstripe hooded jacket" },
          { src: "/images/capsule-3.webp", alt: "Pink long-sleeve top" },
        ]}
      />
      <section className={`${styles.sec} ${styles.wrap}`} aria-labelledby="h-laces" style={{ paddingTop: 112 }}>
        <LeftHeader id="h-laces" title="Laces" viewAllHref="#" />
        <ProductRow variant="laces">
          {laces.map((product) => (
            <PlainCard key={product.id} product={product} />
          ))}
        </ProductRow>
      </section>
      <section className={`${styles.sec} ${styles.wrap}`} aria-labelledby="h-apparel" style={{ paddingTop: 88 }}>
        <LeftHeader id="h-apparel" title="Apparel" viewAllHref="/apparel/" />
        <ProductRow variant="4">
          {apparel.map((product) => (
            <PlainCard key={product.id} product={product} />
          ))}
        </ProductRow>
      </section>
    </main>
  );
}

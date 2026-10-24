"use client";

import Link from "next/link";
import { BrandStrip } from "@/components/home/BrandStrip";
import { EditorialFeature } from "@/components/home/EditorialFeature";
import { CenteredHeader } from "@/components/product/CenteredHeader";
import { ProductRow } from "@/components/product/ProductRow";
import { getItemsByCategory } from "../../lib/catalog";
import { formatGbp as formatCatalogGbp } from "../../lib/currency";
import { formatGbp, getAllProducts, getLowestPrice, getProductImage } from "../../lib/products";
import styles from "@/components/product/product.module.css";

const laces = getItemsByCategory("shoe-laces").sort((a, b) => a.rank - b.rank);

const latestSneakers = getAllProducts()
  .map((product) => ({ product, price: getLowestPrice(product) }))
  .sort((a, b) => b.price - a.price || a.product.name.localeCompare(b.product.name, "en"))
  .slice(0, 15);

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

export function HomeBrands() {
  return <BrandStrip brands={BRANDS} />;
}

export function LatestSneakers() {
  return (
    <section className={`${styles.sec} ${styles.wrap}`} aria-labelledby="h-sneakers">
        <ProductRow
          variant="5"
          header={(scroll) => (
            <CenteredHeader
              id="h-sneakers"
              title="Latest sneakers"
              viewAllHref="/shop/"
              previousDisabled={scroll.atStart}
              nextDisabled={scroll.atEnd}
              onPrevious={() => scroll.by(-1)}
              onNext={() => scroll.by(1)}
            />
          )}
        >
          {latestSneakers.map(({ product, price }) => (
            <Link key={product.slug} href={`/shop/${product.slug}/`} className={`${styles.card} ${styles.sneakerCard}`}>
              <div className={styles.cardMedia}>
                <img src={getProductImage(product.slug)} alt={product.name} />
              </div>
              <p className={styles.cardName}>{product.name}</p>
              <div className={styles.price}>
                <small>From</small>
                {formatGbp(price)}
              </div>
            </Link>
          ))}
        </ProductRow>
    </section>
  );
}

export function HomeBelow() {
  return (
    <>
      <EditorialFeature
        title="text"
        weight="heavy"
        body="text"
        ctaHref="#"
        images={[
          { src: "", alt: "" },
          { src: "", alt: "" },
          { src: "", alt: "" },
        ]}
      />
      <section className={`${styles.sec} ${styles.wrap}`} aria-labelledby="h-laces">
        <ProductRow
          variant="laces"
          header={(scroll) => (
            <CenteredHeader
              id="h-laces"
              title="Laces"
              viewAllHref="/shop/?category=shoe-laces"
              previousDisabled={scroll.atStart}
              nextDisabled={scroll.atEnd}
              onPrevious={() => scroll.by(-1)}
              onNext={() => scroll.by(1)}
            />
          )}
        >
          {laces.map((item) => (
            <Link key={item.id} href={`/shop/${item.slug}/`} className={styles.pcard}>
              <div className={styles.pcardMedia}>
                <img src={item.image} alt={item.name} />
              </div>
              <p className={styles.pcardName}>{item.name}</p>
              <div className={styles.price}>{formatCatalogGbp(item.priceUsd)}</div>
            </Link>
          ))}
        </ProductRow>
      </section>
    </>
  );
}

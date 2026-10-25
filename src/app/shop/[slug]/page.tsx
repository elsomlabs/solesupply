import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import layout from "@/app/sneakers/[id]/page.module.css";
import { ShopPurchase } from "@/components/shop/ShopPurchase";
import { ApparelPurchase } from "@/components/shop/ApparelPurchase";
import { ProductDetails } from "@/components/shop/ProductDetails";
import { SIZE_LABELS, getAllItems, getItemBySlug, getLowestSizePriceUsd, type CatalogItem } from "../../../../lib/catalog";
import { formatGbp as formatUsdAsGbp, toGbp } from "../../../../lib/currency";
import { formatGbp, getAllProducts, getLowestPrice, getProductBySlug, getProductImage } from "../../../../lib/products";
import styles from "./page.module.css";

type Params = { slug: string };

function apparelSizes(item: CatalogItem) {
  if (item.sizePricesUsd) {
    return SIZE_LABELS.flatMap((label) => {
      const usd = item.sizePricesUsd?.[label];
      if (typeof usd !== "number") return [];
      return [{ size: label, gbp: toGbp(usd), label: formatUsdAsGbp(usd) }];
    });
  }
  if (item.waistPricesUsd) {
    return Object.entries(item.waistPricesUsd)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([size, usd]) => ({ size, gbp: toGbp(usd), label: formatUsdAsGbp(usd) }));
  }
  return [];
}

export function generateStaticParams() {
  const seen = new Set<string>();
  return [...getAllProducts().map((product) => product.slug), ...getAllItems().map((item) => item.slug)]
    .filter((slug) => {
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    })
    .map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const product = getProductBySlug(params.slug);
  if (product) {
    return {
      title: `${product.name} · SoleSupply`,
      description: `${product.name}. From ${formatGbp(getLowestPrice(product))}.`,
    };
  }
  const item = getItemBySlug(params.slug);
  if (!item) return { title: "Shop · SoleSupply" };
  return {
    title: `${item.name} · SoleSupply`,
    description: `${item.name}. ${formatUsdAsGbp(item.priceUsd)}.`,
  };
}

export default function ShopProductPage({ params }: { params: Params }) {
  const item = getProductBySlug(params.slug) ? undefined : getItemBySlug(params.slug);
  if (item) {
    return (
      <main className={layout.page}>
        <Link href="/shop/" className={`${styles.back} ${styles.span}`}>
          Back to shop
        </Link>
        <div className={`${layout.media} ${styles.media}`}>
          <div className={styles.frame}>
            <Image
              src={item.image}
              alt={item.name}
              fill
              priority
              sizes="(max-width: 899px) 100vw, 50vw"
              className={styles.photo}
            />
          </div>
        </div>
        <div>
          <ApparelPurchase
            slug={item.slug}
            name={item.name}
            image={item.image}
            price={toGbp(item.priceUsd)}
            priceLabel={formatUsdAsGbp(item.priceUsd)}
            fromLabel={(() => {
              const lowest = getLowestSizePriceUsd(item);
              return lowest === null ? undefined : `From ${formatUsdAsGbp(lowest)}`;
            })()}
            sizes={apparelSizes(item)}
          />
          <ProductDetails id={item.id} name={item.name} />
        </div>
      </main>
    );
  }

  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const file = path.join(process.cwd(), "public", "products", `${product.slug}.webp`);
  const image = fs.existsSync(file) ? getProductImage(product.slug) : null;

  return (
    <main className={layout.page}>
      <Link href="/shop/" className={`${styles.back} ${styles.span}`}>
        Back to shop
      </Link>
      <div className={`${layout.media} ${styles.media}`}>
        {image ? (
          <div className={styles.frame}>
            <Image
              src={image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 899px) 100vw, 50vw"
              className={styles.photo}
            />
          </div>
        ) : (
          <span className={styles.placeholder}>{product.name}</span>
        )}
      </div>
      <div>
        <ShopPurchase
          slug={product.slug}
          name={product.name}
          gender={product.gender}
          image={image ?? ""}
          fromLabel={`From ${formatGbp(getLowestPrice(product))}`}
          sizes={product.sizes.map((size) => ({
            size: size.size,
            gbp: size.gbp,
            label: formatGbp(size.gbp),
          }))}
        />
        <ProductDetails id={product.slug} name={product.name} />
      </div>
    </main>
  );
}

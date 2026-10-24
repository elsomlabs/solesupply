import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import layout from "@/app/sneakers/[id]/page.module.css";
import { ShopPurchase } from "@/components/shop/ShopPurchase";
import { formatGbp, getAllProducts, getLowestPrice, getProductBySlug, getProductImage } from "../../../../lib/products";
import styles from "./page.module.css";

type Params = { slug: string };

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: "Shop · SoleSupply" };
  return {
    title: `${product.name} · SoleSupply`,
    description: `${product.name}. From ${formatGbp(getLowestPrice(product))}.`,
  };
}

export default function ShopProductPage({ params }: { params: Params }) {
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
    </main>
  );
}

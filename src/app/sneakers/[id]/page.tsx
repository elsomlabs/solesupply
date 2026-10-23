import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { sneakers } from "@/lib/products";
import styles from "./page.module.css";

export function generateStaticParams() {
  return sneakers.map((product) => ({ id: product.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const product = sneakers.find((item) => item.id === params.id);
  if (!product) return { title: "SoleSupply" };
  return { title: `${product.name} · SoleSupply` };
}

export default function SneakerPage({ params }: { params: { id: string } }) {
  const product = sneakers.find((item) => item.id === params.id);
  if (!product) notFound();

  return (
    <main className={styles.page}>
      <div className={styles.media}>
        <img src={product.image} alt={product.name} />
      </div>
      <PurchasePanel product={product} />
    </main>
  );
}

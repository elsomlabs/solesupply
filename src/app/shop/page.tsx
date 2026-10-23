import type { Metadata } from "next";
import { Catalog } from "@/components/catalog/Catalog";
import { apparel, laces, sneakers } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop all · SoleSupply",
};

export default function ShopPage() {
  return (
    <Catalog
      title="Shop all"
      sections={[
        { title: "Sneakers", products: sneakers, link: "sneaker" },
        { title: "Apparel", products: apparel },
        { title: "Laces", products: laces },
      ]}
    />
  );
}

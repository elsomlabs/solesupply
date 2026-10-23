import type { Metadata } from "next";
import { Catalog } from "@/components/catalog/Catalog";
import { sneakers } from "@/lib/products";

export const metadata: Metadata = {
  title: "Sneakers · SoleSupply",
};

export default function SneakersPage() {
  return (
    <Catalog
      title="Sneakers"
      sections={[{ title: "Sneakers", products: sneakers, link: "sneaker" }]}
    />
  );
}

import type { Metadata } from "next";
import { Catalog } from "@/components/catalog/Catalog";
import { apparel } from "@/lib/products";

export const metadata: Metadata = {
  title: "Apparel · SoleSupply",
};

export default function ApparelPage() {
  return <Catalog title="Apparel" sections={[{ title: "Apparel", products: apparel }]} />;
}

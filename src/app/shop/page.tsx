import type { Metadata } from "next";
import { ShopQuery } from "./shop-query";

export const metadata: Metadata = {
  title: "Shop | SoleSupply",
  description: "T-shirts, hoodies and pants, priced in pounds.",
};

export default function ShopPage() {
  return <ShopQuery />;
}

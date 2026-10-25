import type { Metadata } from "next";
import { ShopQuery } from "./shop-query";

export const metadata: Metadata = {
  title: "Shop all | SoleSupply",
  description: "Sneakers, apparel and laces, priced in pounds.",
};

export default function ShopPage() {
  return <ShopQuery />;
}

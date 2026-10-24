import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopListing, isShopCategory, isShopSort, shopFilterParams } from "../../../listing";

export const metadata: Metadata = {
  title: "Shop | SoleSupply",
  description: "T-shirts, hoodies and pants, priced in pounds.",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return shopFilterParams();
}

export default function ShopFilterPage({ params }: { params: { category: string; sort: string } }) {
  if (!isShopCategory(params.category) || !isShopSort(params.sort)) notFound();
  return <ShopListing category={params.category} sort={params.sort} />;
}

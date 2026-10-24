import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { formatGbp, getAllProducts, getLowestPrice, getProductImage } from "../../../lib/products";

export const metadata: Metadata = {
  title: "Shop · SoleSupply",
  description: "Sneakers in stock, priced in pounds. Shipping only within the United Kingdom.",
};

export default function ShopPage() {
  const products = getAllProducts().map((product) => {
    const price = getLowestPrice(product);
    const count = product.sizes.length;
    const file = path.join(process.cwd(), "public", "products", `${product.slug}.webp`);

    return {
      slug: product.slug,
      name: product.name,
      price,
      priceLabel: formatGbp(price),
      sizeLabel: count === 1 ? "1 size" : `${count} sizes`,
      sizes: product.sizes.map((entry) => ({
        size: entry.size,
        price: entry.gbp,
        priceLabel: formatGbp(entry.gbp),
      })),
      image: fs.existsSync(file) ? getProductImage(product.slug) : null,
    };
  });

  return <ShopBrowser products={products} />;
}

import { DropHero } from "@/components/home/DropHero";
import { TopSellers } from "@/components/shop/TopSellers";
import { HomeBelow, HomeBrands, LatestSneakers } from "./home-below";

export default function Home() {
  return (
    <main>
      <DropHero href="/shop/" ctaLabel="Shop now" />
      <HomeBrands />
      <LatestSneakers />
      <TopSellers />
      <HomeBelow />
    </main>
  );
}

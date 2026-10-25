import { DropHero } from "@/components/home/DropHero";
import { TopSellers } from "@/components/shop/TopSellers";
import { HomeBelow, HomeBrands, HomeEditorial, LatestSneakers } from "./home-below";

export default function Home() {
  return (
    <main>
      <DropHero href="/shop/" ctaLabel="Shop now" />
      <HomeBrands />
      <LatestSneakers />
      <HomeEditorial />
      <TopSellers />
      <HomeBelow />
    </main>
  );
}

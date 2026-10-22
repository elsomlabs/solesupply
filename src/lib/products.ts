export type Product = {
  id: string;
  name: string;
  price: number;
  from?: boolean;
  was?: number;
  image: string;
  badges?: string[];
};

export const sneakers: Product[] = [
  {
    id: "jordan-1-mid-black-chile-red",
    name: "Jordan 1 Mid Black Chile Red",
    price: 160,
    from: true,
    image: "/images/sneaker-1.webp",
    badges: ["New arrival"],
  },
  {
    id: "jordan-1-low-crimson-tint",
    name: "Jordan 1 Low Crimson Tint",
    price: 220,
    image: "/images/sneaker-2.webp",
    badges: ["New arrival", "1 in stock"],
  },
  {
    id: "jordan-5-retro-green-bean-2022",
    name: "Jordan 5 Retro Green Bean 2022",
    price: 375,
    image: "/images/sneaker-3.webp",
    badges: ["New arrival", "1 in stock"],
  },
  {
    id: "jordan-1-retro-high-og-yellow-ochre",
    name: "Jordan 1 Retro High OG Yellow Ochre",
    price: 550,
    image: "/images/sneaker-4.webp",
    badges: ["New arrival", "1 in stock"],
  },
  {
    id: "jordan-1-mid-se-dark-chocolate",
    name: "Jordan 1 Mid SE Dark Chocolate",
    price: 205,
    was: 240,
    image: "/images/sneaker-5.webp",
    badges: ["Sale", "1 in stock"],
  },
];

export const laces: Product[] = [
  {
    id: "standard-flat-laces-black-160cm",
    name: "Standard Flat Laces Black 160cm",
    price: 10,
    image: "/images/laces-1.webp",
  },
  {
    id: "standard-flat-laces-cool-grey-110cm",
    name: "Standard Flat Laces Cool Grey 110cm",
    price: 10,
    image: "/images/laces-2.webp",
  },
  {
    id: "standard-flat-laces-off-white-beige-110cm",
    name: "Standard Flat Laces Off White Beige 110cm",
    price: 10,
    image: "/images/laces-3.webp",
  },
  {
    id: "standard-flat-laces-tiffany-green-110cm",
    name: "Standard Flat Laces Tiffany Green 110cm",
    price: 10,
    image: "/images/laces-4.webp",
  },
  {
    id: "oval-laces-fuchsia-pink-110cm",
    name: "Oval Laces Fuchsia Pink 110cm",
    price: 10,
    image: "/images/laces-5.webp",
  },
];

export const apparel: Product[] = [
  {
    id: "printed-steep-tech-jacket-black",
    name: "Printed Steep Tech Jacket Black",
    price: 689,
    image: "/images/apparel-1.webp",
  },
  {
    id: "shark-full-zip-hoodie-pink-camo",
    name: "Shark Full Zip Hoodie Pink Camo",
    price: 540,
    image: "/images/apparel-2.webp",
  },
  {
    id: "basic-zip-hoodie-black",
    name: "Basic Zip Hoodie Black",
    price: 189,
    image: "/images/apparel-3.webp",
  },
  {
    id: "racing-leather-jacket-brown",
    name: "Racing Leather Jacket Brown",
    price: 260,
    image: "/images/apparel-4.webp",
  },
];

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(amount: number) {
  return priceFormat.format(amount);
}

import type { Metadata } from "next";
import { InfoPage } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Shipping · SoleSupply",
};

export default function ShippingPage() {
  return (
    <InfoPage
      title="Shipping"
      lede="Sole Supply ships only within the United Kingdom. Orders leave from London after the item has been checked."
      sections={[
        {
          heading: "Where we ship",
          paragraphs: [
            "We deliver to addresses in the United Kingdom. That includes England, Scotland, Wales, and Northern Ireland.",
            "If the address is outside the United Kingdom, we can’t complete the order. We are working on shipping further, and we will say so here when we do.",
          ],
        },
        {
          heading: "How an order leaves",
          paragraphs: [
            "Each pair is checked by hand in London before it is packed.",
            "You get the delivery details once the order is accepted. We send it tracked.",
          ],
        },
      ]}
    />
  );
}

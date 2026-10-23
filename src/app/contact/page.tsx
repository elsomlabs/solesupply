import type { Metadata } from "next";
import { InfoPage } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Sell with us · SoleSupply",
};

export default function ContactPage() {
  return (
    <InfoPage
      title="Sell with us"
      lede="Sole Supply works with people who want to sell sneakers and streetwear. The desk is in London, and every item is checked before it is listed."
      sections={[
        {
          heading: "How to become a seller",
          steps: [
            "Photograph the item in daylight. Include the front, the back, the sole or the label, and any marks or wear.",
            "Tell us the size, the condition, and the price you want. Name the brand exactly as it appears on the item.",
            "Send that to hello@solesupply.co.uk with the subject “Sell with Sole Supply”.",
            "We reply from London and say whether we can take it, and at what price.",
            "If we agree, send the item to the London desk. We tell you the address and cover the UK postage once it is accepted.",
            "We check it by hand. If it is not right, it does not go on the site and we send it back.",
            "When it passes, it is listed. You are paid after it sells, at the price we agreed.",
          ],
        },
        {
          heading: "What we take",
          paragraphs: [
            "Sneakers and streetwear we can authenticate. The item should be unworn, or the wear should be obvious in the photos.",
            "We only arrange collection and postage inside the United Kingdom.",
          ],
        },
      ]}
    />
  );
}

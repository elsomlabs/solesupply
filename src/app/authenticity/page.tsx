import type { Metadata } from "next";
import { InfoPage } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Authenticity · SoleSupply",
};

export default function AuthenticityPage() {
  return (
    <InfoPage
      title="Authenticity"
      lede="Every pair is checked by hand in London. If it is not right, it does not ship."
      sections={[
        {
          heading: "What we look at",
          paragraphs: [
            "Materials, stitching, labels, the sole, and the box. The check is the same for items we buy and items that come in from sellers.",
            "A seller’s item is checked before it is listed, and again before it leaves for a customer.",
          ],
        },
        {
          heading: "If something is wrong",
          paragraphs: [
            "It does not go out. A seller’s item is sent back. A pair we already hold stays off the site.",
            "If a customer believes a pair is not right, write to hello@solesupply.co.uk. We will look at it again in London.",
          ],
        },
      ]}
    />
  );
}

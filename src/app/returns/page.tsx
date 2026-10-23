import type { Metadata } from "next";
import { InfoPage } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Returns · SoleSupply",
};

export default function ReturnsPage() {
  return (
    <InfoPage
      title="Returns"
      lede="Unworn items can be returned within 14 days of delivery, to our desk in London."
      sections={[
        {
          heading: "What you can send back",
          paragraphs: [
            "The item needs to be unworn and in the condition it arrived in, with the box and any papers that came with it.",
            "Returns are accepted from United Kingdom addresses. Write to hello@solesupply.co.uk and we will tell you where to send it.",
          ],
        },
        {
          heading: "What we can’t take back",
          paragraphs: [
            "Worn pairs, items sent back without the packaging they arrived in, and anything that does not match what we shipped.",
            "Once the return reaches London and passes the same check it left with, the refund goes back the way you paid.",
          ],
        },
      ]}
    />
  );
}

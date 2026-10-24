// The default rate is a placeholder.
const USD_TO_GBP = Number(process.env.NEXT_PUBLIC_USD_TO_GBP ?? "0.75");

const wholePounds = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const poundsAndPence = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function toGbp(usd: number): number {
  return Math.round(usd * USD_TO_GBP);
}

export function formatGbp(usd: number): string {
  const converted = usd * USD_TO_GBP;
  if (converted < 50) return poundsAndPence.format(converted);
  return wholePounds.format(Math.round(converted));
}

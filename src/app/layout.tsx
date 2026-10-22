import type { Metadata } from "next";
import { Archivo, Instrument_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  weight: "variable",
  axes: ["wdth"],
  variable: "--font-display",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "SoleSupply Storefront",
  description:
    "Streetwear and sneakers, checked by hand and shipped in 48 hours.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* On body, these variables win over the :root font stacks. */}
      <body className={`${archivo.variable} ${instrumentSans.variable}`}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

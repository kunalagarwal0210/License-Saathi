import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Overpass, Hind } from "next/font/google";
import "./globals.css";

// Signage register — Overpass (derived from Highway Gothic). Variable font.
const overpass = Overpass({
  variable: "--font-overpass",
  subsets: ["latin"],
  display: "swap",
});

// Body register — Hind (Indian Type Foundry, Devanagari-native).
// MVP ships English → "latin" subset only. The "devanagari"/Gujarati subsets
// (via the Hind superfamily, e.g. Hind Vadodara) are added when the second
// language ships — see PRODUCT.md / DESIGN.md.
const hind = Hind({
  variable: "--font-hind",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LicenseSaathi",
  description:
    "Verified, city-specific licensing guidance for first-time small-business owners in Ahmedabad — the ordered set of licenses your shop needs, each cited and dated.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${overpass.variable} ${hind.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ground text-ink font-body">
        {children}
      </body>
    </html>
  );
}

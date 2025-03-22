import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Goat Simulator",
  description: "Calculate and visualize your DeFi investment growth",
  openGraph: {
    title: "Goat Simulator",
    description: "Calculate and visualize your DeFi investment growth",
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
      }
    ],
    url: "https://gpsim.vercel.app",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph.png"],
  },
};

const manrope = Manrope({ weight: "500", subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="dark"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/assets/goa.png" />
      </head>
      <body
        className={`${manrope.className} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

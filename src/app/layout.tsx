import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Goat Simulator",
  description: "Calculate and visualize your DeFi investment growth",
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
        <meta property="og:title" content="Goat Simulator" />
        <meta property="og:description" content="Calculate and visualize your DeFi investment growth" />
        <meta property="og:image" content="/opengraph.png" />
        <meta property="og:url" content="https://gpsim.vercel.app" />
        <meta property="twitter:image" content="/opengraph.png"></meta>
        <meta property="twitter:card" content="summary_large_image"/>
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

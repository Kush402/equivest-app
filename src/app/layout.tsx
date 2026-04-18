import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Equivest — Invest in Real Estate from $50",
  description: "Equivest lets you invest in institutional-grade real estate for as little as $50. Earn passive rental income and long-term appreciation — fully tokenized, fully transparent.",
  keywords: "real estate investing, fractional real estate, tokenized real estate, passive income, property investment",
  openGraph: {
    title: "Equivest — Invest in Real Estate from $50",
    description: "Earn passive income from premium real estate with as little as $50.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={`${geistMono.variable} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

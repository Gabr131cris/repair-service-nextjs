"use client";
//
import "./globals.css";

import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import { SpeedInsights } from "@vercel/speed-insights/next"
export const dynamic = "force-static";

/*export const metadata: Metadata = {
  title: "Car Market | Buy & Sell Vintage Cars",
  description:
    "Discover, buy, and sell iconic classic and vintage cars — safely, easily, and with style.",
};*/

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col font-sans text-gray-900 bg-white antialiased overflow-x-hidden">
        {/* 🔹 Bara de sus cu info */}
        <TopBar />

        {/* 🔹 Navbar principal */}
        <Navbar />

        {/* 🔹 Conținutul paginii — fără limitare globală de lățime */}
        <main className="flex-1 w-full overflow-x-hidden">
          {children}
        </main>

        {/* 🔹 Footer */}
        <Footer />

        {/* 🔹 Buton „scroll to top” */}
        <ScrollToTopButton />
        <SpeedInsights />
      </body>
    </html>
  );
}

"use client";
//
import "./globals.css";

import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next"

export const dynamic = "force-static";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🧠 Debug info la încărcare
  console.log("✅ RootLayout loaded (client-side):", typeof window !== "undefined");
  console.log("🌍 Environment check:");
  console.log("NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  console.log("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  console.log("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
  console.log("NEXT_PUBLIC_FIREBASE_APP_ID:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
  console.log("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:", process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID);

  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col font-sans text-gray-900 bg-white antialiased overflow-x-hidden">
        {/* 🔹 Bara de sus cu info */}
        <TopBar />

        {/* 🔹 Navbar principal */}
        <Navbar />

        {/* 🔹 Conținutul paginii — fără limitare globală de lățime */}
        <main className="flex-1 w-full overflow-x-hidden">{children}</main>

        {/* 🔹 Footer */}
        <Footer />

        {/* 🔹 Buton „scroll to top” */}
        <ScrollToTopButton />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

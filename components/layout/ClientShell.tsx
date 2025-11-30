"use client";

import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

import { usePathname } from "next/navigation";

export default function ClientShell({ children }) {
  const pathname = usePathname();

  const isPrint = pathname.startsWith("/print/");

  return (
    <>
      {!isPrint && <TopBar />}
      {!isPrint && <Navbar />}

      {children}

      {!isPrint && <Footer />}
      {!isPrint && <ScrollToTopButton />}
    </>
  );
}

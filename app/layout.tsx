"use client";

import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 🚫 Hide main navbar on dashboard & learning pages
  const hideNavbar =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/teacher") ||
    pathname?.startsWith("/student") ||
    pathname?.includes("/learn");

  // 🚫 Hide footer on learning page (fullscreen experience)
  const hideFooter = pathname?.includes("/learn");

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {!hideNavbar && <Navbar />}
        <main className="flex-1">{children}</main>
        {!hideFooter && <Footer />}
      </body>
    </html>
  );
}
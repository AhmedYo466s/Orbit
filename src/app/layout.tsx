import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ORBIT",
  description: "منصة لإدارة عمليات الشركات والمهام وسير العمل",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.variable} ${plexArabic.variable}`}>
        {children}
      </body>
    </html>
  );
}

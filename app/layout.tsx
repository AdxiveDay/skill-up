// app/layout.tsx (Server Component)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ExpTicker from "@/app/components/ExpTicker";
import "./globals.css";
import FadeLayout from "./components/FadeLayout"; // client wrapper สำหรับ fade

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillUp",
  description: "The platform for future learning way.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ExpTicker />
        {/* wrapper client component สำหรับ fade + smooth */}
        <FadeLayout>{children}</FadeLayout>
      </body>
    </html>
  );
}

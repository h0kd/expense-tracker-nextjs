// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expense Tracker – Controla tus Gastos",
  description: "Next.js + TailwindCSS + Prisma",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="transition-colors" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          antialiased
          bg-white text-gray-900
          dark:bg-gray-900 dark:text-gray-100
          min-h-screen
          transition-colors
        `}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // ← usa sonner

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
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
    <html lang="en" suppressHydrationWarning className="transition-colors dark">
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          antialiased
          bg-white text-gray-900
          dark:bg-gray-900 dark:text-gray-100
          transition-colors
          min-h-screen
        `}
      >
        {/* Toaster de Sonner */}
        <Toaster position="top-right" theme="system" richColors closeButton />
        {children}
      </body>
    </html>
  );
}

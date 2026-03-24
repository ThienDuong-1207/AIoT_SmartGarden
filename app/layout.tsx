import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/marketing/AppHeader";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-manrope", // Giữ nguyên tên CSS variable để Tailwind config không bị lỗi
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono", // Giữ nguyên tên CSS variable
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Smart Garden AIoT",
  description: "E-commerce + IoT dashboard for hydroponics",
};

import GalaxyBackground from "@/components/ui/GalaxyBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-transparent" style={{ background: "transparent", color: "var(--text-primary)" }} suppressHydrationWarning>
        <AuthSessionProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <AppHeader />
            </Suspense>
            <GalaxyBackground />
            {children}
          </CartProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/marketing/AppHeader";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import GalaxyBackground from "@/components/ui/GalaxyBackground";
import { Suspense } from "react";
const inter = Inter({
  variable: "--font-manrope",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Smart Garden AIoT",
  description: "E-commerce + IoT dashboard for hydroponics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col"
        style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
        suppressHydrationWarning
      >
        <AuthSessionProvider>
          <CartProvider>
            <ThemeProvider>
              <Suspense fallback={null}>
                <AppHeader />
              </Suspense>
              <GalaxyBackground />
              {children}
            </ThemeProvider>
          </CartProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: { default: "Theater With a View", template: "%s | Theater With a View" },
  description: "Suggest movies for movie night",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`h-full ${dmSans.variable}`}>
        <body className="min-h-full flex flex-col bg-wire-bg text-wire-text font-sans">
          {/* Persistent header */}
          <header className="border-b-2 border-wire-border bg-wire-white flex items-center justify-between px-4 min-h-[44px]">
            <Link
              href="/"
              className="font-bold text-wire-text text-2xl leading-none py-2"
            >
              Theater With a View
            </Link>
            <Link
              href="/preferences"
              aria-label="Preferences"
              className="text-wire-text-muted hover:text-wire-text text-2xl leading-none p-2 -mr-2"
            >
              ⚙
            </Link>
          </header>
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

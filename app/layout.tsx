import type { Metadata } from "next";
import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: { default: "Movie Night", template: "%s | Movie Night" },
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
              Movie Night
            </Link>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

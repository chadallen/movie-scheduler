import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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
      <html lang="en" className="h-full">
        <body className="min-h-full flex flex-col bg-wire-bg text-wire-text font-sans">
          {/* Persistent header */}
          <header className="border-b-2 border-wire-border bg-wire-white flex items-center justify-between px-4 min-h-[44px]">
            <Link
              href="/"
              className="font-bold text-wire-text text-lg leading-none py-2"
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

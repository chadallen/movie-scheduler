import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider, Show, SignOutButton } from "@clerk/nextjs";
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
            <Show when="signed-in">
              <SignOutButton>
                <button
                  type="button"
                  className="
                    border-2 border-wire-border
                    bg-wire-bg
                    hover:bg-wire-surface
                    active:bg-wire-surface-2
                    text-wire-text
                    text-sm font-bold
                    rounded-sm
                    px-3
                    min-h-[36px]
                    cursor-pointer
                    transition-colors
                  "
                >
                  Sign out
                </button>
              </SignOutButton>
            </Show>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

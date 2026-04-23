import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movie Scheduler",
  description: "Suggest and schedule movies for movie night",
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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

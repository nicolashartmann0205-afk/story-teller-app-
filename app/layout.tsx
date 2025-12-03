import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ParticleBackground from "@/components/ui/particle-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Story Teller App",
  description: "Create and share your stories with the world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Simple, synchronous layout component - no async operations
  // Always returns valid HTML structure to ensure rendering
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <ParticleBackground />
        {/* Simple header to confirm rendering */}
        <header className="sr-only">
          <h1>Story Teller App</h1>
        </header>
        <div className="relative z-10">
            {children}
        </div>
      </body>
    </html>
  );
}

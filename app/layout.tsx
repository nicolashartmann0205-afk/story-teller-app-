import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientParticleBackground from "@/components/ui/client-particle-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Story Teller App — tell your story app for writers",
    template: "%s | Story Teller App",
  },
  description:
    "A storytelling app to plan, draft, and finish your work. The tell your story app for structure, scenes, and export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Simple, synchronous layout component - no async operations
  // Always returns valid HTML structure to ensure rendering
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <ClientParticleBackground />
        <header className="sr-only">
          <p>Story Teller App</p>
        </header>
        <div className="relative z-10">
            {children}
        </div>
      </body>
    </html>
  );
}

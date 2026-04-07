import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/nav/site-header";
import ClientParticleBackground from "@/components/ui/client-particle-background";
import { getAppUrl } from "@/lib/config/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl().replace(/\/$/, "") || "http://localhost:3000"),
  title: {
    default: "Story Teller App — tell your story app for writers",
    template: "%s | Story Teller App",
  },
  description:
    "A storytelling app to plan, draft, and finish your work. The tell your story app for structure, scenes, and export.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <ClientParticleBackground />
        <SiteHeader />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}

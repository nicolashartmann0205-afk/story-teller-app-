import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav
        className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20"
        aria-label="Main"
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 hover:underline"
            >
              Dashboard
            </Link>
            <Link
              href="/stories"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              My stories
            </Link>
            <Link
              href="/settings"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              Settings
            </Link>
            <Link
              href="/blog"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              aria-label="Guides and articles"
            >
              Blog
            </Link>
          </div>
          <SignOutButton />
        </div>
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}

import Link from "next/link";

export function BlogHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
        >
          ← Story Teller
        </Link>
        <nav aria-label="Blog" className="flex items-center gap-6 text-sm">
          <Link
            href="/blog"
            className="font-medium text-zinc-700 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            All posts
          </Link>
          <Link
            href="/auth/sign-in"
            className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}

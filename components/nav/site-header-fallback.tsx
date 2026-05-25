import Link from "next/link";

/** Static shell shown while auth-aware header streams in. */
export function SiteHeaderFallback() {
  return (
    <header
      className="sticky top-0 z-30 border-b border-brand-seafoam/50 bg-brand-cream/90 backdrop-blur-sm dark:border-brand-seafoam/30 dark:bg-brand-ink/90"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm font-semibold text-brand-ink dark:text-brand-yellow hover:text-brand-teal dark:hover:text-brand-seafoam"
        >
          Story Teller
        </Link>
      </div>
    </header>
  );
}

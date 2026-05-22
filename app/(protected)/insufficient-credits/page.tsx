import Link from "next/link";
import { DAILY_FREE_QUOTA, getUserCreditBalance } from "@/lib/credits/service";
import { createClient } from "@/lib/supabase/server";
import { buildDynamicPageMetadata } from "@/lib/seo/dynamic-metadata";

export async function generateMetadata() {
  return buildDynamicPageMetadata("insufficient-credits", {
    title: "Not enough credits - Story Teller",
    description: "Your daily AI credits are used up. Come back tomorrow for a fresh balance.",
    canonicalPath: "/insufficient-credits",
  });
}

export default async function InsufficientCreditsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const balance = user ? await getUserCreditBalance(user.id) : 0;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full space-y-6 rounded-lg border border-brand-seafoam/40 bg-white/95 p-8 shadow-lg dark:border-brand-seafoam/30 dark:bg-brand-ink/85">
        <p className="text-4xl" aria-hidden>
          ⏳
        </p>
        <h1 className="text-2xl font-bold text-brand-ink dark:text-brand-yellow">
          You do not have enough credits
        </h1>
        <p className="text-brand-ink/85 dark:text-brand-seafoam">
          Please try again tomorrow. Each AI generation uses 10 credits. Your balance resets to{" "}
          {DAILY_FREE_QUOTA} at midnight UTC.
        </p>
        {user ? (
          <p className="text-sm text-brand-ink/70 dark:text-brand-seafoam/90">
            Current balance: <span className="font-semibold">{balance}</span> credits
          </p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex justify-center rounded-md bg-brand-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-teal dark:bg-brand-yellow dark:text-brand-ink dark:hover:bg-brand-seafoam"
          >
            Back to dashboard
          </Link>
          <Link
            href="/settings"
            className="inline-flex justify-center rounded-md border border-brand-seafoam/60 px-5 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-cream dark:border-brand-seafoam/40 dark:text-brand-seafoam dark:hover:bg-brand-ink/70"
          >
            View credit history
          </Link>
        </div>
      </div>
    </div>
  );
}

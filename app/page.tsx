import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Ensure OAuth ?code= handling is never served from a stale static shell.
export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  // Supabase may send OAuth code to Site URL root if redirect URL allowlist mismatches; forward to callback.
  const code = params.code;
  if (typeof code === "string" && code.length > 0) {
    const u = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val === undefined) continue;
      if (Array.isArray(val)) {
        val.forEach((v) => u.append(key, v));
      } else {
        u.set(key, val);
      }
    }
    redirect(`/auth/callback?${u.toString()}`);
  }

  // Check authentication - handle errors gracefully
  let user = null;
  let authError = null;

  try {
    const supabase = await createClient();

    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      // No cookies / not signed in — getUser() returns this; not a real failure for the landing page.
      const isMissingSession =
        error.message?.includes("Auth session missing") ||
        (error as { name?: string }).name === "AuthSessionMissingError";
      if (!isMissingSession) {
        authError = error;
        console.error("Error checking authentication:", error);
      }
    } else {
      user = authUser;
    }
  } catch (error) {
    authError = error instanceof Error ? error : new Error("Unknown authentication error");
    console.error("Error checking authentication:", error);
    // Continue to show landing page on error
  }

  // Redirect authenticated users to stories page
  // This must be outside try-catch so redirect() can work properly
  if (user && !authError) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Story Teller App
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Create and manage your stories. Sign in to get started or create a new account to begin your storytelling journey.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            href="/auth/sign-up"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black dark:bg-zinc-50 px-5 text-white dark:text-black transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 md:w-[158px]"
          >
            Sign Up
          </Link>
          <Link
            href="/auth/sign-in"
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] dark:border-white/[.145] px-5 text-black dark:text-zinc-50 transition-colors hover:border-transparent hover:bg-black/[.04] dark:hover:bg-[#1a1a1a] md:w-[158px]"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}

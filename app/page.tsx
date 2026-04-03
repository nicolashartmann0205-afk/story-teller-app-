import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HomeLanding } from "@/components/marketing/home-landing";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Ensure OAuth ?code= handling is never served from a stale static shell.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Story Teller App — tell your story app for writers",
  description:
    "Plan structure, scenes, and reviews in one storytelling app. The tell your story app for finishing drafts, review checks, and export.",
};

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
    <div className="flex min-h-screen flex-col font-sans">
      <HomeLanding />
    </div>
  );
}

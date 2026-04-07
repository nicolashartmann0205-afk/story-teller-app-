import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HomeLanding } from "@/components/marketing/home-landing";

// OAuth ?code= on `/` is redirected to `/auth/callback` in middleware.ts (no duplicate redirect here).
// Ensure OAuth handling is never served from a stale static shell.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Story Teller — Writing app for structure, scenes & story maps",
  description:
    "Plan structure, scenes, and reviews in one app. Story maps, beats, and exports for writers who want more than a blank page—start free and finish your draft.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  },
};

export default async function Home() {
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

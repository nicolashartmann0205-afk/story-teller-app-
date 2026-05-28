"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AUTH_ROUTES } from "@/lib/auth/routes";

type ClientUser = {
  id: string;
  email?: string;
};

export default function SettingsPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "unauthorized" | "error">("loading");
  const [user, setUser] = useState<ClientUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (error || !authUser) {
          setStatus("unauthorized");
          return;
        }

        setUser({ id: authUser.id, email: authUser.email ?? undefined });
        setStatus("ready");
      } catch (error) {
        console.error("[SETTINGS][CLIENT_LOAD_FAILED]", error);
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-brand-cream dark:bg-brand-ink py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto rounded-lg border border-brand-seafoam/30 bg-white dark:bg-brand-ink/80 p-6">
          <p className="text-sm text-brand-ink/85 dark:text-brand-seafoam">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="min-h-screen bg-brand-cream dark:bg-brand-ink py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto rounded-lg border border-brand-seafoam/30 bg-white dark:bg-brand-ink/80 p-6">
          <h1 className="text-xl font-semibold text-brand-ink dark:text-brand-yellow">Please sign in</h1>
          <Link
            href={AUTH_ROUTES.SIGN_IN}
            className="mt-4 inline-flex items-center rounded-md bg-brand-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand-teal dark:bg-brand-yellow dark:text-brand-ink dark:hover:bg-brand-seafoam"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-brand-cream dark:bg-brand-ink py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto rounded-lg border border-red-300/60 bg-white dark:bg-brand-ink/80 p-6">
          <h1 className="text-xl font-semibold text-red-700 dark:text-red-300">
            We could not load settings right now
          </h1>
          <p className="mt-2 text-sm text-brand-ink/80 dark:text-brand-seafoam">
            Please refresh and try again.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center rounded-md bg-brand-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand-teal dark:bg-brand-yellow dark:text-brand-ink dark:hover:bg-brand-seafoam"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-brand-ink py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="mb-2">
          <Link
            href="/dashboard"
            className="text-sm text-brand-ink/85 dark:text-brand-seafoam hover:text-brand-teal dark:hover:text-brand-yellow"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <div className="rounded-lg border border-brand-seafoam/30 bg-white dark:bg-brand-ink/80 p-6">
          <h1 className="text-xl font-semibold text-brand-ink dark:text-brand-yellow">Settings</h1>
          <p className="mt-2 text-sm text-brand-ink/80 dark:text-brand-seafoam">
            Signed in as {user?.email ?? "your account"}.
          </p>
          <p className="mt-3 text-sm text-brand-ink/80 dark:text-brand-seafoam">
            Settings is now running in resilient mode so it always loads even during backend instability.
          </p>
        </div>
      </div>
    </div>
  );
}


import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthCallbackUrlForRequest } from "@/lib/auth/callback-url";
import { safeRelativeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/server";
import { buildDynamicPageMetadata } from "@/lib/seo/dynamic-metadata";
import SignInForm from "./sign-in-form";

export async function generateMetadata() {
  const metadata = await buildDynamicPageMetadata("sign-in", {
    title: "Sign in - secure account access",
    description:
      "Sign in to Story Teller to plan structure, scenes, and maps in one place, then continue your drafts with less friction and better momentum. Continue now.",
    canonicalPath: "/auth/sign-in",
  });

  return {
    ...metadata,
    robots: { index: false, follow: true },
  };
}

async function signInAction(previousState: { error?: string; success?: string } | null | void, formData: FormData) {
  "use server";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const isMagicLink = formData.get("magicLink") === "true";
  const rawNext = formData.get("redirectedFrom") as string | null;
  const nextPath = safeRelativeNextPath(rawNext || undefined);

  if (!email) {
    return { error: "Email is required" };
  }

  const supabase = await createClient();

  if (isMagicLink) {
    const callbackUrl = new URL(await getAuthCallbackUrlForRequest());
    callbackUrl.searchParams.set("next", nextPath);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { success: "Check your email for the magic link!" };
  }

  if (!password) {
    return { error: "Password is required for password sign-in" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Unsupported provider")) {
      return {
        error:
          "Google sign-in is currently not enabled. Please enable Google provider in Supabase Authentication settings and try again.",
      };
    }
    return { error: error.message };
  }

  redirect(nextPath);
}

async function signInWithGoogleAction(nextPath: string) {
  "use server";
  const supabase = await createClient();
  const callbackUrl = new URL(await getAuthCallbackUrlForRequest());
  callbackUrl.searchParams.set("next", safeRelativeNextPath(nextPath));
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

type SignInPageProps = {
  searchParams: Promise<{ error?: string; redirectedFrom?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const sp = await searchParams;
  const oauthError = sp.error === "oauth";
  const redirectedFrom = sp.redirectedFrom;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white dark:bg-zinc-900 p-8 shadow-lg">
        {oauthError && (
          <div
            className="rounded-md bg-red-50 dark:bg-red-900/20 p-4"
            role="alert"
          >
            <p className="text-sm text-red-800 dark:text-red-200">
              Sign-in could not be completed. Please try again, or use another
              sign-in method.
            </p>
          </div>
        )}
        <div>
          <h2 className="text-3xl font-bold text-center text-black dark:text-zinc-50">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Or{" "}
            <Link
              href={
                redirectedFrom
                  ? `/auth/sign-up?redirectedFrom=${encodeURIComponent(redirectedFrom)}`
                  : "/auth/sign-up"
              }
              className="font-medium text-zinc-950 dark:text-zinc-50 hover:underline"
            >
              create a new account
            </Link>
          </p>
        </div>

        <SignInForm
          redirectedFrom={redirectedFrom}
          signInAction={signInAction}
          signInWithGoogleAction={signInWithGoogleAction.bind(null, redirectedFrom ?? "")}
        />
      </div>
    </div>
  );
}

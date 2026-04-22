import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthCallbackUrlForRequest } from "@/lib/auth/callback-url";
import { AUTH_ROUTES, withRedirectedFrom } from "@/lib/auth/routes";
import { safeRelativeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/server";
import { buildDynamicPageMetadata } from "@/lib/seo/dynamic-metadata";
import SignUpForm from "./sign-up-form";

export async function generateMetadata() {
  const metadata = await buildDynamicPageMetadata("sign-up", {
    title: "Sign up - create your free account",
    description:
      "Create a free Story Teller account to plan structure, scenes, and maps with guided workflows, then start your first draft and build momentum today. Sign up now.",
    canonicalPath: AUTH_ROUTES.SIGN_UP,
  });

  return {
    ...metadata,
    robots: { index: false, follow: true },
  };
}

async function signUpAction(previousState: { error?: string } | null | void, formData: FormData) {
  "use server";

  // Defensive check for formData
  if (!formData) {
    return { error: "Form data is missing" };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rawNext = formData.get("redirectedFrom") as string | null;
  const nextPath = safeRelativeNextPath(rawNext || undefined);

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();

  const callbackUrl = new URL(await getAuthCallbackUrlForRequest());
  callbackUrl.searchParams.set("next", nextPath);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    return { error: error.message };
  }

  const back = rawNext
    ? withRedirectedFrom(AUTH_ROUTES.SIGN_IN, rawNext)
    : AUTH_ROUTES.SIGN_IN;
  redirect(back);
}

type SignUpPageProps = {
  searchParams: Promise<{ redirectedFrom?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const sp = await searchParams;
  const redirectedFrom = sp.redirectedFrom;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(safeRelativeNextPath(redirectedFrom));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white dark:bg-zinc-900 p-8 shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-black dark:text-zinc-50">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Or{" "}
            <Link
              href={withRedirectedFrom(AUTH_ROUTES.SIGN_IN, redirectedFrom)}
              className="font-medium text-zinc-950 dark:text-zinc-50 hover:underline"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <SignUpForm redirectedFrom={redirectedFrom} signUpAction={signUpAction} />
      </div>
    </div>
  );
}


import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignInForm from "./sign-in-form";

async function signInAction(previousState: { error?: string; success?: string } | null | void, formData: FormData) {
  "use server";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const isMagicLink = formData.get("magicLink") === "true";

  if (!email) {
    return { error: "Email is required" };
  }

  const supabase = await createClient();

  if (isMagicLink) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
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
    return { error: error.message };
  }

  redirect("/dashboard");
}

export default function SignInPage() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white dark:bg-zinc-900 p-8 shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-black dark:text-zinc-50">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Or{" "}
            <Link
              href="/auth/sign-up"
              className="font-medium text-zinc-950 dark:text-zinc-50 hover:underline"
            >
              create a new account
            </Link>
          </p>
        </div>

        <SignInForm signInAction={signInAction} />
      </div>
    </div>
  );
}


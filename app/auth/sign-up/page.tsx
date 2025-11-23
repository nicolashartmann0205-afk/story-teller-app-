import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignUpForm from "./sign-up-form";

async function signUpAction(previousState: { error?: string } | null, formData: FormData) {
  "use server";

  // Defensive check for formData
  if (!formData) {
    return { error: "Form data is missing" };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/auth/sign-in");
}

export default function SignUpPage() {

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
              href="/auth/sign-in"
              className="font-medium text-zinc-950 dark:text-zinc-50 hover:underline"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <SignUpForm signUpAction={signUpAction} />
      </div>
    </div>
  );
}


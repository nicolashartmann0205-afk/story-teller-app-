"use client";

import { useActionState } from "react";

type SignUpAction = (previousState: { error?: string } | null | void, formData: FormData) => Promise<{ error?: string } | void | null>;

export default function SignUpForm({
  redirectedFrom,
  signUpAction,
}: {
  redirectedFrom?: string;
  signUpAction: SignUpAction;
}) {
  const [state, formAction, isPending] = useActionState(signUpAction, null);

  return (
    <form className="mt-8 space-y-6" action={formAction}>
      <input type="hidden" name="redirectedFrom" value={redirectedFrom ?? ""} />
      {state?.error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{state.error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-brand-ink dark:text-brand-seafoam"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-md border border-brand-seafoam/60 dark:border-brand-seafoam/40 bg-white dark:bg-brand-ink/70 px-3 py-2 text-brand-ink dark:text-brand-seafoam placeholder-brand-ink/40 dark:placeholder-brand-seafoam/50 focus:border-brand-teal dark:focus:border-brand-yellow focus:outline-none focus:ring-1 focus:ring-brand-teal dark:focus:ring-brand-yellow"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-brand-ink dark:text-brand-seafoam"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 block w-full rounded-md border border-brand-seafoam/60 dark:border-brand-seafoam/40 bg-white dark:bg-brand-ink/70 px-3 py-2 text-brand-ink dark:text-brand-seafoam placeholder-brand-ink/40 dark:placeholder-brand-seafoam/50 focus:border-brand-teal dark:focus:border-brand-yellow focus:outline-none focus:ring-1 focus:ring-brand-teal dark:focus:ring-brand-yellow"
            placeholder="••••••••"
            minLength={6}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-ink dark:bg-brand-yellow dark:text-brand-ink hover:bg-brand-teal dark:hover:bg-brand-seafoam focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Creating account..." : "Sign up"}
        </button>
      </div>
    </form>
  );
}


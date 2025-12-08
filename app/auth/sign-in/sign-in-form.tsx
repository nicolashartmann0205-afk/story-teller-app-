"use client";

import { useActionState, useState } from "react";

type SignInAction = (previousState: { error?: string; success?: string } | null | void, formData: FormData) => Promise<{ error?: string; success?: string } | void | null>;

export default function SignInForm({ signInAction }: { signInAction: SignInAction }) {
  const [state, formAction, isPending] = useActionState(signInAction, null);
  const [useMagicLink, setUseMagicLink] = useState(true);

  return (
    <form className="mt-8 space-y-6" action={formAction}>
      <input type="hidden" name="magicLink" value={useMagicLink.toString()} />
      
      {state?.error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{state.error}</p>
        </div>
      )}

      {state?.success && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
          <p className="text-sm text-green-800 dark:text-green-200">{state.success}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-500"
            placeholder="you@example.com"
          />
        </div>

        {!useMagicLink && (
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required={!useMagicLink}
              className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-500"
              placeholder="••••••••"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black dark:bg-zinc-50 dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Processing..." : (useMagicLink ? "Send Magic Link" : "Sign in")}
        </button>

        <button
          type="button"
          onClick={() => setUseMagicLink(!useMagicLink)}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
        >
          {useMagicLink ? "Sign in with password instead" : "Sign in with magic link instead"}
        </button>
      </div>
    </form>
  );
}


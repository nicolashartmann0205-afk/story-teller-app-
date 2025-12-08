"use client";

import { useActionState } from "react";

type UpdateProfileAction = (previousState: { error?: string; success?: string } | null | void, formData: FormData) => Promise<{ error?: string; success?: string } | void | null>;

interface ProfileFormProps {
  user: any;
  profile: any;
  updateProfileAction: UpdateProfileAction;
}

export default function ProfileForm({ user, profile, updateProfileAction }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-6">
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

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="email"
            id="email"
            disabled
            className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
            defaultValue={user.email}
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500">Email cannot be changed here.</p>
      </div>

      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Display Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="displayName"
            id="displayName"
            className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 placeholder-zinc-400 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            defaultValue={profile?.displayName || ""}
            placeholder="Your Name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Bio
        </label>
        <div className="mt-1">
          <textarea
            id="bio"
            name="bio"
            rows={3}
            className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 placeholder-zinc-400 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            defaultValue={profile?.bio || ""}
            placeholder="Tell us a bit about yourself..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-black dark:bg-zinc-50 py-2 px-4 text-sm font-medium text-white dark:text-black shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}


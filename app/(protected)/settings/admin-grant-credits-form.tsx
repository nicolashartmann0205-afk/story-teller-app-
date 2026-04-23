"use client";

import { useActionState } from "react";

type GrantCreditsState = { error?: string; success?: string } | null;

type GrantCreditsAction = (
  previousState: GrantCreditsState,
  formData: FormData
) => Promise<GrantCreditsState>;

export default function AdminGrantCreditsForm({
  grantCreditsAction,
}: {
  grantCreditsAction: GrantCreditsAction;
}) {
  const [state, formAction, isPending] = useActionState(grantCreditsAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
          <p className="text-sm text-red-800 dark:text-red-200">{state.error}</p>
        </div>
      ) : null}
      {state?.success ? (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3">
          <p className="text-sm text-green-800 dark:text-green-200">{state.success}</p>
        </div>
      ) : null}

      <div>
        <label htmlFor="targetUserId" className="block text-sm font-medium text-brand-ink dark:text-brand-seafoam">
          Target user ID
        </label>
        <input
          id="targetUserId"
          name="targetUserId"
          type="text"
          required
          placeholder="UUID from auth.users"
          className="mt-1 block w-full rounded-md border border-brand-seafoam/60 dark:border-brand-seafoam/40 bg-white dark:bg-brand-ink/70 px-3 py-2 text-brand-ink dark:text-brand-seafoam focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-brand-ink dark:text-brand-seafoam">
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min={1}
            step={1}
            defaultValue={20}
            required
            className="mt-1 block w-full rounded-md border border-brand-seafoam/60 dark:border-brand-seafoam/40 bg-white dark:bg-brand-ink/70 px-3 py-2 text-brand-ink dark:text-brand-seafoam focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-brand-ink dark:text-brand-seafoam">
            Reason
          </label>
          <input
            id="reason"
            name="reason"
            type="text"
            defaultValue="admin_grant"
            className="mt-1 block w-full rounded-md border border-brand-seafoam/60 dark:border-brand-seafoam/40 bg-white dark:bg-brand-ink/70 px-3 py-2 text-brand-ink dark:text-brand-seafoam focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-brand-ink dark:bg-brand-yellow py-2 px-4 text-sm font-medium text-white dark:text-brand-ink shadow-sm hover:bg-brand-teal dark:hover:bg-brand-seafoam disabled:opacity-50"
        >
          {isPending ? "Granting..." : "Grant credits"}
        </button>
      </div>
    </form>
  );
}

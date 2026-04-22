"use client";

import { useActionState } from "react";
import type { FeedbackFormState } from "./actions";

type SubmitAction = (
  prev: FeedbackFormState | null | void,
  formData: FormData
) => Promise<FeedbackFormState>;

const initialState: FeedbackFormState = {};

export function FeedbackForm({
  submitAction,
}: {
  submitAction: SubmitAction;
}) {
  const [state, formAction, isPending] = useActionState(submitAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <input type="hidden" name="sourcePath" value="/feedback" />

      {state?.error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {state.error}
        </div>
      ) : null}

      {state?.success ? (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300">
          {state.success}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Category</span>
          <select
            name="category"
            required
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="">Select category</option>
            <option value="product-feedback">Product feedback</option>
            <option value="bug-report">Bug report</option>
            <option value="technical-issue">Technical issue</option>
            <option value="account">Account issue</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Email (optional)</span>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
      </div>

      <label className="space-y-1 text-sm block">
        <span className="text-zinc-700 dark:text-zinc-300">Subject</span>
        <input
          type="text"
          name="subject"
          required
          maxLength={180}
          placeholder="Short summary"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </label>

      <label className="space-y-1 text-sm block">
        <span className="text-zinc-700 dark:text-zinc-300">Message</span>
        <textarea
          name="message"
          required
          rows={7}
          maxLength={5000}
          placeholder="Share what happened, what you expected, and any steps to reproduce."
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
      >
        {isPending ? "Submitting..." : "Submit feedback"}
      </button>
    </form>
  );
}

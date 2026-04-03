"use client";

import { useActionState } from "react";
import { createBlogPostAction } from "@/app/(protected)/blog-admin/actions";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

export function NewPostForm() {
  const [state, action, pending] = useActionState(createBlogPostAction, null as { error?: string } | null);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-6">
      {state?.error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <label className="block space-y-1">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Slug</span>
        <input name="slug" required placeholder="my-post-url" className={inputClass} autoComplete="off" />
        <span className="text-xs text-zinc-500">Lowercase, hyphens only (e.g. story-structure).</span>
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Title</span>
        <input name="title" required className={inputClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Description</span>
        <input name="description" required className={inputClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Publish date</span>
        <input name="publishedAt" type="date" required defaultValue={today} className={inputClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Body (Markdown)</span>
        <textarea name="content" required rows={18} className={`${inputClass} font-mono text-xs`} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
      >
        {pending ? "Saving…" : "Create post"}
      </button>
    </form>
  );
}

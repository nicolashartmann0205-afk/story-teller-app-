"use client";

import { useActionState } from "react";
import type { updateBlogSeoAction } from "@/app/(protected)/seo-admin/actions";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

type EditorRow = {
  slug: string;
  title: string;
  seoTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  updatedAt: string;
};

type Props = {
  rows: EditorRow[];
  updateAction: typeof updateBlogSeoAction;
};

function PostSeoCard({ row, updateAction }: { row: EditorRow; updateAction: typeof updateBlogSeoAction }) {
  const bound = async (prev: { error?: string; success?: string } | null, formData: FormData) =>
    updateAction(row.slug, prev, formData);
  const [state, formAction, pending] = useActionState(bound, null as { error?: string; success?: string } | null);

  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4">
        <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{row.title}</p>
        <p className="text-xs text-zinc-500">/blog/{row.slug}</p>
      </div>

      <form action={formAction} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">SEO Title</span>
          <input name="seoTitle" defaultValue={row.seoTitle ?? ""} placeholder="Title tag for search results" className={inputClass} />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Meta Description</span>
          <textarea
            name="metaDescription"
            rows={3}
            defaultValue={row.metaDescription ?? ""}
            placeholder="Brief summary for search snippets"
            className={inputClass}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Canonical URL</span>
          <input
            name="canonicalUrl"
            defaultValue={row.canonicalUrl ?? ""}
            placeholder="https://storyinthemaking.com/blog/your-post"
            className={inputClass}
          />
        </label>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-zinc-500">Last updated: {new Date(row.updatedAt).toLocaleString()}</p>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
          >
            {pending ? "Saving..." : "Save"}
          </button>
        </div>

        {state?.error ? <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p> : null}
        {state?.success ? <p className="text-sm text-green-700 dark:text-green-400">{state.success}</p> : null}
      </form>
    </li>
  );
}

export function SeoBlogPostsEditor({ rows, updateAction }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        No blog posts found yet.
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {rows.map((row) => (
        <PostSeoCard key={row.slug} row={row} updateAction={updateAction} />
      ))}
    </ul>
  );
}

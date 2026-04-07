"use client";

import { useActionState } from "react";
import { updateBlogPostAction, deleteBlogPostAction } from "@/app/(protected)/admin/blogs/actions";
import type { BlogPost } from "@/lib/blog/posts";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

type Props = {
  slug: string;
  post: BlogPost;
  showSaved?: boolean;
};

export function EditPostForm({ slug, post, showSaved }: Props) {
  const boundUpdate = async (prev: unknown, formData: FormData) => updateBlogPostAction(slug, prev, formData);
  const [state, action, pending] = useActionState(boundUpdate, null as { error?: string } | null);

  const publishedValue = post.publishedAt.length >= 10 ? post.publishedAt.slice(0, 10) : post.publishedAt;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {showSaved ? (
        <p className="text-sm text-green-700 dark:text-green-400" role="status">
          Saved.
        </p>
      ) : null}
      {state?.error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <form action={action} className="space-y-6">
        <p className="text-sm text-zinc-500">
          Slug: <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{slug}</code> (cannot change)
        </p>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Title</span>
          <input name="title" required defaultValue={post.title} className={inputClass} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Description</span>
          <input name="description" required defaultValue={post.description} className={inputClass} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Publish date</span>
          <input name="publishedAt" type="date" required defaultValue={publishedValue} className={inputClass} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Body (Markdown)</span>
          <textarea name="content" required rows={18} defaultValue={post.content} className={`${inputClass} font-mono text-xs`} />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>

      <form action={deleteBlogPostAction.bind(null, slug)} className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <button
          type="submit"
          className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          formNoValidate
        >
          Delete this post
        </button>
      </form>
    </div>
  );
}

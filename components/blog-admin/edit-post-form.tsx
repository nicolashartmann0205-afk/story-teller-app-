"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { updateBlogPostAction, deleteBlogPostAction } from "@/app/(protected)/admin/blogs/actions";
import type { BlogPost } from "@/lib/blog/posts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

type Props = {
  slug: string;
  post: BlogPost;
  showSaved?: boolean;
  showSeoTab?: boolean;
};

export function EditPostForm({ slug, post, showSaved, showSeoTab = false }: Props) {
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
        <Tabs defaultValue="content" className="w-full">
          <TabsList className={showSeoTab ? "grid h-auto w-full grid-cols-2 gap-1 p-1" : "w-full"}>
            <TabsTrigger value="content" className="w-full">
              Main content
            </TabsTrigger>
            {showSeoTab ? (
              <TabsTrigger
                value="seo"
                className="w-full gap-1.5 bg-blue-50/80 text-blue-900 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-950 dark:bg-blue-950/50 dark:text-blue-100 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-50"
              >
                <Lock className="size-3.5 shrink-0 opacity-80" aria-hidden />
                SEO settings
              </TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent value="content" forceMount className="data-[state=inactive]:hidden">
            <p className="mb-6 text-sm text-zinc-500">
              Slug: <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{slug}</code> (cannot change)
            </p>
            <div className="space-y-6">
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
            </div>
          </TabsContent>

          {showSeoTab ? (
            <TabsContent
              value="seo"
              forceMount
              className="data-[state=inactive]:hidden space-y-4 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30"
            >
              <label className="block space-y-1">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Title tag (SEO title)</span>
                <input
                  name="seoTitle"
                  defaultValue={post.seoTitle ?? ""}
                  placeholder="The headline shown in Google"
                  className={inputClass}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Meta description</span>
                <textarea
                  name="metaDescription"
                  rows={4}
                  defaultValue={post.metaDescription ?? ""}
                  placeholder="Short summary in search results"
                  className={inputClass}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Canonical URL</span>
                <input
                  name="canonicalUrl"
                  defaultValue={post.canonicalUrl ?? ""}
                  placeholder="https://example.com/original-post"
                  className={inputClass}
                />
              </label>
            </TabsContent>
          ) : null}
        </Tabs>
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

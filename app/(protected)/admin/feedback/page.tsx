import Link from "next/link";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { AUTH_ROUTES, withRedirectedFrom } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { feedbackSubmissions } from "@/lib/db/schema";
import { isBlogAdminUser } from "@/lib/blog/admin";
import { buildDynamicPageMetadata } from "@/lib/seo/dynamic-metadata";
import { updateFeedbackStatusAction } from "./actions";

const FEEDBACK_ADMIN_PATH = "/admin/feedback";

export async function generateMetadata() {
  return buildDynamicPageMetadata("feedback-admin", {
    title: "Feedback admin - Story Teller",
    description: "Private admin screen for reviewing and managing feedback submissions.",
    canonicalPath: FEEDBACK_ADMIN_PATH,
  });
}

export default async function FeedbackAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(withRedirectedFrom(AUTH_ROUTES.SIGN_IN, FEEDBACK_ADMIN_PATH));
  }
  if (!isBlogAdminUser(user.id, user.email)) {
    redirect("/dashboard?blogAdmin=denied");
  }

  const rows = await db
    .select()
    .from(feedbackSubmissions)
    .orderBy(desc(feedbackSubmissions.createdAt))
    .limit(200);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Feedback admin</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Review feedback submissions and update status.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No feedback submissions yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">{row.category}</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{row.subject}</p>
                  <p className="text-xs text-zinc-500">
                    {row.email || "No email"} · {row.createdAt.toISOString().replace("T", " ").slice(0, 16)}
                  </p>
                </div>
                <form action={updateFeedbackStatusAction.bind(null, row.id)} className="flex items-center gap-2">
                  <select
                    name="status"
                    defaultValue={row.status}
                    className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <option value="new">new</option>
                    <option value="triaged">triaged</option>
                    <option value="in-progress">in-progress</option>
                    <option value="resolved">resolved</option>
                    <option value="closed">closed</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
                  >
                    Save
                  </button>
                </form>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{row.message}</p>
            </li>
          ))}
        </ul>
      )}

      <p>
        <Link href="/dashboard" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}

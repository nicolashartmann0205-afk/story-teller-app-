import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

async function getStories() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const userStories = await db
    .select()
    .from(stories)
    .where(eq(stories.userId, user.id))
    .orderBy(desc(stories.createdAt));

  return { stories: userStories };
}

export default async function StoriesPage() {
  const { stories } = await getStories();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/auth/sign-in");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
              My Stories
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Welcome back, {user?.email}
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/stories/new"
              className="rounded-md bg-black dark:bg-zinc-50 px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              Create Story
            </Link>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {stories.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              You haven't created any stories yet.
            </p>
            <Link
              href="/stories/new"
              className="mt-4 inline-block rounded-md bg-black dark:bg-zinc-50 px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              Create your first story
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story: { id: string; title: string; description: string | null; createdAt: Date | string }) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-black dark:text-zinc-50 group-hover:underline">
                  {story.title}
                </h3>
                {story.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {story.description}
                  </p>
                )}
                <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
                  {new Date(story.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


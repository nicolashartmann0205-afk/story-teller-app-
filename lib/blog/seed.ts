import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { count } from "drizzle-orm";
import { STATIC_SEED_POSTS } from "./posts";

/** Inserts `STATIC_SEED_POSTS` when the table is empty (idempotent). No-ops if the table is missing (run migrations). */
export async function ensureBlogSeeded(): Promise<void> {
  try {
    const [row] = await db.select({ c: count() }).from(blogPosts);
    if (Number(row?.c ?? 0) > 0) return;

    await db.insert(blogPosts).values(
      STATIC_SEED_POSTS.map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        content: p.content,
        publishedAt: new Date(`${p.publishedAt}T12:00:00.000Z`),
      })),
    );
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[blog] Database unavailable or blog_posts missing; using static fallback until you run migrations.",
        e instanceof Error ? e.message : e,
      );
    }
  }
}

import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import type { BlogPost } from "./posts";
import { STATIC_SEED_POSTS } from "./posts";
import { ensureBlogSeeded } from "./seed";

function staticPostsSorted(): BlogPost[] {
  return [...STATIC_SEED_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

function rowToPost(row: typeof blogPosts.$inferSelect): BlogPost {
  const d = row.publishedAt;
  const iso =
    d instanceof Date
      ? d.toISOString().slice(0, 10)
      : String(d).slice(0, 10);
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    seoTitle: row.seoTitle,
    metaDescription: row.metaDescription,
    canonicalUrl: row.canonicalUrl,
    content: row.content,
    publishedAt: iso,
  };
}

export async function getAllPostsFromDb(): Promise<BlogPost[]> {
  try {
    await ensureBlogSeeded();
    const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
    return rows.map(rowToPost);
  } catch {
    return staticPostsSorted();
  }
}

export async function getPostBySlugFromDb(slug: string): Promise<BlogPost | undefined> {
  try {
    await ensureBlogSeeded();
    const [row] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    return row ? rowToPost(row) : undefined;
  } catch {
    return staticPostsSorted().find((p) => p.slug === slug);
  }
}

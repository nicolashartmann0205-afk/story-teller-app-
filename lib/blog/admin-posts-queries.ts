import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { withPostgresOrSupabase } from "@/lib/db/postgres-or-supabase";
import {
  listBlogPostsAdminViaSupabase,
  type BlogPostAdminRow,
} from "@/lib/db/supabase-fallback";

async function loadViaPostgres(): Promise<BlogPostAdminRow[]> {
  const rows = await db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      description: blogPosts.description,
      publishedAt: blogPosts.publishedAt,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.publishedAt));

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    publishedAt: row.publishedAt,
  }));
}

export async function listBlogPostsForAdmin(): Promise<BlogPostAdminRow[]> {
  return withPostgresOrSupabase(loadViaPostgres, listBlogPostsAdminViaSupabase);
}

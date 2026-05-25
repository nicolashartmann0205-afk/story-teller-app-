import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { withPostgresOrSupabase } from "@/lib/db/postgres-or-supabase";
import {
  listBlogPostSeoRowsViaSupabase,
  updateBlogPostSeoViaSupabase,
  type BlogPostSeoRow,
} from "@/lib/db/supabase-fallback";

async function listViaPostgres(): Promise<BlogPostSeoRow[]> {
  const rows = await db
    .select({
      slug: blogPosts.slug,
      title: blogPosts.title,
      seoTitle: blogPosts.seoTitle,
      metaDescription: blogPosts.metaDescription,
      canonicalUrl: blogPosts.canonicalUrl,
      updatedAt: blogPosts.updatedAt,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.publishedAt));

  return rows;
}

export async function listBlogPostSeoRows(): Promise<BlogPostSeoRow[]> {
  return withPostgresOrSupabase(listViaPostgres, listBlogPostSeoRowsViaSupabase);
}

export async function updateBlogPostSeo(
  slug: string,
  fields: { seoTitle: string | null; metaDescription: string | null; canonicalUrl: string | null }
): Promise<boolean> {
  return withPostgresOrSupabase(
    async () => {
      const [updated] = await db
        .update(blogPosts)
        .set({
          seoTitle: fields.seoTitle,
          metaDescription: fields.metaDescription,
          canonicalUrl: fields.canonicalUrl,
          updatedAt: new Date(),
        })
        .where(eq(blogPosts.slug, slug))
        .returning({ slug: blogPosts.slug });

      return Boolean(updated);
    },
    () => updateBlogPostSeoViaSupabase(slug, fields)
  );
}

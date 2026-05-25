import { desc, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { db } from "@/lib/db";
import { withPostgresOrSupabase } from "@/lib/db/postgres-or-supabase";
import { blogPosts } from "@/lib/db/schema";

export type BlogPostSeoRow = {
  slug: string;
  title: string;
  seoTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  updatedAt: Date;
};

async function listBlogPostSeoViaPostgres(): Promise<BlogPostSeoRow[]> {
  return db
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
}

async function listBlogPostSeoViaSupabase(): Promise<BlogPostSeoRow[]> {
  const supabase = await createClient();
  const fullSelect =
    "slug, title, seo_title, meta_description, canonical_url, updated_at, published_at";
  let { data, error } = await supabase
    .from("blog_posts")
    .select(fullSelect)
    .order("published_at", { ascending: false });

  if (error && /seo_title|meta_description|canonical_url|column/i.test(error.message)) {
    const fallback = await supabase
      .from("blog_posts")
      .select("slug, title, updated_at, published_at")
      .order("published_at", { ascending: false });
    data = fallback.data?.map((row) => ({
      ...row,
      seo_title: null,
      meta_description: null,
      canonical_url: null,
    })) as typeof data;
    error = fallback.error;
  }

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    slug: row.slug,
    title: row.title,
    seoTitle: row.seo_title ?? null,
    metaDescription: row.meta_description ?? null,
    canonicalUrl: row.canonical_url ?? null,
    updatedAt: new Date(row.updated_at),
  }));
}

export async function listBlogPostSeoRows(): Promise<BlogPostSeoRow[]> {
  return withPostgresOrSupabase(listBlogPostSeoViaPostgres, listBlogPostSeoViaSupabase);
}

async function updateBlogPostSeoViaPostgres(
  slug: string,
  fields: { seoTitle: string | null; metaDescription: string | null; canonicalUrl: string | null }
): Promise<boolean> {
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
}

async function updateBlogPostSeoViaSupabase(
  slug: string,
  fields: { seoTitle: string | null; metaDescription: string | null; canonicalUrl: string | null }
): Promise<boolean> {
  const service = getServiceRoleClient();
  const supabase = service ?? (await createClient());
  const { data, error } = await supabase
    .from("blog_posts")
    .update({
      seo_title: fields.seoTitle,
      meta_description: fields.metaDescription,
      canonical_url: fields.canonicalUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug)
    .select("slug")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function updateBlogPostSeo(
  slug: string,
  fields: { seoTitle: string | null; metaDescription: string | null; canonicalUrl: string | null }
): Promise<boolean> {
  return withPostgresOrSupabase(
    () => updateBlogPostSeoViaPostgres(slug, fields),
    () => updateBlogPostSeoViaSupabase(slug, fields)
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { BLOG_ADMIN_ACCESS_DENIED_PATH, BLOG_ADMIN_BASE_PATH, isBlogAdminUser } from "@/lib/blog/admin";
import { eq } from "drizzle-orm";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function requireBlogAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/sign-in");
  }
  if (!isBlogAdminUser(user.id)) {
    redirect(BLOG_ADMIN_ACCESS_DENIED_PATH);
  }
  return user;
}

export async function createBlogPostAction(_prev: unknown, formData: FormData) {
  const user = await requireBlogAdmin();

  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const publishedAtRaw = String(formData.get("publishedAt") ?? "").trim();

  if (!slug || !SLUG_RE.test(slug)) {
    return { error: "Slug must be lowercase letters, numbers, and hyphens only." };
  }
  if (!title) return { error: "Title is required." };
  if (!publishedAtRaw) return { error: "Publish date is required." };

  const publishedAt = new Date(publishedAtRaw);
  if (Number.isNaN(publishedAt.getTime())) {
    return { error: "Invalid publish date." };
  }

  try {
    await db.insert(blogPosts).values({
      slug,
      title,
      description,
      content,
      publishedAt,
      authorId: user.id,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not create post.";
    if (String(msg).includes("unique") || String(msg).includes("duplicate")) {
      return { error: "A post with this slug already exists." };
    }
    return { error: msg };
  }

  revalidatePath("/blog");
  revalidatePath("/blogs");
  revalidatePath(BLOG_ADMIN_BASE_PATH);
  revalidatePath(`/blog/${slug}`);
  redirect(`${BLOG_ADMIN_BASE_PATH}/${slug}/edit`);
}

export async function updateBlogPostAction(slug: string, _prev: unknown, formData: FormData) {
  await requireBlogAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const publishedAtRaw = String(formData.get("publishedAt") ?? "").trim();

  if (!title) return { error: "Title is required." };
  if (!publishedAtRaw) return { error: "Publish date is required." };

  const publishedAt = new Date(publishedAtRaw);
  if (Number.isNaN(publishedAt.getTime())) {
    return { error: "Invalid publish date." };
  }

  const [updated] = await db
    .update(blogPosts)
    .set({
      title,
      description,
      content,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.slug, slug))
    .returning({ id: blogPosts.id });

  if (!updated) {
    return { error: "Post not found." };
  }

  revalidatePath("/blog");
  revalidatePath("/blogs");
  revalidatePath(BLOG_ADMIN_BASE_PATH);
  revalidatePath(`/blog/${slug}`);
  redirect(`${BLOG_ADMIN_BASE_PATH}/${slug}/edit?saved=1`);
}

export async function deleteBlogPostAction(slug: string, _formData?: FormData) {
  await requireBlogAdmin();

  await db.delete(blogPosts).where(eq(blogPosts.slug, slug));

  revalidatePath("/blog");
  revalidatePath("/blogs");
  revalidatePath(BLOG_ADMIN_BASE_PATH);
  revalidatePath(`/blog/${slug}`);
  redirect(BLOG_ADMIN_BASE_PATH);
}

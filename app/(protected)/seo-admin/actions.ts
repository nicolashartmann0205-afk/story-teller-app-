"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SEO_ADMIN_PATH = "/seo-admin";
const SEO_ADMIN_EMAIL = "nicolas@hartmanns.net";

type ActionState = { error?: string; success?: string } | null;

async function requireSeoAdminEmail() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== SEO_ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }
}

export async function updateBlogSeoAction(slug: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireSeoAdminEmail();

  const seoTitle = String(formData.get("seoTitle") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  const canonicalUrl = String(formData.get("canonicalUrl") ?? "").trim();

  const [updated] = await db
    .update(blogPosts)
    .set({
      seoTitle: seoTitle || null,
      metaDescription: metaDescription || null,
      canonicalUrl: canonicalUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.slug, slug))
    .returning({ slug: blogPosts.slug });

  if (!updated) {
    return { error: "Post not found." };
  }

  revalidatePath(SEO_ADMIN_PATH);
  revalidatePath("/blogs");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);

  return { success: "SEO fields saved." };
}

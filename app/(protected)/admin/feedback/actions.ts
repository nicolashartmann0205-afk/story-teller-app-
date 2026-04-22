"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { AUTH_ROUTES, withRedirectedFrom } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { feedbackSubmissions } from "@/lib/db/schema";
import { isBlogAdminUser } from "@/lib/blog/admin";

const FEEDBACK_ADMIN_PATH = "/admin/feedback";

async function requireFeedbackAdmin() {
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
  return user;
}

export async function updateFeedbackStatusAction(
  id: string,
  formData: FormData
) {
  await requireFeedbackAdmin();
  const status = String(formData.get("status") ?? "").trim();
  if (!status) {
    return;
  }

  await db
    .update(feedbackSubmissions)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(feedbackSubmissions.id, id));

  revalidatePath(FEEDBACK_ADMIN_PATH);
}

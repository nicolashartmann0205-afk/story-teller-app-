"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AUTH_ROUTES, withRedirectedFrom } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import { updateFeedbackStatus } from "@/lib/admin/feedback-queries";
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

export async function updateFeedbackStatusAction(formData: FormData) {
  await requireFeedbackAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!id || !status) {
    return;
  }

  await updateFeedbackStatus(id, status);

  revalidatePath(FEEDBACK_ADMIN_PATH);
}

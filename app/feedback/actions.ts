"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { feedbackSubmissions } from "@/lib/db/schema";

export type FeedbackFormState = {
  success?: string;
  error?: string;
};

export async function submitFeedbackAction(
  _prev: FeedbackFormState | null | void,
  formData: FormData
): Promise<FeedbackFormState> {
  const category = String(formData.get("category") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const emailInput = String(formData.get("email") ?? "").trim();
  const sourcePath = String(formData.get("sourcePath") ?? "/feedback").trim();

  if (!category) return { error: "Category is required." };
  if (!subject) return { error: "Subject is required." };
  if (!message) return { error: "Message is required." };
  if (subject.length > 180) return { error: "Subject is too long." };
  if (message.length > 5000) return { error: "Message is too long." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fallbackEmail = user?.email || null;
  const email = emailInput || fallbackEmail;

  await db.insert(feedbackSubmissions).values({
    submittedBy: user?.id || null,
    email,
    category,
    subject,
    message,
    status: "new",
    metadata: {
      sourcePath,
      userAgent: "web",
    },
    updatedAt: new Date(),
  });

  return {
    success: "Thanks! Your feedback was submitted successfully.",
  };
}

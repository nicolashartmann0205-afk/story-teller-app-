import { desc, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { withPostgresOrSupabase } from "@/lib/db/postgres-or-supabase";
import { feedbackSubmissions } from "@/lib/db/schema";

export type FeedbackSubmissionRow = typeof feedbackSubmissions.$inferSelect;

async function listFeedbackViaPostgres(): Promise<FeedbackSubmissionRow[]> {
  return db
    .select()
    .from(feedbackSubmissions)
    .orderBy(desc(feedbackSubmissions.createdAt))
    .limit(200);
}

async function listFeedbackViaSupabase(): Promise<FeedbackSubmissionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback_submissions")
    .select(
      "id, submitted_by, email, category, subject, message, status, metadata, created_at, updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    submittedBy: row.submitted_by,
    email: row.email,
    category: row.category,
    subject: row.subject,
    message: row.message,
    status: row.status,
    metadata: row.metadata ?? {},
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
}

export async function listFeedbackSubmissions(): Promise<FeedbackSubmissionRow[]> {
  return withPostgresOrSupabase(listFeedbackViaPostgres, listFeedbackViaSupabase);
}

async function updateFeedbackStatusViaPostgres(id: string, status: string): Promise<void> {
  await db
    .update(feedbackSubmissions)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(feedbackSubmissions.id, id));
}

async function updateFeedbackStatusViaSupabase(id: string, status: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("feedback_submissions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateFeedbackStatus(id: string, status: string): Promise<void> {
  return withPostgresOrSupabase(
    () => updateFeedbackStatusViaPostgres(id, status),
    () => updateFeedbackStatusViaSupabase(id, status)
  );
}

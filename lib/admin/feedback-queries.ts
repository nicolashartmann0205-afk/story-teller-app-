import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { feedbackSubmissions } from "@/lib/db/schema";
import { withPostgresOrSupabase } from "@/lib/db/postgres-or-supabase";
import {
  listFeedbackSubmissionsViaSupabase,
  updateFeedbackStatusViaSupabase,
  type FeedbackSubmissionRow,
} from "@/lib/db/supabase-fallback";

async function listViaPostgres(): Promise<FeedbackSubmissionRow[]> {
  const rows = await db
    .select({
      id: feedbackSubmissions.id,
      email: feedbackSubmissions.email,
      category: feedbackSubmissions.category,
      subject: feedbackSubmissions.subject,
      message: feedbackSubmissions.message,
      status: feedbackSubmissions.status,
      createdAt: feedbackSubmissions.createdAt,
    })
    .from(feedbackSubmissions)
    .orderBy(desc(feedbackSubmissions.createdAt));

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    category: row.category,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt,
  }));
}

export async function listFeedbackSubmissions(): Promise<FeedbackSubmissionRow[]> {
  return withPostgresOrSupabase(listViaPostgres, listFeedbackSubmissionsViaSupabase);
}

export async function updateFeedbackStatus(id: string, status: string): Promise<void> {
  return withPostgresOrSupabase(
    async () => {
      await db
        .update(feedbackSubmissions)
        .set({ status, updatedAt: new Date() })
        .where(eq(feedbackSubmissions.id, id));
    },
    () => updateFeedbackStatusViaSupabase(id, status)
  );
}

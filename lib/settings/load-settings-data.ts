import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { creditTransactions, users } from "@/lib/db/schema";
import { withPostgresOrSupabase } from "@/lib/db/postgres-or-supabase";
import {
  getRecentCreditTransactionsViaSupabase,
  getUserProfileViaSupabase,
  type CreditTransactionRow,
  type UserProfileRow,
} from "@/lib/db/supabase-fallback";

export type SettingsPageData = {
  profile: UserProfileRow | null;
  recentCreditTransactions: CreditTransactionRow[];
};

async function loadViaPostgres(userId: string): Promise<SettingsPageData> {
  const [userProfile] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const recentCreditTransactions = await db
    .select({
      id: creditTransactions.id,
      type: creditTransactions.type,
      amount: creditTransactions.amount,
      reason: creditTransactions.reason,
      createdAt: creditTransactions.createdAt,
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(8);

  return {
    profile: userProfile
      ? {
          id: userProfile.id,
          email: userProfile.email,
          displayName: userProfile.displayName,
          avatarUrl: userProfile.avatarUrl,
          bio: userProfile.bio,
          preferences: userProfile.preferences,
          analytics: userProfile.analytics,
          createdAt: userProfile.createdAt,
          updatedAt: userProfile.updatedAt,
        }
      : null,
    recentCreditTransactions: recentCreditTransactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      reason: tx.reason,
      createdAt: tx.createdAt,
    })),
  };
}

async function loadViaSupabase(userId: string): Promise<SettingsPageData> {
  const [profile, recentCreditTransactions] = await Promise.all([
    getUserProfileViaSupabase(userId),
    getRecentCreditTransactionsViaSupabase(userId),
  ]);

  return { profile, recentCreditTransactions };
}

export async function loadSettingsPageData(userId: string): Promise<SettingsPageData> {
  return withPostgresOrSupabase(
    () => loadViaPostgres(userId),
    () => loadViaSupabase(userId)
  );
}

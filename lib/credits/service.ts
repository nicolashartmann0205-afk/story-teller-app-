import { and, eq, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { creditTransactions, userCredits } from "@/lib/db/schema";

/** Daily AI generation allowance (stored in `monthly_free_quota` column for v1 schema). */
export const DAILY_FREE_QUOTA = 140;

/** Credits spent per AI generation (draft, suggestion, outline, etc.). */
export const CREDITS_PER_AI_USE = 10;

export const INSUFFICIENT_CREDITS_CODE = "INSUFFICIENT_CREDITS";
export const INSUFFICIENT_CREDITS_MESSAGE =
  "You do not have enough credits. Please try again tomorrow.";

export type CreditConsumeReason =
  | "story_generate"
  | "story_draft_generate"
  | "scene_generate"
  | "archetype_suggest"
  | "hook_preview"
  | "structure_beat_draft"
  | "structure_outline"
  | "structure_recommend"
  | "map_analyze";

type EnsureCreditRowInput = {
  userId: string;
};

type ConsumeCreditInput = {
  userId: string;
  reason: CreditConsumeReason;
  requestId?: string;
  metadata?: Record<string, unknown>;
};

export type ConsumeCreditResult =
  | { ok: true; balance: number; alreadyConsumed?: boolean }
  | { ok: false; code: typeof INSUFFICIENT_CREDITS_CODE; message: string; balance: number };

function startOfCurrentUtcDay(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

async function ensureCreditRow({ userId }: EnsureCreditRowInput) {
  await db
    .insert(userCredits)
    .values({
      userId,
      balance: DAILY_FREE_QUOTA,
      monthlyFreeQuota: DAILY_FREE_QUOTA,
      monthlyUsed: 0,
      periodStart: startOfCurrentUtcDay(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();
}

/** Reset balance to the daily quota when a new UTC day starts. */
async function applyDailyRefill(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], userId: string) {
  const dayStart = startOfCurrentUtcDay();

  const [refilled] = await tx
    .update(userCredits)
    .set({
      balance: userCredits.monthlyFreeQuota,
      monthlyUsed: 0,
      periodStart: dayStart,
      updatedAt: new Date(),
    })
    .where(and(eq(userCredits.userId, userId), lt(userCredits.periodStart, dayStart)))
    .returning({
      dailyQuota: userCredits.monthlyFreeQuota,
    });

  if (refilled) {
    await tx.insert(creditTransactions).values({
      userId,
      type: "refill",
      amount: refilled.dailyQuota,
      reason: "daily_refill",
      metadata: { periodStart: dayStart.toISOString() },
    });
  }
}

export async function getUserCreditBalance(userId: string): Promise<number> {
  await ensureCreditRow({ userId });

  return db.transaction(async (tx) => {
    await applyDailyRefill(tx, userId);
    const [row] = await tx
      .select({ balance: userCredits.balance })
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);
    return row?.balance ?? 0;
  });
}

export async function consumeCredit(input: ConsumeCreditInput): Promise<ConsumeCreditResult> {
  const { userId, reason, requestId, metadata } = input;
  await ensureCreditRow({ userId });

  try {
    return await db.transaction(async (tx) => {
      await applyDailyRefill(tx, userId);

      if (requestId) {
        const [existing] = await tx
          .select({ id: creditTransactions.id })
          .from(creditTransactions)
          .where(
            and(
              eq(creditTransactions.userId, userId),
              eq(creditTransactions.requestId, requestId),
              eq(creditTransactions.type, "debit")
            )
          )
          .limit(1);

        if (existing) {
          const [balanceRow] = await tx
            .select({ balance: userCredits.balance })
            .from(userCredits)
            .where(eq(userCredits.userId, userId))
            .limit(1);
          return { ok: true, balance: balanceRow?.balance ?? 0, alreadyConsumed: true };
        }
      }

      const [debitResult] = await tx
        .update(userCredits)
        .set({
          balance: sql`${userCredits.balance} - ${CREDITS_PER_AI_USE}`,
          monthlyUsed: sql`${userCredits.monthlyUsed} + ${CREDITS_PER_AI_USE}`,
          updatedAt: new Date(),
        })
        .where(
          and(eq(userCredits.userId, userId), sql`${userCredits.balance} >= ${CREDITS_PER_AI_USE}`)
        )
        .returning({ balance: userCredits.balance });

      if (!debitResult) {
        const [balanceRow] = await tx
          .select({ balance: userCredits.balance })
          .from(userCredits)
          .where(eq(userCredits.userId, userId))
          .limit(1);
        return {
          ok: false,
          code: INSUFFICIENT_CREDITS_CODE,
          message: INSUFFICIENT_CREDITS_MESSAGE,
          balance: balanceRow?.balance ?? 0,
        };
      }

      await tx.insert(creditTransactions).values({
        userId,
        type: "debit",
        amount: -CREDITS_PER_AI_USE,
        reason,
        requestId: requestId ?? null,
        metadata: metadata ?? {},
      });

      return { ok: true, balance: debitResult.balance };
    });
  } catch (error) {
    if (requestId && error instanceof Error && /credit_transactions_request_id_unique/i.test(error.message)) {
      const balance = await getUserCreditBalance(userId);
      return { ok: true, balance, alreadyConsumed: true };
    }
    throw error;
  }
}

export async function adminGrantCredits(
  userId: string,
  amount: number,
  reason = "admin_grant"
): Promise<number> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Credit grant amount must be a positive integer");
  }

  await ensureCreditRow({ userId });

  return db.transaction(async (tx) => {
    await applyDailyRefill(tx, userId);

    const [updated] = await tx
      .update(userCredits)
      .set({
        balance: sql`${userCredits.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId))
      .returning({ balance: userCredits.balance });

    await tx.insert(creditTransactions).values({
      userId,
      type: "admin_grant",
      amount,
      reason,
      metadata: {},
    });

    return updated?.balance ?? 0;
  });
}

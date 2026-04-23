import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { creditTransactions, userCredits } from "@/lib/db/schema";

const DEFAULT_MONTHLY_FREE_QUOTA = 20;
export const INSUFFICIENT_CREDITS_CODE = "INSUFFICIENT_CREDITS";
export const INSUFFICIENT_CREDITS_MESSAGE =
  "No credits left. Please wait for monthly refill or contact support for a top-up.";

export type CreditConsumeReason =
  | "story_generate"
  | "story_draft_generate"
  | "scene_generate";

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

function startOfCurrentUtcMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
}

async function ensureCreditRow({ userId }: EnsureCreditRowInput) {
  await db
    .insert(userCredits)
    .values({
      userId,
      balance: DEFAULT_MONTHLY_FREE_QUOTA,
      monthlyFreeQuota: DEFAULT_MONTHLY_FREE_QUOTA,
      monthlyUsed: 0,
      periodStart: startOfCurrentUtcMonth(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();
}

async function applyMonthlyRefill(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], userId: string) {
  const monthStart = startOfCurrentUtcMonth();

  const [refilled] = await tx
    .update(userCredits)
    .set({
      balance: sql`${userCredits.balance} + ${userCredits.monthlyFreeQuota}`,
      monthlyUsed: 0,
      periodStart: monthStart,
      updatedAt: new Date(),
    })
    .where(and(eq(userCredits.userId, userId), lt(userCredits.periodStart, monthStart)))
    .returning({
      monthlyFreeQuota: userCredits.monthlyFreeQuota,
    });

  if (refilled) {
    await tx.insert(creditTransactions).values({
      userId,
      type: "refill",
      amount: refilled.monthlyFreeQuota,
      reason: "monthly_refill",
      metadata: { periodStart: monthStart.toISOString() },
    });
  }
}

export async function getUserCreditBalance(userId: string): Promise<number> {
  await ensureCreditRow({ userId });

  return db.transaction(async (tx) => {
    await applyMonthlyRefill(tx, userId);
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
      await applyMonthlyRefill(tx, userId);

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
          balance: sql`${userCredits.balance} - 1`,
          monthlyUsed: sql`${userCredits.monthlyUsed} + 1`,
          updatedAt: new Date(),
        })
        .where(and(eq(userCredits.userId, userId), gte(userCredits.balance, 1)))
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
        amount: -1,
        reason,
        requestId: requestId ?? null,
        metadata: metadata ?? {},
      });

      return { ok: true, balance: debitResult.balance };
    });
  } catch (error) {
    // Unique request_id collision means the debit already happened in another concurrent attempt.
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
    await applyMonthlyRefill(tx, userId);

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

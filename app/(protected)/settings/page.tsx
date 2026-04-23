import Link from "next/link";
import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import { SeoReferenceTabs } from "@/components/settings/seo-reference-tabs";
import { getAppUrl } from "@/lib/config/env";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_PAGE_TITLE,
  SITE_NAME,
  TITLE_TEMPLATE,
  selfReferencingCanonical,
} from "@/lib/seo/site-metadata";
import { db } from "@/lib/db";
import { creditTransactions, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import ProfileForm from "./profile-form";
import {
  adminGrantCredits,
  getUserCreditBalance,
} from "@/lib/credits/service";
import { isBlogAdminUser } from "@/lib/blog/admin";
import { revalidatePath } from "next/cache";
import AdminGrantCreditsForm from "./admin-grant-credits-form";

export const metadata = selfReferencingCanonical("/settings");

async function updateProfileAction(previousState: { error?: string; success?: string } | null | void, formData: FormData) {
  "use server";

  const displayName = formData.get("displayName") as string;
  const bio = formData.get("bio") as string;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    await db.update(users)
      .set({
        displayName,
        bio,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return { success: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }
}

type GrantCreditsState = { error?: string; success?: string } | null;

async function grantCreditsAction(
  previousState: GrantCreditsState,
  formData: FormData
): Promise<GrantCreditsState> {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isBlogAdminUser(user.id, user.email)) {
    return { error: "Unauthorized" };
  }

  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  const amount = Number.parseInt(String(formData.get("amount") ?? "0"), 10);
  const reason = String(formData.get("reason") ?? "admin_grant").trim() || "admin_grant";

  if (!targetUserId) {
    return { error: "Target user ID is required." };
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    return { error: "Amount must be a positive integer." };
  }

  try {
    const balance = await adminGrantCredits(targetUserId, amount, reason);
    revalidatePath("/settings");
    return { success: `Granted ${amount} credits. New balance: ${balance}.` };
  } catch (error) {
    console.error("Error granting credits:", error);
    return { error: error instanceof Error ? error.message : "Failed to grant credits." };
  }
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(AUTH_ROUTES.SIGN_IN);
  }

  // Fetch user profile from DB
  const [userProfile] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  const creditBalance = await getUserCreditBalance(user.id);
  const recentCreditTransactions = await db
    .select({
      id: creditTransactions.id,
      type: creditTransactions.type,
      amount: creditTransactions.amount,
      reason: creditTransactions.reason,
      createdAt: creditTransactions.createdAt,
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, user.id))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(8);
  const canGrantCredits = isBlogAdminUser(user.id, user.email);

  const metadataBaseUrl = getAppUrl().replace(/\/$/, "") || "http://localhost:3000";

  // If profile doesn't exist in public table yet (e.g. old user), create it or just use auth data
  // For now, we'll assume we can display what we have. 
  // In a real sync scenario, we'd want to ensure the record exists.
  // Let's handle the null case gracefully in the form.

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-brand-ink py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
           <Link
             href="/dashboard"
             className="text-sm text-brand-ink/85 dark:text-brand-seafoam hover:text-brand-teal dark:hover:text-brand-yellow"
           >
             ← Back to Dashboard
           </Link>
        </div>
        <div className="bg-white dark:bg-brand-ink/80 shadow rounded-lg overflow-hidden border border-brand-seafoam/30">
          <div className="px-4 py-5 sm:px-6 border-b border-brand-seafoam/30">
            <h3 className="text-lg font-medium leading-6 text-brand-ink dark:text-brand-yellow">
              Profile Settings
            </h3>
            <p className="mt-1 text-sm text-brand-ink/80 dark:text-brand-seafoam">
              Manage your public profile and account settings.
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <ProfileForm 
              user={user} 
              profile={userProfile} 
              updateProfileAction={updateProfileAction} 
            />
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-brand-ink/80 shadow rounded-lg overflow-hidden border border-brand-seafoam/30">
          <div className="px-4 py-5 sm:px-6 border-b border-brand-seafoam/30">
            <h3 className="text-lg font-medium leading-6 text-brand-ink dark:text-brand-yellow">AI credits</h3>
            <p className="mt-1 text-sm text-brand-ink/80 dark:text-brand-seafoam">
              Your generation balance and latest credit activity.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-4">
            <div className="rounded-md border border-brand-seafoam/40 px-4 py-3 bg-brand-cream/50 dark:bg-brand-ink/70">
              <p className="text-xs uppercase tracking-wide text-brand-ink/80 dark:text-brand-seafoam">Current balance</p>
              <p className="mt-1 text-2xl font-semibold text-brand-ink dark:text-brand-yellow">{creditBalance}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-brand-ink dark:text-brand-seafoam mb-2">Recent transactions</h4>
              {recentCreditTransactions.length === 0 ? (
                <p className="text-sm text-brand-ink/80 dark:text-brand-seafoam">No credit transactions yet.</p>
              ) : (
                <div className="divide-y divide-brand-seafoam/30 rounded-md border border-brand-seafoam/30">
                  {recentCreditTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium text-brand-ink dark:text-brand-seafoam">
                          {tx.reason.replaceAll("_", " ")}
                        </p>
                        <p className="text-xs text-brand-ink/80 dark:text-brand-seafoam">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "Unknown date"}
                        </p>
                      </div>
                      <span
                        className={`ml-3 font-semibold ${
                          tx.amount >= 0 ? "text-brand-teal dark:text-brand-yellow" : "text-brand-ink dark:text-brand-seafoam"
                        }`}
                      >
                        {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {canGrantCredits ? (
          <div className="mt-8 bg-white dark:bg-brand-ink/80 shadow rounded-lg overflow-hidden border border-brand-seafoam/30">
            <div className="px-4 py-5 sm:px-6 border-b border-brand-seafoam/30">
              <h3 className="text-lg font-medium leading-6 text-brand-ink dark:text-brand-yellow">
                Admin: Grant credits
              </h3>
              <p className="mt-1 text-sm text-brand-ink/80 dark:text-brand-seafoam">
                Temporary support tool to manually top up user credits.
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <AdminGrantCreditsForm grantCreditsAction={grantCreditsAction} />
            </div>
          </div>
        ) : null}

        <div className="mt-8 bg-white dark:bg-brand-ink/80 shadow rounded-lg overflow-hidden border border-brand-seafoam/30">
          <div className="px-4 py-5 sm:px-6 border-b border-brand-seafoam/30">
            <h3 className="text-lg font-medium leading-6 text-brand-ink dark:text-brand-yellow">SEO reference</h3>
            <p className="mt-1 text-sm text-brand-ink/80 dark:text-brand-seafoam">
              Read-only values your site uses for title, meta description, and canonical URLs. Changes require editing
              code or deployment configuration.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <SeoReferenceTabs
              siteName={SITE_NAME}
              titleTemplate={TITLE_TEMPLATE}
              defaultPageTitle={DEFAULT_PAGE_TITLE}
              defaultDescription={DEFAULT_DESCRIPTION}
              metadataBaseUrl={metadataBaseUrl}
              exampleCanonicalPaths={[
                { path: "/", label: "Home" },
                { path: "/blogs", label: "Blogs index" },
                { path: "/blog/your-post-slug", label: "Example blog post (replace slug)" },
                { path: AUTH_ROUTES.SIGN_IN, label: "Sign in (robots noindex)" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


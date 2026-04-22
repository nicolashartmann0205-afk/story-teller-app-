import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { buildDynamicPageMetadata } from "@/lib/seo/dynamic-metadata";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { supportMessages, supportSessions } from "@/lib/db/schema";
import { SupportAgentClient } from "./support-agent-client";
import type { SupportAgentState } from "./actions";

export async function generateMetadata() {
  return buildDynamicPageMetadata("support-agent", {
    title: "IT support agent - Story Teller",
    description:
      "Signed-in troubleshooting assistant for login issues, browser errors, connectivity problems, and technical support.",
    canonicalPath: "/support-agent",
  });
}

export default async function SupportAgentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?redirectedFrom=%2Fsupport-agent");
  }

  const [latestSession] = await db
    .select()
    .from(supportSessions)
    .where(eq(supportSessions.userId, user.id))
    .orderBy(desc(supportSessions.updatedAt))
    .limit(1);

  let initialState: SupportAgentState = { messages: [] };

  if (latestSession) {
    const messages = await db
      .select()
      .from(supportMessages)
      .where(eq(supportMessages.sessionId, latestSession.id))
      .orderBy(asc(supportMessages.createdAt));

    initialState = {
      sessionId: latestSession.id,
      messages: messages.map((m) => ({
        id: m.id,
        role: (m.role as "user" | "assistant" | "system") || "assistant",
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">IT support agent</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Get guided troubleshooting for sign-in, browser, extension, and connectivity issues.
          </p>
        </div>

        <SupportAgentClient initialState={initialState} />

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Product ideas instead of troubleshooting?{" "}
          <Link href="/feedback" className="underline underline-offset-2">
            Submit feedback
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

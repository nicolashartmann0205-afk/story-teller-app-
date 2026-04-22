"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { and, asc, desc, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { supportMessages, supportSessions } from "@/lib/db/schema";

const apiKey = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.GEMINI_SUPPORT_MODEL || "gemini-2.0-flash-exp";

type Role = "user" | "assistant" | "system";

export type SupportMessageView = {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
};

export type SupportAgentState = {
  sessionId?: string;
  messages: SupportMessageView[];
  error?: string;
};

async function getOptionalUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function ensureSession(userId: string, requestedSessionId?: string | null) {
  const trimmed = requestedSessionId?.trim();
  if (trimmed) {
    const [session] = await db
      .select()
      .from(supportSessions)
      .where(and(eq(supportSessions.id, trimmed), eq(supportSessions.userId, userId)))
      .limit(1);
    if (session) return session.id;
  }

  const [latest] = await db
    .select()
    .from(supportSessions)
    .where(eq(supportSessions.userId, userId))
    .orderBy(desc(supportSessions.updatedAt))
    .limit(1);
  if (latest) return latest.id;

  const [created] = await db
    .insert(supportSessions)
    .values({
      userId,
      title: "IT support session",
      status: "open",
      updatedAt: new Date(),
    })
    .returning({ id: supportSessions.id });
  return created.id;
}

async function buildAssistantReply(messages: Array<{ role: Role; content: string }>) {
  if (!apiKey) {
    return "I can still help with manual troubleshooting, but the AI provider is not configured right now. Please share your browser, device, and exact error text.";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const history = messages
    .slice(-12)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const prompt = `You are Story Teller's IT support assistant.
Give practical, short troubleshooting steps.
Prioritize login/auth, browser compatibility, cookies, extensions, and network issues.
Ask for one key missing detail when needed.
Do not invent account data or claim server actions were completed unless user confirms.

Conversation:
${history}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

export async function sendSupportMessageAction(
  prev: SupportAgentState | null | void,
  formData: FormData
): Promise<SupportAgentState> {
  try {
    const user = await getOptionalUser();
    const rawMessage = String(formData.get("message") ?? "").trim();
    if (!rawMessage) {
      return {
        sessionId: prev?.sessionId,
        messages: prev?.messages || [],
        error: "Please enter a message first.",
      };
    }
    if (rawMessage.length > 4000) {
      return {
        sessionId: prev?.sessionId,
        messages: prev?.messages || [],
        error: "Message is too long. Please keep it under 4000 characters.",
      };
    }

    if (!user) {
      const syntheticHistory = [
        ...(prev?.messages || []),
        {
          id: crypto.randomUUID(),
          role: "user" as const,
          content: rawMessage,
          createdAt: new Date().toISOString(),
        },
      ];
      const assistantText = await buildAssistantReply(
        syntheticHistory.map((m) => ({
          role: (m.role as Role) || "user",
          content: m.content,
        }))
      );
      return {
        sessionId: prev?.sessionId,
        messages: [
          ...syntheticHistory,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: assistantText,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    }

    const sessionId = await ensureSession(
      user.id,
      String(formData.get("sessionId") ?? prev?.sessionId ?? "")
    );

    await db.insert(supportMessages).values({
      sessionId,
      role: "user",
      content: rawMessage,
      metadata: {},
    });

    const recent = await db
      .select()
      .from(supportMessages)
      .where(eq(supportMessages.sessionId, sessionId))
      .orderBy(asc(supportMessages.createdAt));

    const assistantText = await buildAssistantReply(
      recent.map((m) => ({
        role: (m.role as Role) || "user",
        content: m.content,
      }))
    );

    await db.insert(supportMessages).values({
      sessionId,
      role: "assistant",
      content: assistantText,
      metadata: {},
    });

    await db
      .update(supportSessions)
      .set({ updatedAt: new Date() })
      .where(eq(supportSessions.id, sessionId));

    const all = await db
      .select()
      .from(supportMessages)
      .where(eq(supportMessages.sessionId, sessionId))
      .orderBy(asc(supportMessages.createdAt));

    return {
      sessionId,
      messages: all.map((m) => ({
        id: m.id,
        role: (m.role as Role) || "assistant",
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send message.";
    return {
      sessionId: prev?.sessionId,
      messages: prev?.messages || [],
      error: message,
    };
  }
}

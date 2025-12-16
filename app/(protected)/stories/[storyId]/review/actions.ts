"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stories, scenes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateFullStoryDraft, improveText } from "@/lib/ai/story-generator";

export async function getReviewData(storyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const [story] = await db
    .select()
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)));

  if (!story) throw new Error("Story not found");

  const storyScenes = await db
    .select()
    .from(scenes)
    .where(eq(scenes.storyId, storyId))
    .orderBy(scenes.order);

  return { story, scenes: storyScenes };
}

export async function saveStoryDraft(storyId: string, content: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    await db
        .update(stories)
        .set({ 
            draftContent: content,
            updatedAt: new Date()
        })
        .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)));
}

export async function recordExport(storyId: string, format: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");
    
    const [story] = await db.select({ exportHistory: stories.exportHistory, exportCount: stories.exportCount }).from(stories).where(and(eq(stories.id, storyId), eq(stories.userId, user.id)));
    
    if (!story) throw new Error("Story not found");

    const history = (story.exportHistory as any[]) || [];
    history.push({
        date: new Date().toISOString(),
        format
    });

    await db
        .update(stories)
        .set({
            exportCount: (story.exportCount || 0) + 1,
            lastExportDate: new Date(),
            lastExportFormat: format,
            exportHistory: history,
            updatedAt: new Date()
        })
        .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)));
}

export async function generateDraftAction(storyId: string, options: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { story, scenes } = await getReviewData(storyId);
    
    const draft = await generateFullStoryDraft({
        title: story.title,
        description: story.description || "",
        hooks: story.hooks,
        character: story.character,
        structure: story.structure,
        scenes: scenes,
        moralData: story.moralData
    }, options);
    
    return draft;
}

export async function improveTextAction(text: string, type: "rewrite" | "expand" | "shorten" | "grammar") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    return await improveText(text, type);
}




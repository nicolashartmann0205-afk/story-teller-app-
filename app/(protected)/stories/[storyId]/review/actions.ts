"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stories, scenes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateFullStoryDraft, improveText, generateFallbackFullDraft } from "@/lib/ai/story-generator";
import { providerRouter } from "@/lib/ai/image-providers/router";

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

export async function generateIllustrationAction(
    storyId: string, 
    prompt: string, 
    style: string, 
    useFallback: boolean = false,
    preferredProvider?: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");
    
    let imageUrl: string;
    let providerUsed: string;
    let wasAutoFallback = false;
    let cost = 0;
    
    if (useFallback) {
        // Explicitly requested fallback - force use fallback provider
        const result = await providerRouter.generateWithFallback(prompt, style, "fallback");
        imageUrl = result.imageUrl;
        providerUsed = result.provider;
        wasAutoFallback = false;
        cost = result.cost || 0;
    } else {
        // Use provider router with automatic fallback
        try {
            const result = await providerRouter.generateWithFallback(prompt, style, preferredProvider);
            imageUrl = result.imageUrl;
            providerUsed = result.provider;
            wasAutoFallback = result.wasAutoFallback;
            cost = result.cost || 0;
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error("[Server] All providers failed:", errorMsg);
            throw error;
        }
    }
    
    // Fetch current story to update illustrations array
    const [story] = await db
        .select()
        .from(stories)
        .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)));
        
    if (!story) throw new Error("Story not found");
    
    // Add to existing illustrations
    const currentIllustrations = (story.illustrations as any[]) || [];
    const newIllustration = {
        id: crypto.randomUUID(),
        url: imageUrl, // base64 data url
        prompt,
        style,
        provider: providerUsed,
        cost,
        createdAt: new Date().toISOString(),
        wasAutoFallback // Signal to client that fallback was used
    };
    
    const updatedIllustrations = [newIllustration, ...currentIllustrations];
    
    await db
        .update(stories)
        .set({ 
            illustrations: updatedIllustrations,
            updatedAt: new Date()
        })
        .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)));
        
    return newIllustration;
}

export async function deleteIllustrationAction(storyId: string, illustrationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const [story] = await db
        .select()
        .from(stories)
        .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)));

    if (!story) throw new Error("Story not found");

    const currentIllustrations = (story.illustrations as any[]) || [];
    const updatedIllustrations = currentIllustrations.filter((img) => img.id !== illustrationId);

    await db
        .update(stories)
        .set({
            illustrations: updatedIllustrations,
            updatedAt: new Date()
        })
        .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)));
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

    // Update language if provided
    if (options.language) {
        await db.update(stories)
            .set({ language: options.language })
            .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)));
    }

    const { story, scenes } = await getReviewData(storyId);
    
    const storyData = {
        title: story.title,
        description: story.description || "",
        hooks: story.hooks,
        character: story.character,
        structure: story.structure,
        scenes: scenes,
        moralData: story.moralData
    };

    const draft = options.useFallback
        ? generateFallbackFullDraft(storyData)
        : await generateFullStoryDraft(storyData, options);
    
    return draft;
}

export async function improveTextAction(text: string, type: "rewrite" | "expand" | "shorten" | "grammar") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    return await improveText(text, type);
}




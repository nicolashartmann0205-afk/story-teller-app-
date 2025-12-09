"use server";

import { db } from "@/lib/db";
import { scenes, stories } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateSceneDraft, analyzeShowDontTell, suggestSensoryDetails } from "@/lib/ai/story-generator";

export async function getScenes(storyId: string) {
  return await db
    .select()
    .from(scenes)
    .where(eq(scenes.storyId, storyId))
    .orderBy(asc(scenes.order));
}

export async function createScene(storyId: string) {
  // Get the current max order
  const existingScenes = await db
    .select()
    .from(scenes)
    .where(eq(scenes.storyId, storyId));
  
  const newOrder = existingScenes.length + 1;

  const [newScene] = await db
    .insert(scenes)
    .values({
      storyId,
      title: `Scene ${newOrder}`,
      order: newOrder,
      movieTimeAction: {
        where: "",
        what: "",
        next: "",
        sensory_details: []
      },
      movieTimeEmotion: {
        characters: "",
        stakes: "",
        tone: "neutral",
        internal_feeling: "",
        external_show: "",
        audience_feeling: ""
      },
      movieTimeMeaning: {
        change: "",
        significance: "",
        takeaway: "",
        purposes: []
      },
      completenessStatus: "empty"
    })
    .returning();

  revalidatePath(`/stories/${storyId}/scenes`);
  return newScene;
}

export async function updateScene(sceneId: string, storyId: string, data: Partial<typeof scenes.$inferInsert>) {
  const [updatedScene] = await db
    .update(scenes)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(scenes.id, sceneId))
    .returning();

  revalidatePath(`/stories/${storyId}/scenes`);
  revalidatePath(`/stories/${storyId}/scenes/${sceneId}`);
  return updatedScene;
}

export async function deleteScene(sceneId: string, storyId: string) {
  await db.delete(scenes).where(eq(scenes.id, sceneId));
  revalidatePath(`/stories/${storyId}/scenes`);
}

export async function generateSceneDraftAction(sceneData: any, storyId: string) {
    // Fetch story context
    const [story] = await db.select().from(stories).where(eq(stories.id, storyId));
    
    if (!story) throw new Error("Story not found");

    const storyContext = {
        storyType: (story.storyType as any)?.name || "General Fiction",
        overallStakes: (story.hooks as any)?.selected?.whyItWorks || "Survival", // simplified fallback
        theme: "Transformation" // Should fetch from story data if available
    };

    return await generateSceneDraft(sceneData, storyContext);
}

export async function analyzeShowDontTellAction(content: string) {
    return await analyzeShowDontTell(content);
}

export async function suggestSensoryDetailsAction(location: string, action: string) {
    return await suggestSensoryDetails(location, action);
}

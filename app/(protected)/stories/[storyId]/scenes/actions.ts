"use server";

import { db } from "@/lib/db";
import { scenes, stories } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateSceneDraft, analyzeShowDontTell, suggestSensoryDetails } from "@/lib/ai/story-generator";
import { createClient } from "@/lib/supabase/server";
import {
  consumeCredit,
  INSUFFICIENT_CREDITS_CODE,
  INSUFFICIENT_CREDITS_MESSAGE,
} from "@/lib/credits/service";

type CreateSceneSeed = {
  actionWhere?: string;
  actionWhat?: string;
  emotionCharacters?: string;
  emotionStakes?: string;
  emotionTone?: string;
};

export async function getScenes(storyId: string) {
  return await db
    .select()
    .from(scenes)
    .where(eq(scenes.storyId, storyId))
    .orderBy(asc(scenes.order));
}

export async function createScene(storyId: string, seed?: CreateSceneSeed) {
  const existingScenes = await db
    .select({ order: scenes.order })
    .from(scenes)
    .where(eq(scenes.storyId, storyId));

  const newOrder =
    existingScenes.length > 0 ? Math.max(...existingScenes.map((s) => s.order)) + 1 : 1;

  const [newScene] = await db
    .insert(scenes)
    .values({
      storyId,
      title: `Scene ${newOrder}`,
      order: newOrder,
      movieTimeAction: {
        where: seed?.actionWhere?.trim() || "",
        what: seed?.actionWhat?.trim() || "",
        next: "",
        sensory_details: []
      },
      movieTimeEmotion: {
        characters: seed?.emotionCharacters?.trim() || "",
        stakes: seed?.emotionStakes?.trim() || "",
        tone: seed?.emotionTone?.trim() || "neutral",
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
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      // Fetch story context
      const [story] = await db
        .select()
        .from(stories)
        .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)));
      
      if (!story) throw new Error("Story not found");

      const creditResult = await consumeCredit({
        userId: user.id,
        reason: "scene_generate",
        requestId:
          typeof sceneData?.requestId === "string" ? sceneData.requestId : undefined,
        metadata: { storyId },
      });
      if (!creditResult.ok && creditResult.code === INSUFFICIENT_CREDITS_CODE) {
        throw new Error(INSUFFICIENT_CREDITS_MESSAGE);
      }

      const storyContext = {
          storyType: (story.storyType as any)?.name || "General Fiction",
          overallStakes: (story.hooks as any)?.selected?.whyItWorks || "Survival", // simplified fallback
          theme: "Transformation" // Should fetch from story data if available
      };

      return await generateSceneDraft(sceneData, storyContext);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(message || "Failed to generate scene draft. Please try again.");
    }
}

export async function analyzeShowDontTellAction(content: string) {
    return await analyzeShowDontTell(content);
}

export async function suggestSensoryDetailsAction(location: string, action: string) {
    return await suggestSensoryDetails(location, action);
}

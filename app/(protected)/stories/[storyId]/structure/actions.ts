"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { 
  recommendStructure, 
  generateBeatDraft, 
  generateStructureOutline 
} from "@/lib/ai/story-generator";
import { structureDefinitions } from "@/lib/data/structures";

export async function saveStructure(storyId: string, structureData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .update(stories)
      .set({
        structure: structureData,
        updatedAt: new Date(),
      })
      .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)));

    revalidatePath(`/stories/${storyId}/structure`);
    return { success: true };
  } catch (error) {
    console.error("Error saving structure:", error);
    return { error: "Failed to save structure" };
  }
}

export async function getAIStructureRecommendationAction(storyContext: any) {
  const availableStructures = Object.values(structureDefinitions);
  return await recommendStructure(storyContext, availableStructures);
}

export async function getBeatDraftAction(beat: any, storyContext: any, previousBeats: any[]) {
  return await generateBeatDraft(beat, storyContext, previousBeats);
}

export async function getStructureOutlineAction(structureId: string, storyContext: any) {
  const structure = structureDefinitions[structureId];
  if (!structure) throw new Error("Structure not found");
  return await generateStructureOutline(structure, storyContext);
}



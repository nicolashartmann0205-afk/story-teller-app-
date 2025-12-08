"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stories, storyMaps, scenes } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getStoryMapData(storyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Fetch story
  const [story] = await db
    .select()
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)))
    .limit(1);

  if (!story) {
    throw new Error("Story not found");
  }

  // Fetch or create story map
  let [storyMap] = await db
    .select()
    .from(storyMaps)
    .where(eq(storyMaps.storyId, storyId))
    .limit(1);

  if (!storyMap) {
    [storyMap] = await db
      .insert(storyMaps)
      .values({
        storyId,
        userId: user.id,
      })
      .returning();
  }

  // Fetch scenes
  const storyScenes = await db
    .select()
    .from(scenes)
    .where(eq(scenes.storyId, storyId))
    .orderBy(asc(scenes.order));

  // Fetch characters (mocked for now as we don't have a characters table yet)
  // In a real implementation, we'd fetch from characters table
  const characters: any[] = [];

  return {
    story,
    map: storyMap,
    scenes: storyScenes,
    characters,
  };
}

export async function updateSceneOrder(storyId: string, updatedScenes: { id: string; order: number }[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Validate ownership
  const [story] = await db
    .select()
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)))
    .limit(1);

  if (!story) {
    throw new Error("Story not found");
  }

  // Update scenes in a transaction (simulated here with Promise.all for simplicity in Drizzle with HTTP proxy if needed, 
  // but better to use transaction if supported by driver. We'll use simple updates for now)
  
  await Promise.all(
    updatedScenes.map((scene) =>
      db
        .update(scenes)
        .set({ order: scene.order })
        .where(and(eq(scenes.id, scene.id), eq(scenes.storyId, storyId)))
    )
  );

  revalidatePath(`/stories/${storyId}/map`);
  return { success: true };
}

export async function updateMapSettings(storyId: string, settings: Partial<typeof storyMaps.$inferInsert>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(storyMaps)
    .set(settings)
    .where(and(eq(storyMaps.storyId, storyId), eq(storyMaps.userId, user.id)));

  revalidatePath(`/stories/${storyId}/map`);
  return { success: true };
}

export async function createSceneAction(storyId: string, title: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const [story] = await db
    .select()
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)))
    .limit(1);

  if (!story) {
    throw new Error("Story not found");
  }

  // Get max order
  const [lastScene] = await db
    .select()
    .from(scenes)
    .where(eq(scenes.storyId, storyId))
    .orderBy(asc(scenes.order)); // Actually we want desc, but let's just count or sort properly
    
  const allScenes = await db
    .select({ order: scenes.order })
    .from(scenes)
    .where(eq(scenes.storyId, storyId));
    
  const maxOrder = allScenes.length > 0 ? Math.max(...allScenes.map(s => s.order)) : 0;

  const [newScene] = await db
    .insert(scenes)
    .values({
      storyId,
      title,
      order: maxOrder + 1,
      tension: 5, // Default tension
      duration: "10.0", // Default duration %
    })
    .returning();

  revalidatePath(`/stories/${storyId}/map`);
  return { success: true, scene: newScene };
}

import { analyzeStoryStructure } from "@/lib/ai/story-generator";

export async function analyzeStoryMap(storyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Fetch story and scenes
  const [story] = await db
    .select()
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)))
    .limit(1);

  if (!story) {
    throw new Error("Story not found");
  }

  const storyScenes = await db
    .select()
    .from(scenes)
    .where(eq(scenes.storyId, storyId))
    .orderBy(asc(scenes.order));

  if (storyScenes.length === 0) {
    return {
      pacing: { score: "warning", assessment: "No scenes to analyze.", recommendations: [] },
      emotional_arc: { score: "warning", assessment: "Add scenes to see emotional arc.", recommendations: [] },
      structural_integrity: { score: "warning", assessment: "Start building your story.", recommendations: [] },
      character_journeys: { score: "warning", assessment: "No characters found.", recommendations: [] },
    };
  }

  // Determine structure ID (default or from story)
  // Since we don't have a dedicated column yet, we might infer or default.
  // Assuming we passed it or default to 'heros-journey'
  const structureId = "heros-journey"; // Default or get from story settings if added

  // Prepare context
  const context = {
    title: story.title,
    type: (story.storyType as any)?.type || "Unknown",
    mode: story.mode || "quick",
  };

  // Call AI
  const analysis = await analyzeStoryStructure(context, storyScenes, structureId);

  // Save analysis to story map
  await db
    .update(storyMaps)
    .set({
      lastAnalysis: analysis,
      analysisTimestamp: new Date(),
      analysisVersion: (await db.select({ v: storyMaps.analysisVersion }).from(storyMaps).where(eq(storyMaps.storyId, storyId)).then(r => r[0]?.v || 0)) + 1
    })
    .where(eq(storyMaps.storyId, storyId));

  revalidatePath(`/stories/${storyId}/map`);
  return analysis;
}

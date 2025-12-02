"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateHooks } from "@/lib/ai/story-generator";
import { revalidatePath } from "next/cache";

export async function generateHooksAction(
  storyId: string,
  selectedTypes: string[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Fetch story to get title/description
  const [story] = await db
    .select()
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)))
    .limit(1);

  if (!story) {
    throw new Error("Story not found");
  }

  try {
    const generatedData = await generateHooks(
      story.title,
      story.description || "",
      selectedTypes
    );

    // Merge with existing hooks or create new structure
    const currentHooks = (story.hooks as any) || {};
    
    const newHooksData = {
      ...currentHooks,
      selectedTypes,
      generated: {
        ...(currentHooks.generated || {}),
        ...generatedData.hooks
      },
      generatedAt: new Date().toISOString()
    };

    await db
      .update(stories)
      .set({ hooks: newHooksData })
      .where(eq(stories.id, storyId));

    revalidatePath(`/stories/${storyId}`);
    return { success: true };
  } catch (error) {
    console.error("Error in generateHooksAction:", error);
    return { error: "Failed to generate hooks" };
  }
}

export async function saveSelectedHookAction(
  storyId: string,
  hookId: string,
  hookType: string,
  hookText: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Fetch current hooks
  const [story] = await db
    .select()
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)))
    .limit(1);

  if (!story) {
    throw new Error("Story not found");
  }

  const currentHooks = (story.hooks as any) || {};

  const newHooksData = {
    ...currentHooks,
    chosen: {
      id: hookId,
      type: hookType,
      text: hookText,
      selectedAt: new Date().toISOString(),
      isEdited: false
    }
  };

  await db
    .update(stories)
    .set({ hooks: newHooksData })
    .where(eq(stories.id, storyId));

  revalidatePath(`/stories/${storyId}`);
  return { success: true };
}



"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { generateStory } from "@/lib/ai/story-generator";
import { storyCategories, StoryCategory, StoryType } from "@/lib/data/storyTypes";

export async function createStoryAction(
  previousState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const typeId = formData.get("typeId") as string;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return { error: "Title is required" };
  }

  // Reconstruct the story type object to save to DB
  // We only have IDs from the form, so we verify them against our static data
  // Note: For 'custom' category, we might handle it differently
  let storyTypeObject = null;
  
  if (category && typeId && category !== "custom") {
    // @ts-ignore
    const catData = storyCategories[category as StoryCategory];
    if (catData) {
      const typeData = catData.types.find((t: StoryType) => t.id === typeId);
      if (typeData) {
        storyTypeObject = {
          category,
          type: typeData,
          selectedAt: new Date().toISOString()
        };
      }
    }
  } else if (category === "custom") {
    storyTypeObject = {
      category: "custom",
      customDescription: description, // In custom mode, description is the prompt
      selectedAt: new Date().toISOString()
    };
  }

  try {
    // Generate full story content using Gemini AI
    // Pass story type context to the AI if available
    let promptContext = description || "";
    
    if (storyTypeObject && storyTypeObject.category !== "custom" && storyTypeObject.type) {
      promptContext += `\n\nStory Type: ${storyTypeObject.type.name}`;
      promptContext += `\nContext: ${storyTypeObject.type.description}`;
      promptContext += `\nKey Elements to Include: ${storyTypeObject.type.keyElements.join(", ")}`;
    }

    const generatedStory = await generateStory(title, promptContext);

    await db.insert(stories).values({
      userId: user.id,
      title: title.trim(),
      description: generatedStory,
      storyType: storyTypeObject,
    });
  } catch (error) {
    console.error("Error creating story:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create story";
    return { error: errorMessage };
  }

  redirect("/");
  return null;
}


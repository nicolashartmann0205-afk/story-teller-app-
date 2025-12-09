"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stories, users } from "@/lib/db/schema";
import { generateStory, generateHooks } from "@/lib/ai/story-generator";
import { storyCategories, StoryCategory, StoryType } from "@/lib/data/storyTypes";
import { eq } from "drizzle-orm";

export async function generatePreviewHooksAction(
  title: string,
  description: string,
  selectedTypes: string[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const generatedData = await generateHooks(title, description, selectedTypes);
    return { hooks: generatedData.hooks };
  } catch (error) {
    console.error("Error generating preview hooks:", error);
    return { error: "Failed to generate hooks" };
  }
}

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
  const selectedHookData = formData.get("selectedHook") as string;
  const mode = formData.get("mode") as "quick" | "comprehensive";
  const moralDataString = formData.get("moralData") as string;
  const archetypeDataString = formData.get("archetypeData") as string;
  const structureDataString = formData.get("structureData") as string;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return { error: "Title is required" };
  }

  let storyTypeObject: { category: string; type?: StoryType } | null = null;
  if (category && category !== "custom") {
    const categoryData = storyCategories[category as StoryCategory];
    if (categoryData) {
      const typeData = categoryData.types.find((t) => t.id === typeId);
      if (typeData) {
        storyTypeObject = { category, type: typeData };
      }
    }
  } else if (category === "custom") {
    storyTypeObject = { category: "custom" };
  }

  let moralData = null;
  if (moralDataString) {
    try {
      moralData = JSON.parse(moralDataString);
    } catch (e) {
      console.warn("Failed to parse moral data", e);
    }
  }

  let archetypeData = null;
  if (archetypeDataString) {
    try {
      archetypeData = JSON.parse(archetypeDataString);
    } catch (e) {
      console.warn("Failed to parse archetype data", e);
    }
  }

  let structureData = null;
  if (structureDataString) {
    try {
      structureData = JSON.parse(structureDataString);
    } catch (e) {
      console.warn("Failed to parse structure data", e);
    }
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

    if (archetypeData && archetypeData.primary) {
      promptContext += `\n\nPrimary Archetype: ${archetypeData.primary}`;
      if (archetypeData.secondary) promptContext += `\nSecondary Archetype: ${archetypeData.secondary}`;
      
      if (archetypeData.darkSides) {
        const sides = [];
        if (archetypeData.darkSides.tooMuch) sides.push("Excessive trait (Too Much)");
        if (archetypeData.darkSides.tooLittle) sides.push("Deficient trait (Too Little)");
        if (sides.length > 0) promptContext += `\nCharacter Shadow/Dark Sides: ${sides.join(", ")}`;
      }
      
      if (archetypeData.journey) {
         promptContext += `\n\nCharacter Arc:`;
         if (archetypeData.journey.start) promptContext += `\n- Beginning: ${archetypeData.journey.start}`;
         if (archetypeData.journey.middle) promptContext += `\n- Middle/Challenge: ${archetypeData.journey.middle}`;
         if (archetypeData.journey.end) promptContext += `\n- Ending/Resolution: ${archetypeData.journey.end}`;
      }
    }

    if (moralData && moralData.primary) {
      promptContext += `\n\nMoral Conflict: ${moralData.primary.replace('_', ' vs ')}`;
      if (moralData.complexity) promptContext += ` (${moralData.complexity})`;
    }

    let hooksData = null;
    if (selectedHookData) {
      try {
        const parsedHook = JSON.parse(selectedHookData);
        promptContext += `\n\nIMPORTANT: Start the story with this specific opening hook: "${parsedHook.text}"`;
        
        // Structure for DB
        hooksData = {
          selectedTypes: [parsedHook.type], // Assuming single type selection for simplicity or inferred
          generated: {}, // We don't save all generated options from preview to save space/complexity unless needed
          chosen: parsedHook,
          generatedAt: new Date().toISOString()
        };
      } catch (e) {
        console.warn("Failed to parse selected hook data", e);
      }
    }

    const generatedStory = await generateStory(title, promptContext);

    const [newStory] = await db.insert(stories).values({
      userId: user.id,
      title: title.trim(),
      description: generatedStory,
      storyType: storyTypeObject,
      hooks: hooksData,
      mode: mode || "quick",
      moralData: moralData || {},
      moralConflictPrimary: moralData?.primary,
      moralComplexity: moralData?.complexity,
      character: archetypeData,
      structure: structureData,
    }).returning();

    // Update user preference for default mode
    if (mode) {
      // Fetch current preferences first to merge
      const [currentUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      const currentPrefs = (currentUser?.preferences as any) || {};
      
      await db.update(users).set({
        preferences: {
          ...currentPrefs,
          defaultMode: mode
        }
      }).where(eq(users.id, user.id));
    }

    redirect(`/stories/${newStory.id}`); // Redirect to the new story page
  } catch (error) {
    if ((error as any).digest?.startsWith('NEXT_REDIRECT')) {
        throw error;
    }

    console.error("Error creating story:", error);
    return { error: "Failed to create story" };
  }
}
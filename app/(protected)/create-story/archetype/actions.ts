"use server";

import { createClient } from "@/lib/supabase/server";
import { creditGate, type InsufficientCreditsResponse } from "@/lib/credits/redirect";
import { consumeCredit } from "@/lib/credits/service";
import {
  getGeminiClient,
  isGeminiConfigured,
  warnGeminiMissingOnce,
} from "@/lib/ai/gemini-env";
import { archetypesLibrary } from "@/lib/data/archetypes";

interface StoryContext {
  title: string;
  description: string;
  storyType?: string;
}

interface ArchetypeSuggestion {
  primaryRecommendation: string;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  alternativeOptions: { archetypeId: string; reason: string }[];
}

export async function getAIArchetypeSuggestion(
  context: StoryContext,
  requestId?: string
): Promise<ArchetypeSuggestion | InsufficientCreditsResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const creditResult = await consumeCredit({
    userId: user.id,
    reason: "archetype_suggest",
    requestId,
    metadata: { storyType: context.storyType ?? null },
  });
  const blocked = creditGate(creditResult);
  if (blocked) return blocked;

  if (!isGeminiConfigured()) {
    warnGeminiMissingOnce("archetype suggestion");
    // Return a mock suggestion to avoid breaking the UI in dev without keys
    return {
      primaryRecommendation: "warrior", // fallback
      confidence: "low",
      reasoning: "AI service unavailable (No API Key). Suggesting Warrior archetype as default.",
      alternativeOptions: []
    };
  }

  try {
    const model = getGeminiClient().getGenerativeModel({ model: "gemini-3-flash-preview", generationConfig: { responseMimeType: "application/json" } });

    const archetypesList = Object.values(archetypesLibrary).map(a => `${a.id} (${a.name}): ${a.tagline}`).join("\n");

    const prompt = `
      You are an expert story analyst. Based on the following story concept, recommend the most suitable Character Archetype for the protagonist.
      
      Story Title: ${context.title}
      Story Description: ${context.description}
      Story Type: ${context.storyType || "Not specified"}
      
      Available Archetypes:
      ${archetypesList}
      
      Analyze the themes, tone, and goals of the story.
      Return a JSON object with this structure:
      {
        "primaryRecommendation": "archetype_id", // Must match one of the IDs provided (lowercase)
        "confidence": "high" | "medium" | "low",
        "reasoning": "Concise explanation of why this fits (max 2 sentences).",
        "alternativeOptions": [
          { "archetypeId": "archetype_id", "reason": "Brief reason" },
          { "archetypeId": "archetype_id", "reason": "Brief reason" }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const suggestion = JSON.parse(text);
    
    // Validate IDs
    if (!archetypesLibrary[suggestion.primaryRecommendation]) {
      // If AI returns invalid ID, fallback to first match or generic
      suggestion.primaryRecommendation = "warrior"; 
    }
    
    return suggestion;

  } catch (error) {
    console.error("Error getting archetype suggestion:", error);
    // Return a safe fallback instead of crashing
    return {
      primaryRecommendation: "warrior", // Valid fallback ID
      confidence: "low",
      reasoning: "AI service is temporarily unavailable. Based on general storytelling principles, the Warrior archetype is a strong starting point for many protagonists.",
      alternativeOptions: [
        { archetypeId: "explorer", reason: "Good for journey-based stories" },
        { archetypeId: "artist", reason: "Good for creative protagonists" }
      ]
    };
  }
}

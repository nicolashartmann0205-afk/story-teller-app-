"use server";

import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { archetypesLibrary } from "@/lib/data/archetypes";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

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

export async function getAIArchetypeSuggestion(context: StoryContext): Promise<ArchetypeSuggestion> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!apiKey) {
    // Fallback or error if no API key
    console.warn("GEMINI_API_KEY not set for archetype suggestion");
    // Return a mock suggestion to avoid breaking the UI in dev without keys
    return {
      primaryRecommendation: "hero", // fallback
      confidence: "low",
      reasoning: "AI service unavailable. Suggesting generic Hero archetype.",
      alternativeOptions: []
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });

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
      primaryRecommendation: "hero", // Generic fallback
      confidence: "low",
      reasoning: "AI analysis unavailable at the moment. Falling back to default suggestion.",
      alternativeOptions: [
        { archetypeId: "explorer", reason: "Alternative option" },
        { archetypeId: "creator", reason: "Alternative option" }
      ]
    };
  }
}

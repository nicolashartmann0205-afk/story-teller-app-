import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI story generation will fail if called.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function generateStory(title: string, description: string): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a creative story teller. Write a compelling short story based on the following:
    
    Title: ${title}
    Context/Description: ${description}

    The story should be engaging, creative, and suitable for a general audience. Please format the output as plain text with paragraphs.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error generating story with Gemini:", error);
    throw new Error(`Failed to generate story content: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateHooks(
  title: string,
  description: string,
  selectedTypes: string[]
): Promise<any> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });

    const prompt = `You are a creative writing expert specializing in "hooks" - opening lines that immediately capture attention.
    
    Story Title: ${title}
    Story Context: ${description}
    
    Please generate 3 distinct hook options for EACH of the following hook types: ${selectedTypes.join(", ")}.
    
    For each hook, provide:
    1. The hook text itself.
    2. A "Why this works" explanation (educational, short).
    3. A "Tone" (e.g., Provocative, Emotional, etc.).
    
    Return the response as a strictly valid JSON object with the following structure:
    {
      "hooks": {
        "unexpected": [ { "text": "...", "whyItWorks": "...", "tone": "..." }, ... ],
        "knowledge": [ ... ],
        ... for each requested type
      }
    }
    
    Ensure the keys in "hooks" match the requested types (lowercase).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating hooks with Gemini:", error);
    throw new Error(`Failed to generate hooks: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function analyzeStoryStructure(
  storyContext: { title: string; type?: string; mode?: string },
  scenes: any[],
  structureId: string
): Promise<any> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });

    const prompt = `You are a story structure expert. Analyze the following story map.

    CONTEXT:
    Title: ${storyContext.title}
    Type: ${storyContext.type || "Unknown"}
    Mode: ${storyContext.mode || "Standard"}
    Structure: ${structureId}
    
    SCENES (${scenes.length}):
    ${scenes.map((s, i) => `[${i+1}] "${s.title}" (Tension: ${s.tension}/10, Duration: ${s.duration}%)`).join("\n")}

    Provide a comprehensive analysis in valid JSON format with these sections:
    1. pacing: { score: "good" | "warning" | "issue", assessment: "...", recommendations: ["..."] }
    2. emotional_arc: { score: "...", assessment: "...", recommendations: ["..."] }
    3. structural_integrity: { score: "...", assessment: "...", recommendations: ["..."] }
    4. character_journeys: { score: "...", assessment: "...", recommendations: ["..."] }
    5. reorder_suggestions: [{ sceneIndex: number, suggestion: "...", reason: "..." }] (optional)

    Keep assessments concise and constructive. Focus on the flow of tension and structural beats.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing story structure with Gemini:", error);
    throw new Error(`Failed to analyze story: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function suggestArchetype(
  title: string,
  description: string,
  storyType: string
): Promise<any> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });

    const prompt = `You are a story consultant specializing in character development and Jungian archetypes.
    
    Story Title: ${title}
    Story Type: ${storyType}
    Story Context: ${description}
    
    Analyze the story concept and recommend the most suitable primary character archetype from the following 12 options:
    Ruler, Creator/Artist, Sage, Innocent, Explorer, Rebel, Hero/Warrior, Wizard/Magician, Jester, Everyman/Companion, Lover, Caregiver.

    Also suggest 2 alternative options.

    Return the response as a strictly valid JSON object with the following structure:
    {
      "primaryRecommendation": "archetype-id-lowercase", // e.g., "warrior"
      "confidence": "high" | "medium" | "low",
      "reasoning": "Explanation of why this archetype fits the story goals...",
      "alternativeOptions": [
        { "archetypeId": "archetype-id-lowercase", "reason": "Brief reason..." },
        { "archetypeId": "archetype-id-lowercase", "reason": "Brief reason..." }
      ]
    }

    Ensure the archetype IDs are lowercase and match standard Jungian names (e.g., "warrior", "magician", "lover", "rebel", "explorer", "creator", "ruler", "caregiver", "innocent", "jester", "sage", "orphan" or "companion"). Use "artist" for Creator and "companion" for Everyman/Orphan.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error suggesting archetype with Gemini:", error);
    throw new Error(`Failed to suggest archetype: ${error instanceof Error ? error.message : String(error)}`);
  }
}

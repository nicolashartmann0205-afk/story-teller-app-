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


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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    throw new Error("Failed to generate story content");
  }
}


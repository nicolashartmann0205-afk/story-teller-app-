
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("No API key found");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    // There isn't a direct listModels on genAI instance in some versions, 
    // but usually it's on the model manager or similar.
    // Actually the node SDK doesn't expose listModels easily on the main class in older versions.
    // But let's try a simple generation with a known model to see if it works.
    
    const modelsToTry = [
        "gemini-2.0-flash-lite-001",
        "gemini-2.0-flash-lite",
        "gemini-2.5-flash-lite",
        "gemma-3-27b-it",
        "gemma-3-12b-it",
        "gemma-3-4b-it",
        "gemini-1.5-flash-8b",
        "gemini-1.5-flash-002"
    ];

    console.log("Testing models...");
    
    for (const modelName of modelsToTry) {
        try {
            console.log(`Trying ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`✅ ${modelName} works! Response: ${response.text().substring(0, 20)}...`);
            break; // Found one that works
        } catch (e: any) {
            console.log(`❌ ${modelName} failed: ${e.message.split('\n')[0]}`);
        }
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();

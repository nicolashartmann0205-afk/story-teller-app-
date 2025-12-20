
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("No API key");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testJson() {
  try {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-lite",
        generationConfig: { responseMimeType: "application/json" }
    });
    
    const result = await model.generateContent('Return a JSON object: {"test": "success"}');
    const response = await result.response;
    console.log("JSON Response:", response.text());
  } catch (e) {
    console.error("JSON Error:", e);
  }
}

testJson();


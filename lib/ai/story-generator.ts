import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
// Use a specific model version to avoid 404s with generic alias
const MODEL_NAME = "gemini-1.5-flash-002";

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI story generation will fail if called.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function generateStory(title: string, description: string, language: string = "en"): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const langMap: Record<string, string> = {
        'de': 'German',
        'th': 'Thai',
        'en': 'English'
    };
    const targetLang = langMap[language] || 'English';

    const prompt = `You are a creative story teller. Write a compelling short story based on the following:
    
    Title: ${title}
    Context/Description: ${description}

    The story should be engaging, creative, and suitable for a general audience. 
    IMPORTANT: Write the story in ${targetLang}.
    Please format the output as plain text with paragraphs.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error generating story with Gemini:", error);
    // Fallback content so the app doesn't crash/fail for the user
    console.warn("Returning original description as fallback.");
    return description;
  }
}

export async function generateHooks(
  title: string,
  description: string,
  selectedTypes: string[],
  language: string = "en"
): Promise<any> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig: { responseMimeType: "application/json" } });

    const langMap: Record<string, string> = {
        'de': 'German',
        'th': 'Thai',
        'en': 'English'
    };
    const targetLang = langMap[language] || 'English';

    const prompt = `You are a creative writing expert specializing in "hooks" - opening lines that immediately capture attention.
    
    Story Title: ${title}
    Story Context: ${description}
    Language: ${targetLang}
    
    Please generate 3 distinct hook options for EACH of the following hook types: ${selectedTypes.join(", ")}.
    
    For each hook, provide:
    1. The hook text itself (in ${targetLang}).
    2. A "Why this works" explanation (in ${targetLang}, educational, short).
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
    // Return fallback hooks
    return {
      hooks: {
        unexpected: [{ text: "The day the sky turned purple, I knew everything had changed.", whyItWorks: "Immediate visual intrigue.", tone: "Mystery" }],
        knowledge: [{ text: "Did you know that shadows can bite?", whyItWorks: "Challenges assumption.", tone: "Dark" }],
        action: [{ text: "I dropped the gun and started running.", whyItWorks: "In medias res.", tone: "Thriller" }]
      }
    };
  }
}

export async function refineHook(
  hookText: string,
  refinementType: string,
  storyContext: { title: string; description: string }
): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `You are a creative writing editor. Refine the following story hook.

    Original Hook: "${hookText}"
    
    Story Context:
    Title: ${storyContext.title}
    Description: ${storyContext.description}
    
    Refinement Instruction: Make it more ${refinementType} (e.g., emotional, surprising, concise, punchy).
    
    Provide ONLY the refined hook text. No explanations or quotes.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error refining hook with Gemini:", error);
    throw new Error("Failed to refine hook.");
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
    const model = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig: { responseMimeType: "application/json" } });

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
    const model = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig: { responseMimeType: "application/json" } });

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

// Fallback generator for full draft
export function generateFallbackFullDraft(storyData: any): string {
  let draft = `<h1>${storyData.title}</h1>`;
  
  if (storyData.description) {
    // Clean up if description contains previous error messages or metadata appended by creation process
    const cleanDescription = storyData.description
        .replace(/\[AI Generation Unavailable\]\s*/g, '')
        .replace(/^Title: .*?(\n\n|\n)/, '')
        .replace(/\(Note: The AI service is currently experiencing high traffic[\s\S]*\)/, '')
        .replace(/\n\n(Story Type|Primary Archetype|Moral Conflict|IMPORTANT|Context):[\s\S]*/, '')
        .trim();
        
    draft += `<p><em>${cleanDescription}</em></p><hr />`;
  }
  
  draft += `<div style="padding: 1rem; background-color: #f3f4f6; border-radius: 0.5rem; margin-bottom: 2rem;">`;
  draft += `<strong>⚠️ AI Service Unavailable - Offline Template</strong><br/>`;
  draft += `Note: The AI service is currently experiencing high traffic. This template includes your story structure so you can start writing manually.`;
  draft += `</div>`;
  
  // Hooks
  if (storyData.hooks) {
    let hookText = "";
    if (typeof storyData.hooks === 'string') {
        hookText = storyData.hooks;
    } else if (storyData.hooks.selected) {
        hookText = storyData.hooks.selected.text || storyData.hooks.selected;
    } else if (storyData.hooks.chosen) {
        hookText = storyData.hooks.chosen.text || storyData.hooks.chosen;
    } else if (Array.isArray(storyData.hooks)) {
         // Try to find the first valid hook in an array
         const firstHook = storyData.hooks[0];
         hookText = typeof firstHook === 'string' ? firstHook : (firstHook?.text || JSON.stringify(firstHook));
    } else if (typeof storyData.hooks === 'object') {
        hookText = storyData.hooks.text || "Hook content unavailable";
    }

    if (hookText && hookText !== "undefined") {
        draft += `<h2>Opening Hook</h2><p>${hookText}</p><hr />`;
    }
  }

  // Add scenes
  if (storyData.scenes && storyData.scenes.length > 0) {
    storyData.scenes.forEach((scene: any, index: number) => {
      draft += `<h2>Chapter ${index + 1}: ${scene.title || `Scene ${index + 1}`}</h2>`;
      if (scene.description) draft += `<p><em>Context: ${scene.description}</em></p>`;
      draft += `<p>[Start writing this scene here...]</p><br/><br/><hr />`;
    });
  } else if (storyData.structure && storyData.structure.beats) {
     // Fallback to beats if no scenes
    storyData.structure.beats.forEach((beat: any, index: number) => {
      draft += `<h2>Part ${index + 1}: ${beat.name || beat.title || `Beat ${index + 1}`}</h2>`;
      if (beat.description) draft += `<p><em>Focus: ${beat.description}</em></p>`;
      draft += `<p>[Start writing here...]</p><br/><br/><hr />`;
    });
  } else {
    draft += `<h2>Chapter 1</h2><p>[Start writing your story here...]</p>`;
  }
  
  return draft;
}

export async function generateFullStoryDraft(
  storyData: {
    title: string;
    description: string;
    hooks?: any;
    character?: any;
    structure?: any;
    scenes?: any[];
    moralData?: any;
  },
  options: {
    tone?: string;
    style?: string;
    language?: string;
  } = {}
): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Construct a comprehensive prompt
    let prompt = `You are a professional novelist. Write a full draft of a short story based on the following detailed outline.\n\n`;
    
    const langMap: Record<string, string> = {
        'de': 'German',
        'th': 'Thai',
        'en': 'English'
    };
    const targetLang = langMap[options.language || 'en'] || 'English';
    
    prompt += `LANGUAGE: ${targetLang}\n`;
    
    prompt += `TITLE: ${storyData.title}\n`;
    
    // Clean description if it contains error message from previous steps
    const cleanDescription = storyData.description
        ? storyData.description
            .replace(/\[AI Generation Unavailable\]\s*/g, '')
            .replace(/^Title: .*?(\n\n|\n)/, '')
            .replace(/\(Note: The AI service is currently experiencing high traffic[\s\S]*\)/, '')
            .replace(/\n\n(Story Type|Primary Archetype|Moral Conflict|IMPORTANT|Context):[\s\S]*/, '')
            .trim()
        : "";
    
    prompt += `PREMISE: ${cleanDescription}\n\n`;

    if (storyData.moralData) {
        prompt += `THEME/MORAL CONFLICT: ${JSON.stringify(storyData.moralData)}\n\n`;
    }

    if (storyData.hooks) {
      // Assuming hooks is an object with types, we just pick one or show them
      prompt += `HOOK IDEA: ${JSON.stringify(storyData.hooks)}\n\n`;
    }

    if (storyData.character) {
      prompt += `MAIN CHARACTER: ${JSON.stringify(storyData.character)}\n\n`;
    }

    if (storyData.structure) {
      prompt += `STORY STRUCTURE: ${JSON.stringify(storyData.structure)}\n\n`;
    }

    if (storyData.scenes && storyData.scenes.length > 0) {
      prompt += `SCENE OUTLINE:\n`;
      storyData.scenes.forEach((scene, index) => {
        prompt += `${index + 1}. ${scene.title}: ${scene.description || "No description"} (Mood: ${scene.emotion || "Neutral"}, Tension: ${scene.tension}/10)\n`;
      });
      prompt += `\n`;
    }

    if (options.tone) prompt += `TONE: ${options.tone}\n`;
    if (options.style) prompt += `STYLE: ${options.style}\n`;

    prompt += `\nINSTRUCTIONS:\n`;
    prompt += `1. Write the complete story from start to finish.\n`;
    prompt += `2. Incorporate the character's journey and the moral conflict naturally.\n`;
    prompt += `3. Follow the scene outline to ensure pacing matches the structure.\n`;
    prompt += `4. Use vivid imagery and "show, don't tell" techniques.\n`;
    prompt += `5. CRITICAL: Write the story in ${targetLang}.\n`;
    prompt += `6. CRITICAL: Output the story in semantic HTML format (e.g., <h1>Title</h1>, <h2>Chapter X</h2>, <p>Paragraph...</p>). Do not use Markdown.\n`;

    const result = await retryWithBackoff(async () => {
      console.log("Calling Gemini for full story draft...");
      const genResult = await model.generateContent(prompt);
      const response = await genResult.response;
      return response.text();
    });

    console.log("Draft generation successful, length:", result.length);
    // Strip markdown code blocks if AI returns them despite instructions
    return result.replace(/```html/g, '').replace(/```/g, '');
  } catch (error) {
    console.error("Error generating full draft with Gemini:", error);
    
    const message = error instanceof Error ? error.message : String(error);
    
    // Handle Rate Limits (429) gracefully
    if (message.includes("429") || message.includes("Quota exceeded")) {
      // Throw allows UI to handle retry state
      throw new Error("AI Service is busy (Rate Limit). Please try again in a moment.");
    }

    // Throw error so UI can display it without overwriting draft
    throw new Error(`Failed to generate draft: ${message}`);
  }
}

export async function improveText(text: string, type: "rewrite" | "expand" | "shorten" | "grammar"): Promise<string> {
   if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    let prompt = "";
    switch(type) {
        case "rewrite": prompt = "Rewrite the following text to improve flow and clarity:"; break;
        case "expand": prompt = "Expand the following text with more descriptive details and sensory language:"; break;
        case "shorten": prompt = "Condense the following text while preserving the core meaning and impact:"; break;
        case "grammar": prompt = "Correct any grammar, spelling, or punctuation errors in the following text:"; break;
    }

    prompt += `\n\n"${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
     console.error("Error improving text with Gemini:", error);
    throw new Error(`Failed to improve text: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateSceneDraft(sceneData: any, storyContext: any): Promise<string> {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
  
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
      const prompt = `You are a creative writing assistant helping to develop a scene for a story.
  
  STORY CONTEXT:
  - Story Type: ${storyContext.storyType}
  - Overall Stakes: ${storyContext.overallStakes}
  - Theme: ${storyContext.theme}
  
  SCENE FRAMEWORK (Movie Time):
  
  ACTION:
  - Where: ${sceneData.movieTimeAction.where}
  - What's happening: ${sceneData.movieTimeAction.what}
  - What happens next: ${sceneData.movieTimeAction.next}
  
  EMOTION:
  - Characters involved: ${sceneData.movieTimeEmotion.characters}
  - Stakes: ${sceneData.movieTimeEmotion.stakes}
  - Tone: ${sceneData.movieTimeEmotion.tone}
  
  MEANING:
  - What changed: ${sceneData.movieTimeMeaning.change}
  - Why it matters: ${sceneData.movieTimeMeaning.significance}
  - Takeaway: ${sceneData.movieTimeMeaning.takeaway}
  
  Generate a vivid, engaging scene (300-500 words) that:
  1. Shows concrete visual action (don't just tell)
  2. Conveys emotion through physical details and dialogue
  3. Advances the story meaningfully
  4. Uses sensory details appropriate to the location
  5. Maintains the specified emotional tone
  
  Write in a style suitable for a ${storyContext.storyType}. Output ONLY the scene text in Markdown.`;
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating scene draft with Gemini:", error);
      throw new Error("Failed to generate scene draft.");
    }
  }
  
  export async function analyzeShowDontTell(sceneContent: string): Promise<any> {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
  
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig: { responseMimeType: "application/json" } });
  
      const prompt = `You are a writing coach analyzing a scene for "show don't tell" effectiveness.
  
  SCENE TEXT:
  ${sceneContent}
  
  Analyze this scene and provide:
  
  1. OVERALL SCORE (1-10):
  - How well does this scene SHOW rather than TELL?
  
  2. TELLING PHRASES (identify 3-5):
  For each phrase that "tells" rather than "shows":
  - Quote the original phrase
  - Suggest a "showing" alternative
  - Explain why in one sentence
  
  3. IMPROVEMENT OPPORTUNITIES:
  - Sensory details that could be added
  - Dialogue opportunities
  - Physical action suggestions
  
  4. TOP PRIORITY:
  What single change would most improve this scene?
  
  Return the response as a strictly valid JSON object with keys: "score", "tellingPhrases" (array of {original, suggestion, reason}), "improvements" (array of strings), "topPriority" (string).`;
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error("Error analyzing show don't tell with Gemini:", error);
      throw new Error("Failed to analyze text.");
    }
  }
  
  export async function suggestSensoryDetails(location: string, action: string): Promise<string[]> {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
  
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig: { responseMimeType: "application/json" } });
  
      const prompt = `Given this scene location and action:
  
  LOCATION: ${location}
  ACTION: ${action}
  
  Suggest 5 sensory details that would make this scene more vivid:
  - 2 visual details
  - 1 auditory detail
  - 1 tactile detail
  - 1 smell or taste detail
  
  Make suggestions brief (10-15 words each). Return as a JSON array of strings.`;
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error("Error suggesting sensory details with Gemini:", error);
      return ["Crackling fire", "Smell of old books", "Cold wind against skin", "Flickering candlelight", "Distant thunder"];
    }
  }

export async function recommendStructure(
  storyContext: {
    storyType: any;
    audience: any;
    character: any;
    mode: string;
    purpose: string;
  },
  availableStructures: any[]
): Promise<any> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig: { responseMimeType: "application/json" } });

    const structuresList = availableStructures.map(s => `${s.name}: ${s.description} - Best for: ${s.bestFor?.join(', ') || ''}`).join('\n');

    const prompt = `You are an expert in narrative structures and the Storyteller Tactics framework. Your task is to recommend the most appropriate story structure based on the user's context.

    Consider:
    - Story type and typical structures that work well for it
    - Time constraints (quick vs. extended development)
    - Audience expectations
    - Character archetype and natural story arcs
    - Complexity tolerance

    Available structures:
    ${structuresList}

    Story Context:
    Story Type: ${storyContext.storyType?.name || 'Unknown'}
    Category: ${storyContext.storyType?.category || 'Unknown'}
    Audience: ${storyContext.audience || 'Unknown'}
    Character: ${storyContext.character?.name || 'Not selected'}
    Mode: ${storyContext.mode} (${storyContext.mode === 'quick' ? 'needs quick structure' : 'can handle complex structure'})
    Purpose: ${storyContext.purpose || 'Unknown'}

    Recommend the BEST structure and explain why in 2-3 sentences. Also suggest 2 alternatives.

    Return JSON:
    {
      "primary": {
        "structureId": "id (must match one of the available structure IDs)",
        "confidence": "high" | "medium" | "low",
        "reasoning": "explanation"
      },
      "alternatives": [
        {
          "structureId": "id",
          "reason": "why this could also work"
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Error recommending structure with Gemini:", error);
    // Fallback
    return {
      primary: { structureId: "man-in-a-hole", confidence: "low", reasoning: "Fallback recommendation." },
      alternatives: []
    };
  }
}

// Retry utility
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) throw error;
    
    const message = error?.message || String(error);
    // Only retry on rate limits (429) or temporary server errors (500, 503)
    const shouldRetry = message.includes("429") || message.includes("500") || message.includes("503");
    
    if (!shouldRetry) throw error;

    console.warn(`AI API failed, retrying in ${delay}ms... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

// Fallback generator
function getFallbackBeatDraft(beat: any, storyContext: any): string {
  const structure = storyContext.structure?.name || "the story";
  const character = storyContext.character?.name || "the hero";
  
  return `[AI Unavailable - Offline Template]\n\n` +
    `For this part of ${structure}, focus on ${beat.name.toLowerCase()}.\n\n` +
    `Consider how ${character} reacts to the situation. ${beat.description}\n\n` +
    `Drafting Prompt:\n` +
    (beat.guidance?.questions?.map((q: string) => `- ${q}`).join('\n') || `- What happens next to move the story forward?`);
}

export async function generateBeatDraft(
  beat: any,
  storyContext: any,
  previousBeats: any[]
): Promise<string> {
  const currentKey = process.env.GEMINI_API_KEY;
  if (!currentKey) {
    console.error("GEMINI_API_KEY is missing in server environment");
    // Return fallback immediately if no key
    return getFallbackBeatDraft(beat, storyContext);
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `You are a storytelling expert helping someone write a beat in their story.

    Structure: ${storyContext.structure?.name || 'Unknown'}
    Current Beat: ${beat.name}
    Beat Description: ${beat.description}
    Emotion: ${beat.emotion || 'Neutral'}

    Story Context:
    - Type: ${storyContext.storyType?.name || 'Unknown'}
    - Character: ${storyContext.character?.name || 'Unknown'}
    - Audience: ${storyContext.audience || 'General'}

    Previous Beats (for continuity):
    ${previousBeats.map(b => `${b.beatName}: ${b.userContent}`).join('\n')}

    Guiding Questions for this beat:
    ${beat.guidance?.questions?.join('\n') || ''}

    Write a 2-4 sentence draft for this beat that:
    1. Answers the guiding questions
    2. Maintains continuity with previous beats
    3. Uses concrete, vivid language
    4. Fits the emotional tone
    5. Is appropriate for the story type and audience

    Return only the draft text, no explanation.`;

    // Wrap the API call in retry logic
    const text = await retryWithBackoff(async () => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    });
    
    if (!text) {
        throw new Error("AI returned empty response");
    }
    
    return text.trim();
  } catch (error: any) {
    console.error("Detailed Error generating beat draft:", error);
    // Extract meaningful error message from Google's SDK if possible
    const detailedMessage = error?.message || String(error);
    
    // Check for Rate Limit specifically to use fallback
    if (detailedMessage.includes("429")) {
        console.warn("Rate limit exceeded even after retries. Using fallback.");
        return getFallbackBeatDraft(beat, storyContext);
    }
    
    if (detailedMessage.includes("API key not valid")) {
        throw new Error("Invalid API Key provided to AI service.");
    }

    // For other errors, we might also want to fallback to avoid blocking the user completely
    // but let's throw for now if it's not a rate limit issue, to help debugging other problems.
    // Or simpler: just fallback for everything in production.
    // Let's fallback for 500/503 too.
    if (detailedMessage.includes("500") || detailedMessage.includes("503") || detailedMessage.includes("fetch failed")) {
         return getFallbackBeatDraft(beat, storyContext);
    }

    throw new Error(`AI Generation Failed: ${detailedMessage}`);
  }
}

export async function generateStructureOutline(
  structure: any,
  storyContext: any
): Promise<any> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig: { responseMimeType: "application/json" } });

    const prompt = `Generate a story outline using the ${structure.name} structure.

    Story Context:
    - Type: ${storyContext.storyType?.name || 'Unknown'}
    - Character: ${storyContext.character?.name || 'Unknown'}
    - Audience: ${storyContext.audience || 'Unknown'}
    - Purpose: ${storyContext.purpose || 'Unknown'}
    - Conflict: ${storyContext.conflict?.central || 'Unknown'}

    Structure: ${structure.name}
    Key Beats: ${structure.beats.map((b: any) => b.name).join(', ')}

    Create a custom outline with ${structure.beats.length} beats. For each beat:
    1. Use the beat name from the structure
    2. Write a 1-2 sentence suggestion specific to their story
    3. Indicate approximate duration as percentage

    Return JSON array:
    [
      {
        "beatName": "Beat name",
        "suggestion": "Specific suggestion for their story",
        "duration": "20%"
      }
    ]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Error generating structure outline with Gemini:", error);
    throw new Error("Failed to generate structure outline.");
  }
}

export async function generateIllustration(
  prompt: string,
  style: string = "cinematic"
): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    // Attempt to use a model that might support image generation or fallback to text-to-SVG
    // Note: Standard Gemini API via google-generative-ai is primarily text/multimodal-in.
    // If the user has access to Imagen via Gemini API (e.g. "nanobanana" or "imagen-3"), 
    // we would use a specific call. 
    // Since we are limited to the text SDK here, we will generate a high-quality SVG illustration
    // which acts as a vector image. This is a robust way to get visuals from a text-only LLM.
    
    const model = genAI.getGenerativeModel({ model: MODEL_NAME }); // Using a capable model for code/SVG

    const svgPrompt = `You are an expert AI artist and vector graphics designer.
    Create a detailed, artistic SVG illustration for the following scene description:
    
    "${prompt}"
    
    Style: ${style}
    
    Requirements:
    - Output ONLY valid SVG code.
    - Use a standard viewBox="0 0 512 512".
    - Use complex shapes, gradients, and paths to create a visually impressive image.
    - Do not include markdown code blocks (e.g., \`\`\`xml). Just the raw <svg>...</svg> string.
    - Minimize text/labels inside the image; focus on visual composition.
    `;

    const result = await retryWithBackoff(async () => {
      console.log("Calling Gemini for illustration...");
      const genResult = await model.generateContent(svgPrompt);
      return genResult;
    });

    const response = await result.response;
    let text = response.text().trim();
    
    // Cleanup markdown if present
    text = text.replace(/^```xml/i, "").replace(/^```svg/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    
    if (!text.startsWith("<svg")) {
      // If it failed to produce SVG, fallback or try to extract it
      const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/);
      if (svgMatch) {
        text = svgMatch[0];
      } else {
        throw new Error("Failed to generate valid SVG");
      }
    }
    
    // Convert to Base64 for storage/display consistency with potential raster images
    const base64 = Buffer.from(text).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
    
  } catch (error) {
    console.error("Error generating illustration with Gemini:", error);
    throw new Error(`Failed to generate illustration: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function generateFallbackIllustration(title: string, style: string): string {
  // Generate a simple SVG placeholder
  const width = 512;
  const height = 512;
  const colors = {
    cinematic: ["#1a1a2e", "#16213e"],
    watercolor: ["#fff5e6", "#ffe0b2"],
    cyberpunk: ["#0f0c29", "#302b63"],
    minimalist: ["#ffffff", "#f0f0f0"],
    sketch: ["#fdfbf7", "#e6e6e6"],
    fantasy: ["#2c3e50", "#34495e"]
  };
  
  const bgColors = colors[style as keyof typeof colors] || colors.cinematic;
  const textColor = style === 'watercolor' || style === 'minimalist' || style === 'sketch' ? '#333' : '#fff';
  
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColors[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${bgColors[1]};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <rect width="100%" height="100%" fill="none" stroke="${textColor}" stroke-width="2" stroke-opacity="0.2" />
      <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="24" fill="${textColor}" text-anchor="middle" font-weight="bold">
        ${title}
      </text>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" fill-opacity="0.7" text-anchor="middle">
        (${style} style placeholder)
      </text>
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

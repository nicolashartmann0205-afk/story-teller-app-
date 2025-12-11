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
    // Fallback content so the app doesn't crash/fail for the user
    return `[AI Generation Unavailable]\n\nTitle: ${title}\n\n${description}\n\n(Note: The AI service is currently experiencing high traffic. This is a placeholder draft based on your input. You can edit this story manually.)`;
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
  } = {}
): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Construct a comprehensive prompt
    let prompt = `You are a professional novelist. Write a full draft of a short story based on the following detailed outline.\n\n`;
    
    prompt += `TITLE: ${storyData.title}\n`;
    prompt += `PREMISE: ${storyData.description}\n\n`;

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
    prompt += `5. Output the story in Markdown format (headers for chapters/scenes if needed, but mostly prose).\n`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating full draft with Gemini:", error);
    throw new Error(`Failed to generate draft: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function improveText(text: string, type: "rewrite" | "expand" | "shorten" | "grammar"): Promise<string> {
   if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
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
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
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
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });
  
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
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });
  
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });

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

export async function generateBeatDraft(
  beat: any,
  storyContext: any,
  previousBeats: any[]
): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating beat draft with Gemini:", error);
    throw new Error("Failed to generate beat draft.");
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });

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

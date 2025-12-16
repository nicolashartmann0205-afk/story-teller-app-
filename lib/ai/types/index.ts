export interface StoryContext {
  storyId?: string;
  title?: string;
  storyType?: string;
  mode?: 'quick' | 'comprehensive';
  
  audience?: {
    primary: string;
    demographics?: string;
    emotionalGoal?: string;
    knowledgeLevel?: string;
  };
  purpose?: string;
  context?: string;
  
  character?: {
    primary: {
      archetype: string;
      name?: string;
      description?: string;
      voice?: string;
    };
    secondary?: {
      archetype: string;
      relationship: string;
    };
    motivations?: string[];
    fears?: string[];
  };
  
  conflict?: {
    central: string;
    opposing: string;
    type: string;
  };
  stakes?: string;
  
  structure?: {
    type: string;
    beats: Array<{
      name: string;
      description: string;
      position: number;
    }>;
  };
  
  moralConflict?: {
    primary: string;
    complexity: string;
    heroPosition: string;
    villainPosition: string;
  };
  
  scenes?: Array<{
    id: string;
    title: string;
    position: number;
    content?: string;
    movieTime?: {
      action: string;
      emotion: string;
      meaning: string;
    };
  }>;
  
  previousGenerations?: {
    hooks?: string[];
    drafts?: string[];
    userEdits?: string[];
  };
}

export interface GenerationParams {
  systemPrompt?: string;
  messages: Array<{ role: 'user' | 'system' | 'assistant'; content: string }>;
  maxTokens?: number;
  temperature?: number;
  retryCount?: number;
}

export interface GenerationResult {
  content: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  generationTime: number;
  model: string;
  stopReason?: string;
}

export interface HookGenerationParams {
  storyContext: StoryContext;
  hookTypes: ('unexpected' | 'knowledge' | 'story' | 'question' | 'emotional')[];
  count: number;
  tone?: 'professional' | 'conversational' | 'dramatic' | 'inspirational';
  maxLength?: number;
}

export interface HookResult {
  hooks: Array<{
    type: string;
    text: string;
    explanation: string;
    wordCount: number;
    tone: string;
  }>;
  grouped: Record<string, any[]>;
  generationTime: number;
  tokensUsed: number;
}

export interface SceneGenerationParams {
  storyContext: StoryContext;
  sceneData: {
    position: number;
    title: string;
    movieTime: {
      action: string;
      emotion: string;
      meaning: string;
    };
    characters: string[];
    setting?: string;
  };
  precedingScene?: string;
  followingScene?: string;
  style: 'show' | 'tell' | 'balanced';
  length: 'short' | 'medium' | 'long';
  pov: 'first_past' | 'third_past' | 'first_present' | 'third_present';
}

export interface SceneResult {
  prose: string;
  wordCount: number;
  readingTime: number;
  sensoryDetails: string[];
  dialogueCount: number;
  pacing: 'fast' | 'medium' | 'slow';
}

export interface FullDraftParams {
  storyData: StoryContext;
  preferences: {
    length: 'short' | 'medium' | 'long' | 'very_long';
    style: 'conversational' | 'professional' | 'dramatic' | 'inspirational';
    pov: string;
    tense: string;
    targetWordCount?: number;
  };
}

export interface FullDraftResult {
  draft: string;
  wordCount: number;
  readingTime: number;
  structure: {
    sections: number;
    paragraphs: number;
    avgWordsPerSection: number;
  };
  qualityMetrics: {
    hookStrength: number;
    characterConsistency: number;
    pacing: number;
    emotionalArc: number;
  };
}



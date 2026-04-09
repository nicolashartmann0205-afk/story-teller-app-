import { ImageProvider } from "./base";

/**
 * OpenAI DALL-E 3 image generation provider
 */
export class OpenAIProvider implements ImageProvider {
  name = "openai";
  displayName = "OpenAI DALL-E 3";
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  getCost(): number {
    return 0.04; // $0.04 per image for 1024x1024
  }

  getMetadata() {
    return {
      description: "OpenAI's DALL-E 3 for high-quality image generation",
      maxResolution: "1024x1024",
      requiresApiKey: true,
      pricing: "$0.04 per image (1024x1024)"
    };
  }

  async generate(prompt: string, style: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Enhance prompt with style modifiers
    const stylePrompts: Record<string, string> = {
      cinematic: "cinematic lighting, film quality, dramatic composition",
      watercolor: "watercolor painting style, soft edges, artistic",
      cyberpunk: "cyberpunk aesthetic, neon lights, futuristic",
      minimalist: "minimalist design, clean lines, simple",
      sketch: "pencil sketch style, hand-drawn, artistic",
      fantasy: "fantasy art, magical, epic composition",
      "oil-painting": "oil painting style, classical art, textured brushstrokes",
      "digital-art": "digital art, modern illustration, vibrant",
      anime: "anime style, Japanese animation aesthetic",
      realistic: "photorealistic, highly detailed, lifelike",
      storybook: "children's storybook illustration, whimsical",
      "comic-book": "comic book art style, bold lines, dynamic",
      impressionist: "impressionist painting style, visible brushstrokes",
      gothic: "gothic art style, dark atmosphere, Victorian",
      "nano-banana": "playful whimsical art, banana-inspired colors, fun and cheerful",
      "line-art": "bold line art illustration, clean ink outlines, minimal shading",
      noir: "film noir black and white, dramatic shadows, mystery atmosphere",
      vaporwave: "vaporwave aesthetic, neon pink cyan, retro 80s dreamscape",
      "pixel-art": "pixel art style, retro video game graphics, crisp pixels",
      claymation: "claymation stop-motion look, soft sculpted forms",
      "art-nouveau": "art nouveau decorative illustration, flowing organic lines",
      steampunk: "steampunk style, brass gears, Victorian sci-fi",
      "ukiyo-e": "ukiyo-e Japanese woodblock print style",
      papercraft: "paper cutout layered collage style",
      "stained-glass": "stained glass window art, luminous colored glass"
    };

    const styleModifier = stylePrompts[style] || stylePrompts.cinematic;
    const enhancedPrompt = `${prompt}. Style: ${styleModifier}. High quality, professional illustration.`;

    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard", // or "hd" for higher quality at $0.08/image
          response_format: "b64_json"
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const base64Image = data.data[0].b64_json;
      
      // Return as data URL
      return `data:image/png;base64,${base64Image}`;
    } catch (error) {
      console.error("OpenAI generation error:", error);
      throw error;
    }
  }
}


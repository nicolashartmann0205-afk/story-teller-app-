import { ImageProvider } from "./base";

/**
 * Stability AI (Stable Diffusion) image generation provider
 */
export class StabilityProvider implements ImageProvider {
  name = "stability";
  displayName = "Stability AI";
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.STABILITY_API_KEY;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  getCost(): number {
    return 0.01; // Approximately $0.01 per image
  }

  getMetadata() {
    return {
      description: "Stability AI's Stable Diffusion for creative image generation",
      maxResolution: "1024x1024",
      requiresApiKey: true,
      pricing: "~$0.01 per image (varies by model)"
    };
  }

  async generate(prompt: string, style: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Stability AI API key not configured");
    }

    // Enhance prompt with style-specific negative prompts and weights
    const styleConfigs: Record<string, { negativePrompt: string; stylePreset?: string }> = {
      cinematic: { negativePrompt: "cartoon, illustration, low quality", stylePreset: "cinematic" },
      watercolor: { negativePrompt: "photograph, digital, harsh edges", stylePreset: "analog-film" },
      cyberpunk: { negativePrompt: "nature, organic, soft", stylePreset: "neon-punk" },
      minimalist: { negativePrompt: "cluttered, detailed, busy, complex", stylePreset: "low-poly" },
      sketch: { negativePrompt: "photograph, color, painted", stylePreset: "line-art" },
      fantasy: { negativePrompt: "realistic, modern, mundane", stylePreset: "fantasy-art" },
      "oil-painting": { negativePrompt: "photograph, digital, smooth", stylePreset: "analog-film" },
      "digital-art": { negativePrompt: "traditional, pencil, sketch", stylePreset: "digital-art" },
      anime: { negativePrompt: "realistic, western cartoon, 3d", stylePreset: "anime" },
      realistic: { negativePrompt: "cartoon, illustration, stylized", stylePreset: "photographic" },
      storybook: { negativePrompt: "dark, scary, realistic", stylePreset: "comic-book" },
      "comic-book": { negativePrompt: "realistic, photograph, blurry", stylePreset: "comic-book" },
      impressionist: { negativePrompt: "sharp, detailed, photograph", stylePreset: "analog-film" },
      gothic: { negativePrompt: "bright, cheerful, modern", stylePreset: "cinematic" },
      "nano-banana": { negativePrompt: "dark, serious, realistic", stylePreset: "comic-book" }
    };

    const config = styleConfigs[style] || styleConfigs.cinematic;

    try {
      const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1
            },
            {
              text: config.negativePrompt,
              weight: -1
            }
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
          style_preset: config.stylePreset
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Stability AI API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      const base64Image = data.artifacts[0].base64;
      
      // Return as data URL
      return `data:image/png;base64,${base64Image}`;
    } catch (error) {
      console.error("Stability AI generation error:", error);
      throw error;
    }
  }
}


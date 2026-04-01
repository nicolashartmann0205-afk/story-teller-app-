import { ImageProvider } from "./base";
import { generateFallbackIllustration } from "../story-generator";

/**
 * Fallback placeholder provider - always available, generates SVG placeholders
 */
export class FallbackProvider implements ImageProvider {
  name = "fallback";
  displayName = "Placeholder";

  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  getCost(): number {
    return 0; // Free
  }

  getMetadata() {
    return {
      description: "Enhanced SVG placeholders with style-specific decorations",
      maxResolution: "512x512 (SVG)",
      requiresApiKey: false,
      pricing: "Free"
    };
  }

  async generate(prompt: string, style: string): Promise<string> {
    // Extract title from prompt if possible, otherwise use a generic title
    const title = prompt.length > 50 ? prompt.substring(0, 47) + "..." : prompt;
    return generateFallbackIllustration(title, style);
  }
}


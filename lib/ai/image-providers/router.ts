import { GenerationResult, ImageProvider } from "./base";
import { GeminiProvider } from "./gemini";
import { OpenAIProvider } from "./openai";
import { StabilityProvider } from "./stability";
import { FallbackProvider } from "./fallback";

/**
 * Provider router that tries multiple providers with automatic fallback
 */
export class ProviderRouter {
  private providers: ImageProvider[];

  constructor() {
    // Initialize all providers in priority order
    this.providers = [
      new GeminiProvider(),
      new OpenAIProvider(),
      new StabilityProvider(),
      new FallbackProvider() // Always last - always works
    ];
  }

  /**
   * Generate an image using the first available provider, with automatic fallback
   */
  async generateWithFallback(
    prompt: string,
    style: string,
    preferredProvider?: string
  ): Promise<GenerationResult> {
    // If a specific provider is requested, try it first
    if (preferredProvider) {
      const provider = this.providers.find(p => p.name === preferredProvider);
      if (provider) {
        try {
          if (await provider.isAvailable()) {
            console.log(`[ProviderRouter] Using preferred provider: ${provider.displayName}`);
            const imageUrl = await provider.generate(prompt, style);
            return {
              imageUrl,
              provider: provider.name,
              wasAutoFallback: false,
              cost: provider.getCost()
            };
          }
        } catch (error) {
          console.error(`[ProviderRouter] Preferred provider ${provider.displayName} failed:`, error);
          // Continue to fallback logic below
        }
      }
    }

    // Try each provider in order until one succeeds
    for (const provider of this.providers) {
      try {
        // Check if provider is available
        if (!(await provider.isAvailable())) {
          console.log(`[ProviderRouter] Skipping ${provider.displayName} - not available`);
          continue;
        }

        console.log(`[ProviderRouter] Trying ${provider.displayName}...`);
        const imageUrl = await provider.generate(prompt, style);
        
        const wasAutoFallback = provider.name === "fallback" || !!preferredProvider;
        
        return {
          imageUrl,
          provider: provider.name,
          wasAutoFallback,
          cost: provider.getCost()
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[ProviderRouter] ${provider.displayName} failed:`, errorMsg);
        
        // If it's the last provider (fallback), throw the error
        if (provider.name === "fallback") {
          throw new Error(`All providers failed. Last error: ${errorMsg}`);
        }
        
        // Otherwise, continue to next provider
        console.log(`[ProviderRouter] Falling back to next provider...`);
        continue;
      }
    }

    // This should never happen since fallback always works, but just in case
    throw new Error("No providers available");
  }

  /**
   * Get list of all available providers
   */
  async getAvailableProviders(): Promise<ImageProvider[]> {
    const available: ImageProvider[] = [];
    
    for (const provider of this.providers) {
      if (await provider.isAvailable()) {
        available.push(provider);
      }
    }
    
    return available;
  }

  /**
   * Get a specific provider by name
   */
  getProvider(name: string): ImageProvider | undefined {
    return this.providers.find(p => p.name === name);
  }
}

// Export a singleton instance
export const providerRouter = new ProviderRouter();


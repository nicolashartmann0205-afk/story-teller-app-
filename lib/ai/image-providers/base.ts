/**
 * Base interface for AI image generation providers
 */
export interface ImageProvider {
  /**
   * Unique name identifier for the provider
   */
  name: string;
  
  /**
   * Display name for UI
   */
  displayName: string;
  
  /**
   * Generate an image from a text prompt
   * @param prompt The text description of the desired image
   * @param style The artistic style to apply
   * @returns Base64 encoded data URL of the generated image
   */
  generate(prompt: string, style: string): Promise<string>;
  
  /**
   * Check if this provider is available and properly configured
   * @returns True if the provider can be used
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Get estimated cost per image (in USD)
   * @returns Cost in dollars, or 0 for free/placeholder providers
   */
  getCost(): number;
  
  /**
   * Get provider-specific metadata
   */
  getMetadata(): {
    description: string;
    maxResolution: string;
    requiresApiKey: boolean;
    pricing: string;
  };
}

/**
 * Result of an image generation attempt
 */
export interface GenerationResult {
  /**
   * Base64 encoded data URL of the generated image
   */
  imageUrl: string;
  
  /**
   * Name of the provider that generated the image
   */
  provider: string;
  
  /**
   * Whether this was an automatic fallback due to provider failure
   */
  wasAutoFallback: boolean;
  
  /**
   * Cost of the generation (if applicable)
   */
  cost?: number;
}

/**
 * Provider configuration options
 */
export interface ProviderConfig {
  /**
   * API key for the provider (if required)
   */
  apiKey?: string;
  
  /**
   * Custom endpoint URL (optional)
   */
  endpoint?: string;
  
  /**
   * Whether this provider is enabled
   */
  enabled: boolean;
  
  /**
   * Priority order (lower number = higher priority)
   */
  priority: number;
}


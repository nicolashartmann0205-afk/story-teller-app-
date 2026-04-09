import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { ImageProvider } from "./base";

const MODEL_NAME = "gemini-2.0-flash-exp";

// Style-specific modifiers for better quality
const styleModifiers: Record<string, string> = {
  cinematic: "dramatic lighting, film-quality composition, depth of field, atmospheric, cinematic framing, professional color grading",
  watercolor: "soft edges, flowing colors, artistic brushstrokes, paper texture, delicate transparency, impressionistic details",
  cyberpunk: "neon lights, high contrast, futuristic elements, digital aesthetics, glowing effects, urban sci-fi atmosphere",
  minimalist: "clean lines, simple shapes, negative space, modern design, elegant composition, sophisticated color palette",
  sketch: "hand-drawn quality, pencil textures, crosshatching, artistic linework, sketch aesthetics, detailed shading",
  fantasy: "magical atmosphere, rich colors, mythical elements, enchanting details, epic scale, fantastical composition",
  "oil-painting": "canvas texture, visible brushstrokes, museum quality, rich pigments, classical painting techniques, masterful composition",
  "digital-art": "crisp details, modern illustration, vibrant colors, professional digital painting, contemporary style, polished finish",
  anime: "Japanese animation style, expressive features, dynamic poses, vibrant colors, manga-inspired, clean linework",
  realistic: "photorealistic details, accurate proportions, natural lighting, lifelike textures, high fidelity, true-to-life rendering",
  storybook: "whimsical charm, children's book quality, warm colors, inviting composition, narrative illustration, friendly aesthetic",
  "comic-book": "bold linework, dynamic composition, action-oriented, graphic novel quality, dramatic angles, pop art influence",
  impressionist: "visible brushstrokes, light and color emphasis, artistic interpretation, painterly quality, atmospheric mood",
  gothic: "dark atmosphere, dramatic shadows, mysterious mood, ornate details, haunting beauty, Victorian influence",
  "nano-banana": "playful whimsical style, smooth organic curves, warm yellow palette, banana-inspired color scheme, friendly aesthetic, fun composition, lighthearted mood, curved shapes, cheerful atmosphere, artistic cartoonish quality",
  "line-art": "bold clean ink outlines, editorial illustration, limited or flat fill, confident strokes, graphic clarity",
  noir: "high contrast black and white, venetian blind shadows, 1940s mystery film, dramatic chiaroscuro, rain-slick streets mood",
  vaporwave: "synthwave palette, retro grid horizon, neon pink and cyan, chrome reflections, 1980s nostalgia, dreamy digital haze",
  "pixel-art": "retro game aesthetic, visible pixel grid, limited color palette, crisp dithering, 16-bit charm, nostalgic sprites",
  claymation: "stop-motion clay look, soft rounded forms, fingerprint texture, warm studio lighting, tactile handmade charm",
  "art-nouveau": "flowing organic lines, decorative borders, elegant curves, botanical motifs, Mucha-inspired elegance",
  steampunk: "brass and copper tones, Victorian machinery, gears and rivets, steam-era invention, industrial romance",
  "ukiyo-e": "Japanese woodblock print style, flat color planes, bold outlines, traditional composition, subtle paper grain",
  papercraft: "layered paper cutouts, soft cast shadows, craft aesthetic, tactile depth, clean edges",
  "stained-glass": "vibrant glass panels, dark lead lines, cathedral light, luminous jewel tones, sacred geometry"
};

/**
 * Google Gemini AI image generation provider
 */
export class GeminiProvider implements ImageProvider {
  name = "gemini";
  displayName = "Google Gemini";
  private apiKey: string | undefined;
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey && !!this.genAI;
  }

  getCost(): number {
    return 0; // Free tier available
  }

  getMetadata() {
    return {
      description: "Google's Gemini AI for SVG generation",
      maxResolution: "512x512 (SVG)",
      requiresApiKey: true,
      pricing: "Free tier: 20 requests per minute"
    };
  }

  async generate(prompt: string, style: string): Promise<string> {
    if (!this.genAI) {
      throw new Error("Gemini API not configured");
    }

    const model = this.genAI.getGenerativeModel({ model: MODEL_NAME });
    const styleEnhancement = styleModifiers[style] || styleModifiers.cinematic;

    const svgPrompt = `You are a world-class AI artist and master vector graphics designer specializing in high-quality, professional illustrations.

Create an exceptional, detailed, award-winning SVG illustration for this scene:

"${prompt}"

STYLE: ${style}
QUALITY REQUIREMENTS: ${styleEnhancement}, high quality, masterpiece, professional illustration, sharp focus, vivid colors, detailed composition, visually stunning, artistic excellence

TECHNICAL SPECIFICATIONS:
- Output ONLY valid SVG code - no markdown, no explanations
- Use viewBox="0 0 512 512" for optimal scaling
- Employ advanced SVG techniques: complex gradients, clipping paths, filters, sophisticated shapes
- Create depth through layering and careful use of opacity
- Use rich color palettes appropriate to the style
- Minimize or exclude text; communicate through visual storytelling
- Ensure professional-grade visual quality that could be used for publication

Focus on creating a visually impressive, memorable image that captures the essence and emotion of the scene.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: svgPrompt }] }],
      generationConfig: {
        temperature: 1.0,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192, // Allow more detailed SVG
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const response = await result.response;
    let svgCode = response.text();

    // Clean up the response
    svgCode = svgCode.replace(/```svg\n?/g, "").replace(/```\n?/g, "").trim();

    // Validate it's SVG
    if (!svgCode.includes("<svg") || !svgCode.includes("</svg>")) {
      throw new Error("Generated content is not valid SVG");
    }

    // Convert to base64 data URL
    const base64 = Buffer.from(svgCode).toString("base64");
    return `data:image/svg+xml;base64,${base64}`;
  }
}


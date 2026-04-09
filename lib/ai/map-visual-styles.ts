/**
 * Visual styles for story map scene illustrations (passed to image providers).
 * Keep IDs in sync with style maps in `lib/ai/image-providers/*.ts` and fallback palettes in `story-generator.ts`.
 */
export const DEFAULT_MAP_VISUAL_STYLE = "cinematic";

export type MapVisualStyleOption = {
  id: string;
  label: string;
  hint: string;
};

export const MAP_VISUAL_STYLE_OPTIONS: MapVisualStyleOption[] = [
  { id: "cinematic", label: "Cinematic", hint: "Film lighting, dramatic framing" },
  { id: "watercolor", label: "Watercolor", hint: "Soft washes, paper texture" },
  { id: "cyberpunk", label: "Cyberpunk", hint: "Neon, futuristic city mood" },
  { id: "minimalist", label: "Minimalist", hint: "Clean shapes, negative space" },
  { id: "sketch", label: "Sketch", hint: "Pencil / hand-drawn" },
  { id: "line-art", label: "Line art", hint: "Bold ink outlines" },
  { id: "fantasy", label: "Fantasy", hint: "Epic, magical atmosphere" },
  { id: "oil-painting", label: "Oil painting", hint: "Brushstroke richness" },
  { id: "digital-art", label: "Digital art", hint: "Modern illustration polish" },
  { id: "anime", label: "Anime", hint: "Japanese animation look" },
  { id: "realistic", label: "Realistic", hint: "Photoreal detail" },
  { id: "storybook", label: "Storybook", hint: "Warm narrative illustration" },
  { id: "comic-book", label: "Comic book", hint: "Bold panels, dynamic ink" },
  { id: "impressionist", label: "Impressionist", hint: "Light, painterly mood" },
  { id: "gothic", label: "Gothic", hint: "Dark ornate mood" },
  { id: "noir", label: "Film noir", hint: "High-contrast B&W mystery" },
  { id: "vaporwave", label: "Vaporwave", hint: "Retro neon dreamscape" },
  { id: "pixel-art", label: "Pixel art", hint: "Retro game aesthetic" },
  { id: "claymation", label: "Claymation", hint: "Stop-motion clay" },
  { id: "art-nouveau", label: "Art nouveau", hint: "Flowing decorative lines" },
  { id: "steampunk", label: "Steampunk", hint: "Brass, gears, Victorian tech" },
  { id: "ukiyo-e", label: "Ukiyo-e", hint: "Japanese woodblock print" },
  { id: "papercraft", label: "Papercraft", hint: "Layered cut-paper" },
  { id: "stained-glass", label: "Stained glass", hint: "Luminous color panels" },
  { id: "nano-banana", label: "Nano banana", hint: "Playful warm palette" },
];
